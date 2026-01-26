import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;
    console.log('Fetching attendance for student ID:', studentId);

    // Fetch attendance records for this student
    const attendanceRecords = await db.attendance.findMany({
      where: {
        studentId: studentId
      },
      include: {
        classMeeting: {
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        markedAt: 'desc'
      }
    });

    console.log(`Found ${attendanceRecords.length} attendance records for student ${studentId}`);

    // Transform the data to match the expected format
    const transformedRecords = attendanceRecords.map(record => ({
      id: record.id,
      studentId: record.studentId,
      classId: record.classMeeting.classId,
      className: record.classMeeting.class.name,
      meetingId: record.classMeetingId,
      meetingDate: record.classMeeting.date.toISOString(),
      meetingTopic: record.classMeeting.topic || `Pertemuan ${record.classMeeting.meetingNumber}`,
      meetingNumber: record.classMeeting.meetingNumber,
      status: record.status,
      notes: record.notes,
      recordedAt: record.markedAt.toISOString(),
      // Legacy format for compatibility
      date: record.classMeeting.date.toISOString(),
      meeting: {
        id: record.classMeetingId,
        classId: record.classMeeting.classId,
        date: record.classMeeting.date.toISOString(),
        topic: record.classMeeting.topic || `Pertemuan ${record.classMeeting.meetingNumber}`,
        meetingNumber: record.classMeeting.meetingNumber
      }
    }));

    return NextResponse.json(transformedRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}