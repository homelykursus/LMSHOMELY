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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      };
    }

    // Build where clause - only meetings where this teacher taught
    const whereClause: any = {
      status: 'COMPLETED',
      ...dateFilter,
      OR: [
        { class: { teacherId: teacher.id } },
        { substituteTeacherId: teacher.id },
        { actualTeacherId: teacher.id }
      ]
    };

    // Get all completed meetings taught by this teacher
    const allMeetings = await db.classMeeting.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                education: true,
                specialization: true,
                photo: true
              }
            },
            course: {
              select: {
                name: true,
                category: true
              }
            },
            room: {
              select: {
                name: true
              }
            }
          }
        },
        substituteTeacher: {
          select: {
            id: true,
            name: true,
            education: true,
            specialization: true,
            photo: true
          }
        },
        actualTeacher: {
          select: {
            id: true,
            name: true,
            education: true,
            specialization: true,
            photo: true
          }
        },
        attendances: {
          where: {
            status: {
              in: ['HADIR', 'TERLAMBAT'] // Only count present and late students
            }
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { meetingNumber: 'desc' }
      ]
    });

    // Filter meetings where this teacher actually taught (same logic as dashboard stats API)
    const meetings = allMeetings.filter(meeting => {
      // Priority: substituteTeacher > actualTeacher > class.teacher
      const meetingTeacher = meeting.substituteTeacher || meeting.actualTeacher || meeting.class.teacher;
      return meetingTeacher?.id === teacher.id;
    });

    // Calculate commissions for each meeting
    const commissionsData = meetings.map(meeting => {
      // Priority: substituteTeacher > actualTeacher > class.teacher
      const meetingTeacher = meeting.substituteTeacher || meeting.actualTeacher || meeting.class.teacher;
      const attendingStudents = meeting.attendances.length;
      
      // Calculate commission using the commission calculator
      const commissionResult = CommissionCalculator.calculateCommission(
        meeting.class.commissionType as 'BY_CLASS' | 'BY_STUDENT',
        meeting.class.commissionAmount,
        meeting.attendances.map(att => ({
          id: att.id,
          studentId: att.studentId,
          status: att.status as 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN',
          notes: att.notes
        }))
      );

      return {
        meetingId: meeting.id,
        meetingNumber: meeting.meetingNumber,
        date: meeting.date,
        topic: meeting.topic,
        teacher: {
          id: meetingTeacher?.id || null,
          name: meetingTeacher?.name || 'Tidak ada guru',
          education: meetingTeacher?.education || '',
          specialization: meetingTeacher?.specialization || '',
          photo: meetingTeacher?.photo || null
        },
        class: {
          id: meeting.class.id,
          name: meeting.class.name,
          commissionType: meeting.class.commissionType,
          commissionAmount: meeting.class.commissionAmount,
          course: meeting.class.course,
          room: meeting.class.room
        },
        attendingStudents,
        calculatedCommission: commissionResult.amount,
        commissionBreakdown: commissionResult.breakdown,
        isSubstitute: !!meeting.substituteTeacher
      };
    });

    // Calculate totals
    const totalCommission = commissionsData.reduce((sum, commission) => sum + commission.calculatedCommission, 0);
    const totalMeetings = commissionsData.length;
    const totalStudents = commissionsData.reduce((sum, commission) => sum + commission.attendingStudents, 0);
    const averageStudentsPerMeeting = totalMeetings > 0 ? Math.round(totalStudents / totalMeetings) : 0;

    // Count meeting types
    const byClassMeetings = commissionsData.filter(c => c.class.commissionType === 'BY_CLASS').length;
    const byStudentMeetings = commissionsData.filter(c => c.class.commissionType === 'BY_STUDENT').length;
    const substituteMeetings = commissionsData.filter(c => c.isSubstitute).length;

    // Get unique classes
    const classes = [...new Set(commissionsData.map(c => c.class.name))];

    const result = {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        whatsapp: teacher.whatsapp
      },
      totalCommission,
      totalMeetings,
      totalStudents,
      classes,
      meetings: commissionsData,
      byClassMeetings,
      byStudentMeetings,
      substituteMeetings,
      averageStudentsPerMeeting
    };

    // Calculate summary statistics
    const summary = {
      totalCommissions: totalCommission,
      totalMeetings: totalMeetings,
      totalStudents: totalStudents,
      averageCommissionPerMeeting: totalMeetings > 0 ? Math.round(totalCommission / totalMeetings) : 0
    };

    return NextResponse.json({
      commissions: result,
      summary,
      period: {
        startDate: startDate || (month && year ? new Date(parseInt(year), parseInt(month) - 1, 1).toISOString() : null),
        endDate: endDate || (month && year ? new Date(parseInt(year), parseInt(month), 0).toISOString() : null),
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null
      }
    });
  } catch (error) {
    console.error('Error fetching teacher commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher commissions' },
      { status: 500 }
    );
  }
}