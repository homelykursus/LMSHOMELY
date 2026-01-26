import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { studentIds, classId } = await request.json();

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
    }

    // Get last attendance for each student in the same class
    const lastAttendanceData: {[key: string]: any} = {};

    for (const studentId of studentIds) {
      const lastAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: studentId,
          classMeeting: {
            classId: classId
          }
        },
        include: {
          classMeeting: {
            select: {
              date: true,
              meetingNumber: true
            }
          }
        },
        orderBy: {
          classMeeting: {
            date: 'desc'
          }
        }
      });

      if (lastAttendance) {
        lastAttendanceData[studentId] = {
          date: lastAttendance.classMeeting.date,
          status: lastAttendance.status,
          meetingNumber: lastAttendance.classMeeting.meetingNumber
        };
      }
    }

    return NextResponse.json(lastAttendanceData);
  } catch (error) {
    console.error('Error fetching last attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch last attendance data' }, { status: 500 });
  }
}