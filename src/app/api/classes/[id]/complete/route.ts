import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const classId = params.id;

    // Check if class exists and is currently active
    const existingClass = await db.class.findUnique({
      where: { id: classId },
      include: {
        course: true,
        teacher: true,
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    // Check if class is already completed (has endDate)
    if (existingClass.endDate) {
      return NextResponse.json({ error: 'Kelas sudah diselesaikan sebelumnya' }, { status: 400 });
    }

    // Update class to completed by setting endDate
    const completedClass = await db.class.update({
      where: { id: classId },
      data: {
        endDate: new Date(), // Mark as completed by setting endDate
        isActive: false,
        updatedAt: new Date()
      },
      include: {
        course: true,
        teacher: true,
        room: true,
        students: {
          include: {
            student: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Kelas berhasil diselesaikan',
      class: completedClass
    });

  } catch (error) {
    console.error('Error completing class:', error);
    return NextResponse.json(
      { error: 'Gagal menyelesaikan kelas' },
      { status: 500 }
    );
  }
}