import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const courses = await prisma.course.findMany({
      where: {
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        category: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error: any) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}