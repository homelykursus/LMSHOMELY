import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all location info
export async function GET() {
  try {
    const locations = await prisma.locationInfo.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching location info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location info' },
      { status: 500 }
    );
  }
}

// POST - Create new location info
export async function POST(request: NextRequest) {
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
      isActive,
      createdBy
    } = body;

    // If setting as active, deactivate all others
    if (isActive) {
      await prisma.locationInfo.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const location = await prisma.locationInfo.create({
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
        isActive: isActive ?? true,
        createdBy: createdBy || 'admin'
      }
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location info:', error);
    return NextResponse.json(
      { error: 'Failed to create location info' },
      { status: 500 }
    );
  }
}
