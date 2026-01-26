import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, courseType, basePrice, discountRate } = body;

    const pricing = await db.coursePricing.create({
      data: {
        courseId,
        courseType,
        basePrice,
        discountRate
      }
    });

    return NextResponse.json(pricing, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, courseType, basePrice, discountRate, isActive } = body;

    const pricing = await db.coursePricing.update({
      where: { id },
      data: {
        courseType,
        basePrice,
        discountRate,
        isActive
      }
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}