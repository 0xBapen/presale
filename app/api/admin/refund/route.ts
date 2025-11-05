import { NextRequest, NextResponse } from 'next/server';
import { escrowManager } from '@/lib/x402/escrow';
import prisma from '@/lib/prisma';

// POST /api/admin/refund - Refund all investors for a failed presale
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

    // Check presale status
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
    });

    if (!presale) {
      return NextResponse.json(
        { error: 'Presale not found' },
        { status: 404 }
      );
    }

    // Mark presale as failed first
    if (presale.status !== 'FAILED') {
      await prisma.presale.update({
        where: { id: presaleId },
        data: { status: 'FAILED' },
      });
    }

    // Process refunds
    const result = await escrowManager.refundInvestors(presaleId);

    return NextResponse.json({
      ...result,
      message: `Refunded ${result.refundCount} investors, total: $${result.totalRefunded}`,
    });
  } catch (error: any) {
    console.error('Failed to process refunds:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process refunds' },
      { status: 500 }
    );
  }
}

