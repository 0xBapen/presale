import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { x402Client, X402PaymentPayload } from '@/lib/x402/client';
import { PLATFORM_CONFIG } from '@/lib/config';
import { z } from 'zod';

const CreatePresaleSchema = z.object({
  projectName: z.string().min(3),
  ticker: z.string().min(2).max(10),
  description: z.string().min(50),
  pitchDeck: z.string().url().optional(),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
  discord: z.string().optional(),
  telegram: z.string().optional(),
  teamName: z.string().min(3),
  teamDescription: z.string().optional(),
  teamWallet: z.string().min(32),
  targetAmount: z.number().min(1000),
  minInvestment: z.number().min(10),
  maxInvestment: z.number().optional(),
  softCap: z.number().optional(),
  hardCap: z.number().min(1000),
  tokenomicsType: z.enum(['FAIR_LAUNCH', 'VESTED', 'LINEAR_UNLOCK', 'CLIFF_UNLOCK']),
  totalSupply: z.string(),
  presaleAllocation: z.number().min(1).max(100),
  liquidityAllocation: z.number().min(0).max(100).optional(),
  teamAllocation: z.number().min(0).max(100).optional(),
  vestingPeriod: z.number().optional(),
  cliffPeriod: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  tokenAddress: z.string().optional(),
  tokenDecimals: z.number().default(9),
  tags: z.array(z.string()).optional(),
});

// GET /api/presales - List all presales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = {};
    
    if (status) {
      where.status = status;
    } else {
      // Default: show active presales
      where.status = { in: ['ACTIVE', 'FUNDED'] };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const [presales, total] = await Promise.all([
      prisma.presale.findMany({
        where,
        include: {
          milestones: true,
          _count: {
            select: { investments: true },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.presale.count({ where }),
    ]);

    return NextResponse.json({
      presales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch presales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presales' },
      { status: 500 }
    );
  }
}

// POST /api/presales - Create a new presale (requires x402 payment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is payment verification or initial request
    if ('transactionHash' in body && 'creatorWallet' in body) {
      return await verifyPresaleCreationPayment(body);
    }
    
    // Initial presale creation request - return 402
    return await initiatePresaleCreation(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create presale:', error);
    return NextResponse.json(
      { error: 'Failed to create presale' },
      { status: 500 }
    );
  }
}

async function initiatePresaleCreation(body: any) {
  // Validate presale data
  const validated = CreatePresaleSchema.parse(body);
  
  if (!body.creatorWallet) {
    return NextResponse.json(
      { error: 'Creator wallet address required' },
      { status: 400 }
    );
  }

  // Validate dates
  const startDate = new Date(validated.startDate);
  const endDate = new Date(validated.endDate);

  if (startDate >= endDate) {
    return NextResponse.json(
      { error: 'End date must be after start date' },
      { status: 400 }
    );
  }

  if (startDate < new Date()) {
    return NextResponse.json(
      { error: 'Start date must be in the future' },
      { status: 400 }
    );
  }

  // Validate tokenomics percentages
  const totalAllocation = 
    validated.presaleAllocation +
    (validated.liquidityAllocation || 0) +
    (validated.teamAllocation || 0);

  if (totalAllocation > 100) {
    return NextResponse.json(
      { error: 'Total allocation cannot exceed 100%' },
      { status: 400 }
    );
  }

  // Generate x402 payment instructions for presale creation fee
  const paymentInstructions = await x402Client.generatePaymentInstructions(
    `presale-creation-${Date.now()}`,
    PLATFORM_CONFIG.PRESALE_CREATION_FEE,
    PLATFORM_CONFIG.PLATFORM_WALLET,
    PLATFORM_CONFIG.PAYMENT_NETWORK,
    PLATFORM_CONFIG.PAYMENT_TOKEN
  );

  // Store presale data temporarily (will be created after payment)
  // In production, use Redis or similar for temporary storage
  // For now, we'll expect the client to resend the data with payment proof

  // Return 402 Payment Required
  return NextResponse.json(
    {
      error: 'Payment Required',
      message: `Pay ${PLATFORM_CONFIG.PRESALE_CREATION_FEE} ${PLATFORM_CONFIG.PAYMENT_TOKEN} to create presale`,
      creationFee: PLATFORM_CONFIG.PRESALE_CREATION_FEE,
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

async function verifyPresaleCreationPayment(body: any) {
  const { creatorWallet, transactionHash, ...presaleData } = body;
  
  // Validate presale data
  const validated = CreatePresaleSchema.parse(presaleData);

  // Verify payment through x402 facilitator
  const paymentPayload: X402PaymentPayload = {
    transactionHash,
    from: creatorWallet,
    to: PLATFORM_CONFIG.PLATFORM_WALLET,
    amount: PLATFORM_CONFIG.PRESALE_CREATION_FEE.toString(),
    network: PLATFORM_CONFIG.PAYMENT_NETWORK,
    token: PLATFORM_CONFIG.PAYMENT_TOKEN,
    timestamp: Date.now(),
  };

  const verification = await x402Client.verifyPayment(paymentPayload);

  if (!verification.success || !verification.verified) {
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 400 }
    );
  }

  // Payment verified - create presale
  const startDate = new Date(validated.startDate);
  const endDate = new Date(validated.endDate);

  const presale = await prisma.presale.create({
    data: {
      ...validated,
      startDate,
      endDate,
      status: 'DRAFT', // Admin needs to approve
    },
  });

  // Record creation fee payment
  await prisma.escrowTransaction.create({
    data: {
      presaleId: presale.id,
      type: 'CREATION_FEE',
      amount: PLATFORM_CONFIG.PRESALE_CREATION_FEE,
      fromWallet: creatorWallet,
      toWallet: PLATFORM_CONFIG.PLATFORM_WALLET,
      transactionHash,
    },
  });

  return NextResponse.json({
    success: true,
    presale,
    message: 'Presale created successfully! Awaiting admin approval.',
  }, { status: 201 });
}

