import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all testimonials
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, course, rating, comment, photo, order, isActive } = body;

    // Validate required fields
    if (!name || !course || !rating || !comment) {
      return NextResponse.json(
        { error: 'Name, course, rating, and comment are required' },
        { status: 400 }
      );
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const testimonial = await db.testimonial.create({
      data: {
        name,
        course,
        rating,
        comment,
        photo: photo || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: 'admin' // TODO: Get from session
      }
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
