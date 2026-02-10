import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET active hero (for landing page)
export async function GET() {
  try {
    const hero = await db.heroSection.findFirst({
      where: { isActive: true }
    });

    if (!hero) {
      return NextResponse.json(
        { error: 'No active hero found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching active hero:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active hero' },
      { status: 500 }
    );
  }
}
