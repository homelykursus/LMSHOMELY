import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch landing course by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await prisma.landingCourse.findUnique({
      where: { 
        slug: params.slug,
        isActive: true // Only return active courses
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Helper function to safely parse JSON fields
    const parseJsonField = (field: any) => {
      if (!field) return null;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.error('Error parsing JSON field:', e);
          return null;
        }
      }
      return field;
    };

    // Parse JSON fields if they are strings
    const parsedCourse = {
      ...course,
      curriculum: parseJsonField(course.curriculum),
      benefits: parseJsonField(course.benefits),
      targetAudience: parseJsonField(course.targetAudience),
      software: parseJsonField(course.software),
    };

    return NextResponse.json(parsedCourse);
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
