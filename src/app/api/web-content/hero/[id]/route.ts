import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single hero
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hero = await db.heroSection.findUnique({
      where: { id }
    });

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero' },
      { status: 500 }
    );
  }
}

// PUT update hero
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, imageUrl, animatedWords, isActive } = body;

    // Check if hero exists
    const existingHero = await db.heroSection.findUnique({
      where: { id }
    });

    if (!existingHero) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    // If setting as active, deactivate all others first
    if (isActive && !existingHero.isActive) {
      await db.heroSection.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    const hero = await db.heroSection.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        animatedWords: animatedWords || null,
        isActive: isActive || false
      }
    });

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error updating hero:', error);
    return NextResponse.json(
      { error: 'Failed to update hero' },
      { status: 500 }
    );
  }
}

// DELETE hero
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const hero = await db.heroSection.findUnique({
      where: { id }
    });

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    await db.heroSection.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Hero deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero' },
      { status: 500 }
    );
  }
}
