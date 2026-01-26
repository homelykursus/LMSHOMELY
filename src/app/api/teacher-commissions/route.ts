import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CommissionCalculator } from '@/lib/commission-calculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
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

    // Build where clause
    const whereClause: any = {
      status: 'COMPLETED',
      ...dateFilter
    };

    if (teacherId) {
      whereClause.OR = [
        { class: { teacherId } },
        { substituteTeacherId: teacherId },
        { actualTeacherId: teacherId }
      ];
    }

    // Get all completed meetings with teacher and class data
    const meetings = await db.classMeeting.findMany({
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
        { class: { teacher: { name: 'asc' } } }
      ]
    });

    // Calculate commissions for each meeting
    const commissionsData = meetings.map(meeting => {
      // Priority: substituteTeacher > actualTeacher > class.teacher
      const teacher = meeting.substituteTeacher || meeting.actualTeacher || meeting.class.teacher;
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
          id: teacher?.id || null,
          name: teacher?.name || 'Tidak ada guru',
          education: teacher?.education || '',
          specialization: teacher?.specialization || '',
          photo: teacher?.photo || null
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

    // Group by teacher and calculate totals
    const teacherCommissions = commissionsData.reduce((acc, commission) => {
      const teacherId = commission.teacher.id;
      if (!teacherId) return acc;

      if (!acc[teacherId]) {
        acc[teacherId] = {
          teacher: commission.teacher,
          totalCommission: 0,
          totalMeetings: 0,
          totalStudents: 0,
          classes: new Set(),
          meetings: [],
          byClassMeetings: 0,
          byStudentMeetings: 0,
          substituteMeetings: 0
        };
      }

      acc[teacherId].totalCommission += commission.calculatedCommission;
      acc[teacherId].totalMeetings += 1;
      acc[teacherId].totalStudents += commission.attendingStudents;
      acc[teacherId].classes.add(commission.class.name);
      acc[teacherId].meetings.push(commission);

      // Count meeting types
      if (commission.class.commissionType === 'BY_CLASS') {
        acc[teacherId].byClassMeetings += 1;
      } else {
        acc[teacherId].byStudentMeetings += 1;
      }

      if (commission.isSubstitute) {
        acc[teacherId].substituteMeetings += 1;
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and add summary data
    const result = Object.values(teacherCommissions).map((data: any) => ({
      ...data,
      classes: Array.from(data.classes),
      averageStudentsPerMeeting: data.totalMeetings > 0 ? Math.round(data.totalStudents / data.totalMeetings) : 0
    }));

    // Calculate summary statistics
    const summary = {
      totalTeachers: result.length,
      totalCommissions: result.reduce((sum, teacher) => sum + teacher.totalCommission, 0),
      totalMeetings: result.reduce((sum, teacher) => sum + teacher.totalMeetings, 0),
      totalStudents: result.reduce((sum, teacher) => sum + teacher.totalStudents, 0),
      averageCommissionPerTeacher: result.length > 0 ? 
        Math.round(result.reduce((sum, teacher) => sum + teacher.totalCommission, 0) / result.length) : 0,
      averageCommissionPerMeeting: result.reduce((sum, teacher) => sum + teacher.totalMeetings, 0) > 0 ?
        Math.round(result.reduce((sum, teacher) => sum + teacher.totalCommission, 0) / 
                  result.reduce((sum, teacher) => sum + teacher.totalMeetings, 0)) : 0
    };

    return NextResponse.json({
      teachers: result,
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