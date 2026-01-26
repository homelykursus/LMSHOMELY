import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rooms = await db.room.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, capacity, floor, building } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Check if room name already exists
    const existingRoom = await db.room.findFirst({
      where: { name: name.trim() }
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room with this name already exists' },
        { status: 400 }
      );
    }

    const room = await db.room.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        capacity: capacity || null,
        floor: floor?.trim() || null,
        building: building?.trim() || null
      }
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}