import { NextRequest, NextResponse } from 'next/server';
import { twoWayEscrow } from '@/lib/escrow/two-way-escrow';

/**
 * Manual trigger for failed presale refunds
 * Use this if cron job fails or you need to manually execute
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication

    const body = await request.json();
    const { presaleId } = body;

    if (!presaleId) {
      return NextResponse.json(
        { error: 'Presale ID required' },
        { status: 400 }
      );
    }

    const result = await twoWayEscrow.executeFailedPresaleRefund(presaleId);

    return NextResponse.json({
      ...result,
      message: 'Successfully executed refunds',
    });
  } catch (error: any) {
    console.error('Failed to execute refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute refund' },
      { status: 500 }
    );
  }
}







