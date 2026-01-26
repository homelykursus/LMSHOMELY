import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const courses = await db.course.findMany({
      where: { isActive: true },
      include: {
        pricing: {
          where: { isActive: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching active courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active courses' },
      { status: 500 }
    );
  }
}