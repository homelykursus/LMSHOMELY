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
    const { badgeText, title, description, imageUrl, animatedWords, isActive } = body;

    console.log('[Hero Update] Request received:', { id, badgeText, title, isActive });

    // Check if hero exists
    const existingHero = await db.heroSection.findUnique({
      where: { id }
    });

    if (!existingHero) {
      console.log('[Hero Update] Hero not found:', id);
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    console.log('[Hero Update] Existing hero found:', existingHero.id);

    // If setting as active, deactivate all others first
    if (isActive && !existingHero.isActive) {
      console.log('[Hero Update] Deactivating other heroes');
      await db.heroSection.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    console.log('[Hero Update] Updating hero with data:', {
      badgeText: badgeText || null,
      title,
      description: description?.substring(0, 50),
      imageUrl: imageUrl || null,
      animatedWords: animatedWords || null,
      isActive: isActive || false
    });

    const hero = await db.heroSection.update({
      where: { id },
      data: {
        badgeText: badgeText !== undefined && badgeText !== '' ? badgeText : null,
        title: title || existingHero.title,
        description: description || existingHero.description,
        imageUrl: imageUrl !== undefined && imageUrl !== '' ? imageUrl : null,
        animatedWords: animatedWords !== undefined && animatedWords !== '' ? animatedWords : null,
        isActive: isActive !== undefined ? Boolean(isActive) : existingHero.isActive
      }
    });

    console.log('[Hero Update] Update successful:', hero.id);
    return NextResponse.json(hero);
  } catch (error: any) {
    console.error('[Hero Update] Error updating hero:', error);
    console.error('[Hero Update] Error stack:', error.stack);
    console.error('[Hero Update] Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to update hero', details: error.message },
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
