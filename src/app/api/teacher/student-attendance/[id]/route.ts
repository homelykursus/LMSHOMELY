import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated teacher
    const teacher = await AuthService.getTeacherFromRequest(request);
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, notes } = await request.json();
    const attendanceId = params.id;

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Convert status to database format
    const dbStatus = {
      'present': 'HADIR',
      'absent': 'TIDAK_HADIR',
      'late': 'TERLAMBAT',
      'excused': 'IZIN'
    }[status];

    // Check if attendance record exists and teacher has permission to edit it
    const existingRecord = await db.attendance.findFirst({
      where: {
        id: attendanceId,
        classMeeting: {
          OR: [
            { class: { teacherId: teacher.id } },
            { substituteTeacherId: teacher.id },
            { actualTeacherId: teacher.id }
          ]
        }
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found or access denied' },
        { status: 404 }
      );
    }

    // Update the attendance record
    const updatedRecord = await db.attendance.update({
      where: {
        id: attendanceId
      },
      data: {
        status: dbStatus,
        notes: notes || null,
        markedAt: new Date() // Update timestamp
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNumber: true
          }
        },
        classMeeting: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                teacher: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            substituteTeacher: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Transform response to match expected format
    const statusMap = {
      'HADIR': 'present',
      'TIDAK_HADIR': 'absent',
      'TERLAMBAT': 'late',
      'IZIN': 'excused'
    };
    
    const transformedRecord = {
      id: updatedRecord.id,
      studentId: updatedRecord.studentId,
      studentName: updatedRecord.student.name,
      classId: updatedRecord.classMeeting.classId,
      className: updatedRecord.classMeeting.class.name,
      teacherId: updatedRecord.classMeeting.class.teacherId,
      teacherName: updatedRecord.classMeeting.class.teacher?.name,
      substituteTeacherId: updatedRecord.classMeeting.substituteTeacherId,
      substituteTeacherName: updatedRecord.classMeeting.substituteTeacher?.name,
      meetingId: updatedRecord.classMeetingId,
      meetingDate: updatedRecord.classMeeting.date.toISOString(),
      meetingTopic: updatedRecord.classMeeting.topic || 'Tidak ada topik',
      status: statusMap[updatedRecord.status as keyof typeof statusMap] || updatedRecord.status.toLowerCase(),
      notes: updatedRecord.notes,
      recordedAt: updatedRecord.markedAt.toISOString(),
      recordedBy: 'Teacher'
    };

    return NextResponse.json({
      success: true,
      record: transformedRecord
    });

  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}