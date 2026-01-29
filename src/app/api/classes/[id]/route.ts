import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const classId = params.id;

    const classData = await db.class.findUnique({
      where: { id: classId },
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

    if (!classData) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kelas' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const classId = params.id;
    const body = await request.json();

    // First, update the class basic information
    const updateData: any = {
      name: body.name,
      description: body.description,
      maxStudents: body.maxStudents,
      commissionType: body.commissionType || 'BY_CLASS',
      commissionAmount: body.commissionAmount,
      schedule: body.schedule,
      roomId: body.roomId,
      courseId: body.courseId,
      isActive: body.isActive,
    };

    // Only update teacherId if provided (can be null)
    if (body.teacherId !== undefined) {
      updateData.teacherId = body.teacherId;
    }

    // Don't update startDate and endDate - they are managed by attendance system
    // Only update totalMeetings if provided
    if (body.totalMeetings !== undefined) {
      updateData.totalMeetings = body.totalMeetings;
    }

    const updatedClass = await db.class.update({
      where: { id: classId },
      data: updateData,
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

    // Handle student updates if studentIds is provided
    if (body.studentIds && Array.isArray(body.studentIds)) {
      // Get current student relationships
      const currentStudents = await db.classStudent.findMany({
        where: { classId }
      });

      const currentStudentIds = currentStudents.map(cs => cs.studentId);
      const newStudentIds = body.studentIds;

      // Find students to remove (in current but not in new)
      const studentsToRemove = currentStudentIds.filter(id => !newStudentIds.includes(id));
      
      // Find students to add (in new but not in current)
      const studentsToAdd = newStudentIds.filter(id => !currentStudentIds.includes(id));

      // Remove students who are no longer in the class
      if (studentsToRemove.length > 0) {
        await db.classStudent.deleteMany({
          where: {
            classId,
            studentId: {
              in: studentsToRemove
            }
          }
        });
      }

      // Add new students to the class
      if (studentsToAdd.length > 0) {
        await db.classStudent.createMany({
          data: studentsToAdd.map(studentId => ({
            classId,
            studentId
          }))
        });
      }
    }

    // Fetch the updated class with new student relationships
    const finalClass = await db.class.findUnique({
      where: { id: classId },
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

    return NextResponse.json(finalClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui kelas' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const classId = params.id;

    await db.class.delete({
      where: { id: classId }
    });

    return NextResponse.json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kelas' },
      { status: 500 }
    );
  }
}