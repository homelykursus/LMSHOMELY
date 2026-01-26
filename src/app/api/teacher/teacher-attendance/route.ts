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
    const type = searchParams.get('type'); // 'records', 'stats', 'classes'

    if (type === 'records') {
      // Use the same approach as Admin API - get meetings with TeacherAttendance records
      const classMeetings = await db.classMeeting.findMany({
        where: {
          status: 'COMPLETED',
          OR: [
            {
              class: {
                teacherId: teacher.id
              }
            },
            {
              teacherAttendances: {
                some: {
                  teacherId: teacher.id
                }
              }
            }
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
              },
              course: {
                select: {
                  name: true
                }
              }
            }
          },
          attendances: {
            include: {
              student: {
                select: {
                  name: true
                }
              }
            }
          },
          teacherAttendances: {
            where: {
              teacherId: teacher.id
            },
            include: {
              teacher: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Process teacher attendance records (same logic as Admin API)
      const teacherAttendanceRecords: any[] = [];
      
      for (const meeting of classMeetings) {
        // Count student attendance
        const presentStudents = meeting.attendances.filter(
          attendance => attendance.status === 'HADIR' || attendance.status === 'TERLAMBAT' || attendance.status === 'IZIN'
        );
        
        const totalStudents = meeting.attendances.length;
        const presentCount = presentStudents.length;

        // Process teacher attendance record for this meeting
        if (meeting.teacherAttendances.length > 0) {
          const teacherAttendance = meeting.teacherAttendances[0];
          const teacherStatus = teacherAttendance.status === 'HADIR' ? 'present' : 'absent';

          teacherAttendanceRecords.push({
            id: teacherAttendance.id,
            teacherId: teacher.id,
            teacherName: teacher.name,
            classId: meeting.classId,
            className: meeting.class.name,
            meetingId: meeting.id,
            meetingDate: meeting.date.toISOString(),
            meetingTopic: meeting.topic || `Pertemuan ${meeting.meetingNumber}`,
            status: teacherStatus,
            studentPresentCount: presentCount,
            totalStudentCount: totalStudents,
            recordedAt: teacherAttendance.markedAt?.toISOString() || meeting.date.toISOString(),
            schedule: meeting.class.schedule || 'Tidak ada jadwal',
            notes: teacherAttendance.notes || undefined
          });
        } else {
          // If no teacher attendance records exist, create one for the main teacher (same as Admin API)
          if (meeting.class.teacher && meeting.class.teacher.id === teacher.id) {
            // Determine teacher attendance based on student attendance
            const teacherStatus = presentCount >= 1 ? 'present' : 'absent';

            // Create teacher attendance record automatically
            const newTeacherAttendance = await db.teacherAttendance.create({
              data: {
                classMeetingId: meeting.id,
                teacherId: teacher.id,
                status: teacherStatus.toUpperCase() === 'PRESENT' ? 'HADIR' : 'TIDAK_HADIR',
                markedAt: new Date()
              }
            });

            teacherAttendanceRecords.push({
              id: newTeacherAttendance.id,
              teacherId: teacher.id,
              teacherName: teacher.name,
              classId: meeting.classId,
              className: meeting.class.name,
              meetingId: meeting.id,
              meetingDate: meeting.date.toISOString(),
              meetingTopic: meeting.topic || `Pertemuan ${meeting.meetingNumber}`,
              status: teacherStatus,
              studentPresentCount: presentCount,
              totalStudentCount: totalStudents,
              recordedAt: newTeacherAttendance.markedAt.toISOString(),
              schedule: meeting.class.schedule || 'Tidak ada jadwal'
            });
          }
        }
      }

      return NextResponse.json({ records: teacherAttendanceRecords });
    }

    if (type === 'stats') {
      // Use the same approach as Admin API - get meetings with TeacherAttendance records
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Get all meetings where this teacher has TeacherAttendance records or is the main teacher
      const allMeetings = await db.classMeeting.findMany({
        where: {
          status: 'COMPLETED',
          OR: [
            {
              class: {
                teacherId: teacher.id
              }
            },
            {
              teacherAttendances: {
                some: {
                  teacherId: teacher.id
                }
              }
            }
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
          attendances: true,
          teacherAttendances: {
            where: {
              teacherId: teacher.id
            }
          }
        }
      });

      // Process meetings to get attendance stats (same logic as Admin API)
      let totalMeetings = 0;
      let presentMeetings = 0;
      let absentMeetings = 0;
      let todayPresentMeetings = 0;
      let todayAbsentMeetings = 0;

      for (const meeting of allMeetings) {
        let teacherStatus = 'absent';
        
        if (meeting.teacherAttendances.length > 0) {
          // Use existing TeacherAttendance record
          teacherStatus = meeting.teacherAttendances[0].status === 'HADIR' ? 'present' : 'absent';
        } else if (meeting.class.teacher && meeting.class.teacher.id === teacher.id) {
          // Auto-generate based on student presence (same as Admin API)
          const presentStudents = meeting.attendances.filter(
            att => att.status === 'HADIR' || att.status === 'TERLAMBAT' || att.status === 'IZIN'
          ).length;
          teacherStatus = presentStudents >= 1 ? 'present' : 'absent';
          
          // Create the missing TeacherAttendance record
          await db.teacherAttendance.create({
            data: {
              classMeetingId: meeting.id,
              teacherId: teacher.id,
              status: teacherStatus === 'present' ? 'HADIR' : 'TIDAK_HADIR',
              markedAt: new Date()
            }
          });
        }

        totalMeetings++;
        if (teacherStatus === 'present') {
          presentMeetings++;
        } else {
          absentMeetings++;
        }

        // Check if meeting is today
        const meetingDate = new Date(meeting.date);
        if (meetingDate >= startOfDay && meetingDate <= endOfDay) {
          if (teacherStatus === 'present') {
            todayPresentMeetings++;
          } else {
            todayAbsentMeetings++;
          }
        }
      }

      const averageAttendance = totalMeetings > 0 ? Math.round((presentMeetings / totalMeetings) * 100) : 0;

      return NextResponse.json({
        totalTeachers: 1, // Only this teacher
        presentToday: todayPresentMeetings,
        absentToday: todayAbsentMeetings,
        averageAttendance,
        totalMeetings,
        presentMeetings,
        absentMeetings
      });
    }

    if (type === 'classes') {
      // Get classes taught by this teacher (same as before)
      const classes = await db.class.findMany({
        where: {
          OR: [
            { teacherId: teacher.id },
            { 
              meetings: {
                some: {
                  teacherAttendances: {
                    some: {
                      teacherId: teacher.id
                    }
                  }
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

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching teacher attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher attendance data' },
      { status: 500 }
    );
  }
}