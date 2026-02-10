import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all hero sections
export async function GET() {
  try {
    const heroes = await db.heroSection.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(heroes);
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero sections' },
      { status: 500 }
    );
  }
}

// POST create new hero
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, animatedWords, isActive } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // If setting as active, deactivate all others first
    if (isActive) {
      await db.heroSection.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const hero = await db.heroSection.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        animatedWords: animatedWords || null,
        isActive: isActive || false,
        createdBy: 'admin' // TODO: Get from session
      }
    });

    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error creating hero:', error);
    return NextResponse.json(
      { error: 'Failed to create hero' },
      { status: 500 }
    );
  }
}
