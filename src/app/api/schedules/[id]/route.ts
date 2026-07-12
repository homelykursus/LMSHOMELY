import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, isActive } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama jadwal wajib diisi' },
        { status: 400 }
      );
    }

    const schedule = await db.masterSchedule.update({
      where: { id },
      data: {
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui jadwal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.masterSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus jadwal' },
      { status: 500 }
    );
  }
}
