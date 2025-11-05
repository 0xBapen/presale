import { NextRequest, NextResponse } from 'next/server';
import { twoWayEscrow } from '@/lib/escrow/two-way-escrow';
import prisma from '@/lib/prisma';

/**
 * AUTOMATED CRON JOB
 * 
 * This endpoint should be called periodically (e.g., every hour) to:
 * 1. Check for presales that reached their deadline
 * 2. Automatically execute success/failure swaps
 * 
 * Setup with Render Cron Jobs or external cron service like cron-job.org
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      checked: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Find presales that have ended and are ACTIVE or FUNDED
    const endedPresales = await prisma.presale.findMany({
      where: {
        endDate: {
          lte: now, // Deadline passed
        },
        status: {
          in: ['ACTIVE', 'FUNDED'],
        },
      },
      include: {
        investments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    console.log(`🔍 Found ${endedPresales.length} presales to check...`);

    for (const presale of endedPresales) {
      results.checked++;

      try {
        const softCap = presale.softCap || presale.targetAmount * 0.5; // Default 50% soft cap
        const reachedSoftCap = presale.currentRaised >= softCap;

        if (reachedSoftCap) {
          // ✅ SUCCESS: Execute successful presale swap
          console.log(`✅ Presale ${presale.id} succeeded! Executing swap...`);

          // Update status to FUNDED first
          await prisma.presale.update({
            where: { id: presale.id },
            data: { status: 'FUNDED' },
          });

          // Execute two-way swap: USDC → Dev, Tokens → Investors
          const swapResult = await twoWayEscrow.executeSuccessfulPresaleSwap(presale.id);

          results.succeeded++;
          console.log(`✅ Swap completed:`, swapResult);
        } else {
          // ❌ FAILURE: Execute refund
          console.log(`❌ Presale ${presale.id} failed. Executing refunds...`);

          // Execute refund: USDC → Investors, Tokens → Dev
          const refundResult = await twoWayEscrow.executeFailedPresaleRefund(presale.id);

          results.failed++;
          console.log(`✅ Refunds completed:`, refundResult);
        }
      } catch (error: any) {
        console.error(`❌ Error processing presale ${presale.id}:`, error);
        results.errors.push(`${presale.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
      message: `Processed ${results.checked} presales: ${results.succeeded} succeeded, ${results.failed} failed`,
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual trigger
export async function POST(request: NextRequest) {
  return GET(request);
}







