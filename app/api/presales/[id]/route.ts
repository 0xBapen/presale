import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/presales/[id] - Get presale details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presale = await prisma.presale.findUnique({
      where: { id: params.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        investments: {
          where: { status: 'CONFIRMED' },
          select: {
            amount: true,
            createdAt: true,
            investorWallet: true,
          },
        },
      },
    });

    if (!presale) {
      return NextResponse.json(
        { error: 'Presale not found' },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = (presale.currentRaised / presale.hardCap) * 100;
    const timeRemaining = new Date(presale.endDate).getTime() - Date.now();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      ...presale,
      progress,
      daysRemaining,
    });
  } catch (error) {
    console.error('Failed to fetch presale:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presale' },
      { status: 500 }
    );
  }
}

// PATCH /api/presales/[id] - Update presale (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // TODO: Add admin authentication check

    const presale = await prisma.presale.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(presale);
  } catch (error) {
    console.error('Failed to update presale:', error);
    return NextResponse.json(
      { error: 'Failed to update presale' },
      { status: 500 }
    );
  }
}

