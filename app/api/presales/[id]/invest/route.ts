import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { x402Client, X402PaymentPayload } from '@/lib/x402/client';
import { z } from 'zod';

const InvestmentRequestSchema = z.object({
  investorWallet: z.string().min(32),
  amount: z.number().min(10),
});

const PaymentVerificationSchema = z.object({
  investorWallet: z.string().min(32),
  transactionHash: z.string(),
  amount: z.string(),
  network: z.string(),
  token: z.string(),
  timestamp: z.number(),
});

// POST /api/presales/[id]/invest - Initiate investment (returns 402 with payment instructions)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if this is a payment verification or initial request
    if ('transactionHash' in body) {
      return await verifyPayment(params.id, body);
    }

    return await initiateInvestment(params.id, body);
  } catch (error) {
    console.error('Investment error:', error);
    return NextResponse.json(
      { error: 'Investment failed' },
      { status: 500 }
    );
  }
}

async function initiateInvestment(presaleId: string, body: any) {
  const validated = InvestmentRequestSchema.parse(body);

  // Get presale details
  const presale = await prisma.presale.findUnique({
    where: { id: presaleId },
  });

  if (!presale) {
    return NextResponse.json(
      { error: 'Presale not found' },
      { status: 404 }
    );
  }

  // Validate presale status
  if (presale.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Presale is not active' },
      { status: 400 }
    );
  }

  // Validate dates
  const now = new Date();
  if (now < presale.startDate) {
    return NextResponse.json(
      { error: 'Presale has not started yet' },
      { status: 400 }
    );
  }

  if (now > presale.endDate) {
    return NextResponse.json(
      { error: 'Presale has ended' },
      { status: 400 }
    );
  }

  // Check investment limits
  if (validated.amount < presale.minInvestment) {
    return NextResponse.json(
      { error: `Minimum investment is ${presale.minInvestment}` },
      { status: 400 }
    );
  }

  if (presale.maxInvestment && validated.amount > presale.maxInvestment) {
    return NextResponse.json(
      { error: `Maximum investment is ${presale.maxInvestment}` },
      { status: 400 }
    );
  }

  // Check if hard cap would be exceeded
  if (presale.currentRaised + validated.amount > presale.hardCap) {
    const remaining = presale.hardCap - presale.currentRaised;
    return NextResponse.json(
      { error: `Only ${remaining} remaining in presale` },
      { status: 400 }
    );
  }

  // Check existing investment from this wallet
  const existingInvestment = await prisma.investment.findUnique({
    where: {
      presaleId_investorWallet: {
        presaleId,
        investorWallet: validated.investorWallet,
      },
    },
  });

  if (existingInvestment && presale.maxInvestment) {
    const totalInvestment = existingInvestment.amount + validated.amount;
    if (totalInvestment > presale.maxInvestment) {
      return NextResponse.json(
        { 
          error: `Total investment would exceed maximum of ${presale.maxInvestment}`,
          currentInvestment: existingInvestment.amount,
        },
        { status: 400 }
      );
    }
  }

  // Generate x402 payment instructions
  const paymentInstructions = await x402Client.generatePaymentInstructions(
    presaleId,
    validated.amount,
    presale.escrowWallet || process.env.PLATFORM_WALLET_ADDRESS!,
    process.env.PAYMENT_NETWORK,
    process.env.PAYMENT_TOKEN
  );

  // Create pending investment record
  const investment = await prisma.investment.create({
    data: {
      presaleId,
      investorWallet: validated.investorWallet,
      amount: validated.amount,
      status: 'PENDING',
    },
  });

  // Return 402 Payment Required with instructions
  return NextResponse.json(
    {
      error: 'Payment Required',
      message: 'Please complete payment to invest in this presale',
      investmentId: investment.id,
      paymentInstructions,
    },
    {
      status: 402,
      headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Instructions': JSON.stringify(paymentInstructions),
      },
    }
  );
}

async function verifyPayment(presaleId: string, body: any) {
  const validated = PaymentVerificationSchema.parse(body);

  // Verify payment through x402 facilitator
  const paymentPayload: X402PaymentPayload = {
    transactionHash: validated.transactionHash,
    from: validated.investorWallet,
    to: process.env.PLATFORM_WALLET_ADDRESS!,
    amount: validated.amount,
    network: validated.network,
    token: validated.token,
    timestamp: validated.timestamp,
  };

  const verification = await x402Client.verifyPayment(paymentPayload);

  if (!verification.success || !verification.verified) {
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 400 }
    );
  }

  // Update investment status
  const investment = await prisma.investment.findFirst({
    where: {
      presaleId,
      investorWallet: validated.investorWallet,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!investment) {
    return NextResponse.json(
      { error: 'Investment not found' },
      { status: 404 }
    );
  }

  // Update investment
  const updatedInvestment = await prisma.investment.update({
    where: { id: investment.id },
    data: {
      status: 'CONFIRMED',
      transactionHash: validated.transactionHash,
      x402PaymentId: verification.paymentId,
    },
  });

  // Update presale stats
  const presale = await prisma.presale.update({
    where: { id: presaleId },
    data: {
      currentRaised: {
        increment: investment.amount,
      },
      investorCount: {
        increment: 1,
      },
    },
  });

  // Record escrow transaction
  await prisma.escrowTransaction.create({
    data: {
      presaleId,
      type: 'DEPOSIT',
      amount: investment.amount,
      fromWallet: validated.investorWallet,
      toWallet: process.env.PLATFORM_WALLET_ADDRESS!,
      transactionHash: validated.transactionHash,
    },
  });

  // Check if presale reached hard cap
  if (presale.currentRaised >= presale.hardCap) {
    await prisma.presale.update({
      where: { id: presaleId },
      data: { status: 'FUNDED' },
    });
  }

  return NextResponse.json({
    success: true,
    investment: updatedInvestment,
    presale: {
      currentRaised: presale.currentRaised,
      progress: (presale.currentRaised / presale.hardCap) * 100,
    },
  });
}

// GET /api/presales/[id]/invest - Get investment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const investment = await prisma.investment.findUnique({
      where: {
        presaleId_investorWallet: {
          presaleId: params.id,
          investorWallet: wallet,
        },
      },
    });

    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Failed to fetch investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    );
  }
}

