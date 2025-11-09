import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get total raised from all presales
    const totalRaisedResult = await prisma.presale.aggregate({
      _sum: {
        currentRaised: true,
      },
    });

    // Get count of unique investors
    const uniqueInvestors = await prisma.investment.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'CLAIMED'],
        },
      },
      select: {
        investorWallet: true,
      },
      distinct: ['investorWallet'],
    });

    // Get active presales count
    const activePresales = await prisma.presale.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get all presales count for success rate calculation
    const completedPresales = await prisma.presale.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const failedPresales = await prisma.presale.count({
      where: {
        status: 'FAILED',
      },
    });

    // Calculate success rate
    const totalFinished = completedPresales + failedPresales;
    const successRate = totalFinished > 0 
      ? Math.round((completedPresales / totalFinished) * 100) 
      : 0;

    // Get total presales ever created
    const totalPresales = await prisma.presale.count();

    const stats = {
      totalRaised: totalRaisedResult._sum.currentRaised || 0,
      investors: uniqueInvestors.length,
      activePresales,
      successRate,
      completedPresales,
      failedPresales,
      totalPresales,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics',
        totalRaised: 0,
        investors: 0,
        activePresales: 0,
        successRate: 0,
        completedPresales: 0,
        failedPresales: 0,
        totalPresales: 0,
      },
      { status: 500 }
    );
  }
}

