import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET active facilities (for landing page)
export async function GET() {
  try {
    const facilities = await db.facility.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching active facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active facilities' },
      { status: 500 }
    );
  }
}
