import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all gallery images
export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST - Create new gallery image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, imageUrl, category, order, isActive, createdBy } = body;

    const image = await prisma.galleryImage.create({
      data: {
        title,
        imageUrl,
        category,
        order: order || 0,
        isActive: isActive ?? true,
        createdBy: createdBy || 'admin'
      }
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    );
  }
}
