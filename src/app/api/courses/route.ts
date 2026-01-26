import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const courses = await db.course.findMany({
      include: {
        pricing: {
          where: { isActive: true }
        },
        students: {
          select: {
            id: true,
            name: true,
            finalPrice: true,
            discount: true,
            courseType: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, category, pricing } = body;

    const course = await db.course.create({
      data: {
        name,
        description,
        duration,
        category,
        pricing: {
          create: pricing
        }
      },
      include: {
        pricing: true
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}