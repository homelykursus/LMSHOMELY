import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;

    // Fetch meetings for the specified class
    const meetings = await db.classMeeting.findMany({
      where: {
        classId: classId
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            commissionType: true,
            commissionAmount: true
          }
        },
        attendances: {
          select: {
            id: true,
            studentId: true,
            status: true
          }
        },
        substituteTeacher: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        meetingNumber: 'asc'
      }
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching class meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class meetings' },
      { status: 500 }
    );
  }
}