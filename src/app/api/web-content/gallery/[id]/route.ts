import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single gallery image
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: params.id }
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Gallery image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery image' },
      { status: 500 }
    );
  }
}

// PUT - Update gallery image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, imageUrl, category, order, isActive } = body;

    const image = await prisma.galleryImage.update({
      where: { id: params.id },
      data: {
        title,
        imageUrl,
        category,
        order,
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.galleryImage.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}
