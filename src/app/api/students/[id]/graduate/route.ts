import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const user = await AuthService.getUserFromRequest(request);
    const teacher = await AuthService.getTeacherFromRequest(request);
    
    if (!user && !teacher) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the student
    const student = await db.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // Check student is not already alumni
    if (student.status === 'completed' || student.status === 'graduated') {
      return NextResponse.json(
        { error: 'Siswa sudah berstatus alumni' },
        { status: 400 }
      );
    }

    // Update student status to 'graduated' (same as when a class is completed)
    const updatedStudent = await db.student.update({
      where: { id },
      data: {
        status: 'graduated',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Siswa ${updatedStudent.name} berhasil diselesaikan dan menjadi alumni`,
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error graduating student:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyelesaikan siswa' },
      { status: 500 }
    );
  }
}
