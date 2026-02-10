import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all facilities
export async function GET() {
  try {
    const facilities = await db.facility.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

// POST create new facility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, order, isActive } = body;

    // Validate required fields
    if (!name || !description || !icon) {
      return NextResponse.json(
        { error: 'Name, description, and icon are required' },
        { status: 400 }
      );
    }

    const facility = await db.facility.create({
      data: {
        name,
        description,
        icon,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: 'admin' // TODO: Get from session
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}
