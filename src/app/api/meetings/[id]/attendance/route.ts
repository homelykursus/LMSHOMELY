import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = params.id;
    const body = await request.json();
    const { attendances } = body;

    // Get meeting data with class info
    const meeting = await db.classMeeting.findUnique({
      where: { id: meetingId },
      include: {
        class: {
          include: {
            students: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Pertemuan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Process each attendance record
    for (const attendanceData of attendances) {
      const { studentId, status, notes } = attendanceData;

      // Find the classStudent record
      const classStudent = await db.classStudent.findFirst({
        where: {
          classId: meeting.classId,
          studentId
        }
      });

      if (!classStudent) {
        continue; // Skip if student is not in this class
      }

      // Update or create attendance record
      await db.attendance.upsert({
        where: {
          classMeetingId_classStudentId: {
            classMeetingId: meetingId,
            classStudentId: classStudent.id
          }
        },
        update: {
          status,
          notes: notes || null
        },
        create: {
          classMeetingId: meetingId,
          classStudentId: classStudent.id,
          status,
          notes: notes || null
        }
      });
    }

    // Mark meeting as completed if all students have attendance records
    const totalStudents = meeting.class.students.length;
    const attendanceCount = await db.attendance.count({
      where: { classMeetingId: meetingId }
    });

    if (attendanceCount >= totalStudents) {
      await db.classMeeting.update({
        where: { id: meetingId },
        data: { isCompleted: true }
      });
    }

    // Return updated meeting with attendances
    const updatedMeeting = await db.classMeeting.findUnique({
      where: { id: meetingId },
      include: {
        attendances: {
          include: {
            classStudent: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui absensi' },
      { status: 500 }
    );
  }
}