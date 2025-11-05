import { NextRequest, NextResponse } from 'next/server';
import { tokenDistributor } from '@/lib/token/distribution';
import prisma from '@/lib/prisma';

// POST /api/admin/distribute - Distribute tokens to investors when presale succeeds
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const body = await request.json();
    const { presaleId } = body;

    if (!presaleId) {
      return NextResponse.json(
        { error: 'Presale ID required' },
        { status: 400 }
      );
    }

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

    if (!presale.tokenAddress) {
      return NextResponse.json(
        { error: 'Token address not set for this presale' },
        { status: 400 }
      );
    }

    if (presale.status !== 'FUNDED') {
      return NextResponse.json(
        { error: 'Presale must be FUNDED to distribute tokens' },
        { status: 400 }
      );
    }

    // Distribute tokens
    const result = await tokenDistributor.distributeTokens({
      presaleId,
      tokenMintAddress: presale.tokenAddress,
      tokenDecimals: presale.tokenDecimals,
    });

    return NextResponse.json({
      ...result,
      message: `Successfully distributed tokens to ${result.distributed} investors`,
    });
  } catch (error: any) {
    console.error('Failed to distribute tokens:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to distribute tokens' },
      { status: 500 }
    );
  }
}

// GET /api/admin/distribute?presaleId=xxx - Check distribution status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presaleId = searchParams.get('presaleId');

    if (!presaleId) {
      return NextResponse.json(
        { error: 'Presale ID required' },
        { status: 400 }
      );
    }

    const distributions = await prisma.tokenDistribution.findMany({
      where: {
        investment: {
          presaleId,
        },
      },
      include: {
        investment: {
          select: {
            investorWallet: true,
            amount: true,
          },
        },
      },
    });

    const totalInvestments = await prisma.investment.count({
      where: { presaleId, status: 'CONFIRMED' },
    });

    return NextResponse.json({
      totalInvestors: totalInvestments,
      distributed: distributions.length,
      pending: totalInvestments - distributions.length,
      distributions: distributions.map(d => ({
        investorWallet: d.investment.investorWallet,
        investedAmount: d.investment.amount,
        tokensReceived: d.tokenAmount,
        transactionHash: d.transactionHash,
        distributedAt: d.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Failed to get distribution status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get distribution status' },
      { status: 500 }
    );
  }
}







