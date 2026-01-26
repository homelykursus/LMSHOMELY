import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get total meeting counts for all students (regardless of attendance status)
    const attendanceCounts = await db.attendance.groupBy({
      by: ['studentId'],
      _count: {
        id: true
      }
    });

    // Transform to object with studentId as key and total meeting count as value
    const attendanceData: {[key: string]: number} = {};
    attendanceCounts.forEach(item => {
      attendanceData[item.studentId] = item._count.id;
    });

    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance counts' },
      { status: 500 }
    );
  }
}