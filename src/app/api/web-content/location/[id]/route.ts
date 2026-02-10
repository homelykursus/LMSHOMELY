import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single location info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location = await prisma.locationInfo.findUnique({
      where: { id: params.id }
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location info not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location info' },
      { status: 500 }
    );
  }
}

// PUT - Update location info
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      address,
      whatsappNumber,
      whatsappDisplay,
      instagramUsername,
      instagramUrl,
      googleMapsEmbed,
      googleMapsLink,
      isActive
    } = body;

    // If setting as active, deactivate all others
    if (isActive) {
      await prisma.locationInfo.updateMany({
        where: { 
          isActive: true,
          id: { not: params.id }
        },
        data: { isActive: false }
      });
    }

    const location = await prisma.locationInfo.update({
      where: { id: params.id },
      data: {
        title,
        subtitle,
        address,
        whatsappNumber,
        whatsappDisplay,
        instagramUsername,
        instagramUrl,
        googleMapsEmbed,
        googleMapsLink,
        isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error updating location info:', error);
    return NextResponse.json(
      { error: 'Failed to update location info' },
      { status: 500 }
    );
  }
}

// DELETE - Delete location info
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.locationInfo.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Location info deleted successfully' });
  } catch (error) {
    console.error('Error deleting location info:', error);
    return NextResponse.json(
      { error: 'Failed to delete location info' },
      { status: 500 }
    );
  }
}
