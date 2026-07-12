import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const schedules = await db.masterSchedule.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data jadwal' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, isActive } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama jadwal wajib diisi' },
        { status: 400 }
      );
    }

    const schedule = await db.masterSchedule.create({
      data: {
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan jadwal baru' },
      { status: 500 }
    );
  }
}
