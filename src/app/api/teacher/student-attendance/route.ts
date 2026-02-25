import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/db';

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
    const type = searchParams.get('type'); // 'students', 'records', 'stats', 'classes', 'courses'

    if (type === 'students') {
      // Get students from classes taught by this teacher
      const students = await db.student.findMany({
        where: {
          classes: {
            some: {
              class: {
                OR: [
                  { teacherId: teacher.id },
                  { 
                    meetings: {
                      some: {
                        OR: [
                          { substituteTeacherId: teacher.id },
                          { actualTeacherId: teacher.id }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        include: {
          course: {
            select: {
              id: true,
              name: true
            }
          },
          classes: {
            include: {
              class: {
                include: {
                  teacher: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  course: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Process students to include class information
      const studentsWithClassInfo = students.map((student: any) => {
        // Find active class from the classes relationship
        const activeClassStudent = student.classes?.find((cs: any) => cs.class.isActive);
        // IMPORTANT: Class is only considered "completed" if it has endDate set (manually completed by teacher)
        // Even if completedMeetings >= totalMeetings, class is NOT auto-completed
        const completedClassStudent = student.classes?.find((cs: any) => 
          !cs.class.isActive && cs.class.endDate !== null
        );
        
        // Prioritize active class, but if no active class, show completed class
        const classStudent = activeClassStudent || completedClassStudent;
        const className = classStudent?.class?.name || 'Belum ada kelas';
        const classId = classStudent?.classId || '';
        
        return {
          ...student,
          classId: classId,
          className: className,
          courseName: student.course?.name || student.courseName || '-',
          classData: classStudent?.class || null
        };
      });

      return NextResponse.json(studentsWithClassInfo);
    }

    if (type === 'records') {
      // Get attendance records for classes taught by this teacher
      const attendanceRecords = await db.attendance.findMany({
        where: {
          classMeeting: {
            OR: [
              { class: { teacherId: teacher.id } },
              { substituteTeacherId: teacher.id },
              { actualTeacherId: teacher.id }
            ]
          }
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
              },
              actualTeacher: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { classMeeting: { date: 'desc' } },
          { student: { name: 'asc' } }
        ]
      });

      // Transform to match admin API format
      const transformedRecords = attendanceRecords.map(record => {
        // Convert database status to frontend format
        const statusMap = {
          'HADIR': 'present',
          'TIDAK_HADIR': 'absent',
          'TERLAMBAT': 'late',
          'IZIN': 'excused'
        };
        
        return {
          id: record.id,
          studentId: record.studentId,
          studentName: record.student.name,
          classId: record.classMeeting.classId,
          className: record.classMeeting.class.name,
          teacherId: record.classMeeting.class.teacherId,
          teacherName: record.classMeeting.class.teacher?.name,
          substituteTeacherId: record.classMeeting.substituteTeacherId,
          substituteTeacherName: record.classMeeting.substituteTeacher?.name,
          meetingId: record.classMeetingId,
          meetingDate: record.classMeeting.date.toISOString(),
          meetingTopic: record.classMeeting.topic || 'Tidak ada topik',
          status: statusMap[record.status as keyof typeof statusMap] || record.status.toLowerCase(),
          notes: record.notes,
          recordedAt: record.markedAt.toISOString(),
          recordedBy: 'System' // Could be enhanced to track who recorded
        };
      });

      return NextResponse.json({ success: true, records: transformedRecords });
    }

    if (type === 'stats') {
      // Get attendance statistics for classes taught by this teacher
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Get total students in teacher's classes
      const totalStudents = await db.student.count({
        where: {
          classes: {
            some: {
              class: {
                OR: [
                  { teacherId: teacher.id },
                  { 
                    meetings: {
                      some: {
                        OR: [
                          { substituteTeacherId: teacher.id },
                          { actualTeacherId: teacher.id }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      });

      // Get today's attendance stats
      const todayAttendance = await db.attendance.findMany({
        where: {
          classMeeting: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            },
            OR: [
              { class: { teacherId: teacher.id } },
              { substituteTeacherId: teacher.id },
              { actualTeacherId: teacher.id }
            ]
          }
        }
      });

      const presentToday = todayAttendance.filter(a => a.status === 'HADIR').length;
      const absentToday = todayAttendance.filter(a => a.status === 'TIDAK_HADIR').length;
      const lateToday = todayAttendance.filter(a => a.status === 'TERLAMBAT').length;

      // Get total meetings count
      const totalMeetings = await db.classMeeting.count({
        where: {
          OR: [
            { class: { teacherId: teacher.id } },
            { substituteTeacherId: teacher.id },
            { actualTeacherId: teacher.id }
          ]
        }
      });

      // Calculate average attendance
      const allAttendance = await db.attendance.count({
        where: {
          classMeeting: {
            OR: [
              { class: { teacherId: teacher.id } },
              { substituteTeacherId: teacher.id },
              { actualTeacherId: teacher.id }
            ]
          }
        }
      });

      const presentAttendance = await db.attendance.count({
        where: {
          classMeeting: {
            OR: [
              { class: { teacherId: teacher.id } },
              { substituteTeacherId: teacher.id },
              { actualTeacherId: teacher.id }
            ]
          },
          status: {
            in: ['HADIR', 'TERLAMBAT']
          }
        }
      });

      const averageAttendance = allAttendance > 0 ? Math.round((presentAttendance / allAttendance) * 100) : 0;

      return NextResponse.json({
        totalStudents,
        presentToday,
        absentToday,
        lateToday,
        totalMeetings,
        averageAttendance
      });
    }

    if (type === 'classes') {
      // Get classes taught by this teacher
      const classes = await db.class.findMany({
        where: {
          OR: [
            { teacherId: teacher.id },
            { 
              meetings: {
                some: {
                  OR: [
                    { substituteTeacherId: teacher.id },
                    { actualTeacherId: teacher.id }
                  ]
                }
              }
            }
          ]
        },
        include: {
          course: {
            select: {
              name: true
            }
          }
        }
      });

      return NextResponse.json(classes);
    }

    if (type === 'courses') {
      // Get courses from classes taught by this teacher
      const courses = await db.course.findMany({
        where: {
          classes: {
            some: {
              OR: [
                { teacherId: teacher.id },
                { 
                  meetings: {
                    some: {
                      OR: [
                        { substituteTeacherId: teacher.id },
                        { actualTeacherId: teacher.id }
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      });

      return NextResponse.json(courses);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching teacher student attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student attendance data' },
      { status: 500 }
    );
  }
}