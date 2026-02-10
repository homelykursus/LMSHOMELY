import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const facility = await db.facility.findUnique({
      where: { id }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}

// PUT update facility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, order, isActive } = body;

    // Check if facility exists
    const existingFacility = await db.facility.findUnique({
      where: { id }
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    const facility = await db.facility.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        order: order !== undefined ? order : existingFacility.order,
        isActive: isActive !== undefined ? isActive : existingFacility.isActive
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}

// DELETE facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const facility = await db.facility.findUnique({
      where: { id }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    await db.facility.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}
