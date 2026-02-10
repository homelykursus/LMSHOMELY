import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch only active location info
export async function GET() {
  try {
    const location = await prisma.locationInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching active location info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active location info' },
      { status: 500 }
    );
  }
}
