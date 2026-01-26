import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await db.room.findUnique({
      where: {
        id: params.id
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, capacity, floor, building, isActive } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id: params.id }
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room name already exists (excluding current room)
    const duplicateRoom = await db.room.findFirst({
      where: { 
        name: name.trim(),
        id: { not: params.id }
      }
    });

    if (duplicateRoom) {
      return NextResponse.json(
        { error: 'Room with this name already exists' },
        { status: 400 }
      );
    }

    const updatedRoom = await db.room.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        capacity: capacity || null,
        floor: floor?.trim() || null,
        building: building?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingRoom.isActive
      }
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await db.room.findUnique({
      where: { id: params.id }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    await db.room.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}