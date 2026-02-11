import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch single landing course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.landingCourse.findUnique({
      where: { id: params.id }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Landing course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching landing course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update landing course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!name || !description || !duration || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, duration, slug' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.landingCourse.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Landing course not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== existingCourse.slug) {
      const slugExists = await prisma.landingCourse.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data - only include defined fields
    const updateData: any = {
      name,
      description,
      duration,
      icon,
      slug,
      order: order ?? 0,
      isActive: isActive ?? true
    };

    // Add optional fields only if they are provided
    if (fullDescription !== undefined) updateData.fullDescription = fullDescription;
    if (sessionDuration !== undefined) updateData.sessionDuration = sessionDuration;
    if (method !== undefined) updateData.method = method;
    if (practicePercentage !== undefined) updateData.practicePercentage = practicePercentage;
    if (equipment !== undefined) updateData.equipment = equipment;
    if (gradient !== undefined) updateData.gradient = gradient;
    if (curriculum !== undefined) updateData.curriculum = curriculum;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (software !== undefined) updateData.software = software;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice;

    const course = await prisma.landingCourse.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error('Error updating landing course:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to update landing course',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete landing course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.landingCourse.findUnique({
      where: { id: params.id }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Landing course not found' },
        { status: 404 }
      );
    }

    await prisma.landingCourse.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Landing course deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing course:', error);
    return NextResponse.json(
      { error: 'Failed to delete landing course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
