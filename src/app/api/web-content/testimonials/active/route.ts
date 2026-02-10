import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET active testimonials for landing page
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching active testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active testimonials' },
      { status: 500 }
    );
  }
}
