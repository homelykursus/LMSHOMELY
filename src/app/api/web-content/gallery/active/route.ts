import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch only active gallery images
export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching active gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active gallery images' },
      { status: 500 }
    );
  }
}
