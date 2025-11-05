import { NextRequest, NextResponse } from 'next/server';
import { twoWayEscrow } from '@/lib/escrow/two-way-escrow';

// GET /api/presales/:id/escrow - Check if tokens are deposited
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presaleId = params.id;

    const status = await twoWayEscrow.verifyTokenDeposit(presaleId);

    return NextResponse.json({
      success: true,
      ...status,
      message: status.tokensDeposited
        ? '✅ Tokens deposited! Presale is ready.'
        : '⏳ Waiting for token deposit...',
    });
  } catch (error: any) {
    console.error('Failed to check escrow status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check escrow status' },
      { status: 500 }
    );
  }
}

// POST /api/presales/:id/escrow/deposit-info - Get deposit instructions for dev
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presaleId = params.id;

    const depositInfo = await twoWayEscrow.getTokenDepositAddress(presaleId);

    return NextResponse.json({
      success: true,
      ...depositInfo,
    });
  } catch (error: any) {
    console.error('Failed to get deposit info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get deposit info' },
      { status: 500 }
    );
  }
}







