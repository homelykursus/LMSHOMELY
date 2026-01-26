import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching alumni data with payments...');

    // Fetch students with status 'completed' or 'graduated'
    const alumni = await db.student.findMany({
      where: {
        status: {
          in: ['completed', 'graduated']
        }
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            duration: true
          }
        },
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                schedule: true,
                isActive: true,
                totalMeetings: true,
                completedMeetings: true
              }
            }
          },
          orderBy: {
            joinedAt: 'desc'
          },
          take: 1 // Get the most recent class enrollment
        },
        payments: {
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            status: true
          }
        },
        attendances: {
          include: {
            classMeeting: {
              select: {
                id: true,
                classId: true,
                date: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // completed first, then graduated
        { completedAt: 'desc' }, // Most recently completed first
        { updatedAt: 'desc' } // Fallback to updatedAt if completedAt is null
      ]
    });

    console.log(`Found ${alumni.length} alumni`);
    
    // Calculate attendance data for each alumni
    const alumniWithAttendance = await Promise.all(alumni.map(async (alumnus) => {
      let attendedMeetings = 0;
      let totalMeetings = 0;
      
      // Count ONLY meetings where student was actually present (HADIR, TERLAMBAT, or IZIN)
      attendedMeetings = alumnus.attendances.filter(attendance => 
        attendance.status === 'HADIR' || 
        attendance.status === 'TERLAMBAT' || 
        attendance.status === 'IZIN'
      ).length;
      
      // Get total meetings from the class they attended
      if (alumnus.classes && alumnus.classes.length > 0) {
        const classId = alumnus.classes[0].class.id;
        
        // Count total meetings for this class
        const classMeetingsCount = await db.classMeeting.count({
          where: {
            classId: classId
          }
        });
        
        totalMeetings = classMeetingsCount;
      }
      
      return {
        ...alumnus,
        attendanceStats: {
          attended: attendedMeetings,
          total: totalMeetings
        }
      };
    }));
    
    // Debug: Check attendance stats
    alumniWithAttendance.forEach(a => {
      console.log(`Alumni ${a.name}: attended ${a.attendanceStats.attended}/${a.attendanceStats.total} meetings`);
    });

    return NextResponse.json(alumniWithAttendance);
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni data' },
      { status: 500 }
    );
  }
}