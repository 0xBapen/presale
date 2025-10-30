import { NextRequest, NextResponse } from 'next/server';
import { escrowManager } from '@/lib/x402/escrow';
import prisma from '@/lib/prisma';

// GET /api/admin/escrow - Get escrow status and balances
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const { searchParams } = new URL(request.url);
    const presaleId = searchParams.get('presaleId');

    if (presaleId) {
      // Get specific presale escrow balance
      const balance = await escrowManager.verifyEscrowBalance(presaleId);
      return NextResponse.json(balance);
    }

    // Get all presales with escrow info
    const presales = await prisma.presale.findMany({
      where: {
        status: { in: ['ACTIVE', 'FUNDED'] },
      },
      include: {
        investments: {
          where: { status: 'CONFIRMED' },
        },
        _count: {
          select: { investments: true },
        },
      },
    });

    const escrowInfo = presales.map((presale) => ({
      id: presale.id,
      projectName: presale.projectName,
      status: presale.status,
      expectedBalance: presale.investments.reduce(
        (sum, inv) => sum + inv.amount,
        0
      ),
      currentRaised: presale.currentRaised,
      investorCount: presale.investorCount,
    }));

    return NextResponse.json({ escrowInfo });
  } catch (error) {
    console.error('Failed to fetch escrow info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escrow info' },
      { status: 500 }
    );
  }
}

// POST /api/admin/escrow/release - Release funds to project team
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const body = await request.json();
    const { presaleId, milestoneId } = body;

    if (!presaleId) {
      return NextResponse.json(
        { error: 'Presale ID required' },
        { status: 400 }
      );
    }

    // Release funds
    const result = await escrowManager.releaseFunds(presaleId, milestoneId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Failed to release funds:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to release funds' },
      { status: 500 }
    );
  }
}

