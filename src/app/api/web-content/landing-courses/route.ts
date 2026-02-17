import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all landing courses or single course by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const slug = searchParams.get('slug');

    // If slug is provided, fetch single course
    if (slug) {
      const course = await prisma.landingCourse.findUnique({
        where: { slug }
      });

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(course);
    }

    // Otherwise, fetch all courses
    const courses = await prisma.landingCourse.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching landing courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing courses' },
      { status: 500 }
    );
  }
}

// POST - Create new landing course
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      duration, 
      icon, 
      slug, 
      order, 
      isActive,
      fullDescription,
      sessionDuration,
      method,
      practicePercentage,
      equipment,
      gradient,
      curriculum,
      benefits,
      targetAudience,
      software,
      originalPrice,
      discountedPrice
    } = body;

    // Validate required fields
    if (!name || !description || !duration || !icon || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCourse = await prisma.landingCourse.findUnique({
      where: { slug }
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const course = await prisma.landingCourse.create({
      data: {
        name,
        description,
        duration,
        icon,
        slug,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        fullDescription,
        sessionDuration,
        method,
        practicePercentage,
        equipment,
        gradient,
        curriculum,
        benefits,
        targetAudience,
        software,
        originalPrice,
        discountedPrice,
        createdBy: user.id
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating landing course:', error);
    return NextResponse.json(
      { error: 'Failed to create landing course' },
      { status: 500 }
    );
  }
}
