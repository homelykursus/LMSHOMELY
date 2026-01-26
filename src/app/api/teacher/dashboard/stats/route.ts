import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommissionCalculator } from '@/lib/commission-calculator';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated teacher
    const teacher = await AuthService.getTeacherFromRequest(request);
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Get teacher's active classes
    const classes = await db.class.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true
      },
      include: {
        students: true
      }
    });

    // Get all completed meetings where this teacher was involved
    const allMeetings = await db.classMeeting.findMany({
      where: {
        status: 'COMPLETED',
        OR: [
          { class: { teacherId: teacher.id } },
          { substituteTeacherId: teacher.id },
          { actualTeacherId: teacher.id }
        ]
      },
      include: {
        class: {
          include: {
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
        },
        actualTeacher: {
          select: {
            id: true,
            name: true
          }
        },
        attendances: {
          where: {
            status: {
              in: ['HADIR', 'TERLAMBAT'] // Only count present and late students
            }
          }
        }
      }
    });

    // Get this month's meetings where this teacher was involved
    const thisMonthMeetings = await db.classMeeting.findMany({
      where: {
        status: 'COMPLETED',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        OR: [
          { class: { teacherId: teacher.id } },
          { substituteTeacherId: teacher.id },
          { actualTeacherId: teacher.id }
        ]
      },
      include: {
        class: {
          include: {
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
        },
        actualTeacher: {
          select: {
            id: true,
            name: true
          }
        },
        attendances: {
          where: {
            status: {
              in: ['HADIR', 'TERLAMBAT']
            }
          }
        }
      }
    });

    // Filter meetings where this teacher actually taught (same logic as admin commission API)
    const filterMeetingsForTeacher = (meetings: any[]) => {
      return meetings.filter(meeting => {
        // Priority: substituteTeacher > actualTeacher > class.teacher
        const meetingTeacher = meeting.substituteTeacher || meeting.actualTeacher || meeting.class.teacher;
        return meetingTeacher?.id === teacher.id;
      });
    };

    const teacherAllMeetings = filterMeetingsForTeacher(allMeetings);
    const teacherThisMonthMeetings = filterMeetingsForTeacher(thisMonthMeetings);

    // Calculate total commission from meetings where this teacher actually taught
    let totalCommission = 0;
    teacherAllMeetings.forEach(meeting => {
      const commissionResult = CommissionCalculator.calculateCommission(
        meeting.class.commissionType as 'BY_CLASS' | 'BY_STUDENT',
        meeting.class.commissionAmount,
        meeting.attendances.map((att: any) => ({
          id: att.id,
          studentId: att.studentId,
          status: att.status as 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN',
          notes: att.notes
        }))
      );
      totalCommission += commissionResult.amount;
    });

    // Calculate this month's commission
    let thisMonthCommission = 0;
    teacherThisMonthMeetings.forEach(meeting => {
      const commissionResult = CommissionCalculator.calculateCommission(
        meeting.class.commissionType as 'BY_CLASS' | 'BY_STUDENT',
        meeting.class.commissionAmount,
        meeting.attendances.map((att: any) => ({
          id: att.id,
          studentId: att.studentId,
          status: att.status as 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN',
          notes: att.notes
        }))
      );
      thisMonthCommission += commissionResult.amount;
    });

    // Calculate attendance rate
    const totalAttendances = await db.attendance.count({
      where: {
        classMeeting: {
          OR: [
            { class: { teacherId: teacher.id } },
            { substituteTeacherId: teacher.id },
            { actualTeacherId: teacher.id }
          ],
          status: 'COMPLETED'
        }
      }
    });

    const presentAttendances = await db.attendance.count({
      where: {
        classMeeting: {
          OR: [
            { class: { teacherId: teacher.id } },
            { substituteTeacherId: teacher.id },
            { actualTeacherId: teacher.id }
          ],
          status: 'COMPLETED'
        },
        status: {
          in: ['HADIR', 'TERLAMBAT']
        }
      }
    });

    const attendanceRate = totalAttendances > 0 ? Math.round((presentAttendances / totalAttendances) * 100) : 0;

    // Calculate stats
    const stats = {
      totalClasses: classes.length,
      totalStudents: classes.reduce((sum, cls) => sum + cls.students.length, 0),
      totalMeetings: teacherAllMeetings.length,
      totalCommission,
      thisMonthMeetings: teacherThisMonthMeetings.length,
      thisMonthCommission,
      attendanceRate
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}