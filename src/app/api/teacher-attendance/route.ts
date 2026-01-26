import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    const startTime = Date.now()
    
    // Build where clause for class meetings
    const whereClause: any = {
      status: 'COMPLETED'
    };
    
    // If teacherId is specified, filter by teacher
    if (teacherId) {
      whereClause.OR = [
        // Main teacher
        {
          class: {
            teacherId: teacherId
          }
        },
        // Substitute teacher
        {
          teacherAttendances: {
            some: {
              teacherId: teacherId
            }
          }
        }
      ];
    }
    
    // Get all class meetings with teacher attendance
    const classMeetings = await db.classMeeting.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                education: true,
                specialization: true
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
      },
      take: 100
    })

    // Process teacher attendance records
    const teacherAttendanceRecords: any[] = []
    
    for (const meeting of classMeetings) {
      // Count student attendance
      const presentStudents = meeting.attendances.filter(
        attendance => attendance.status === 'HADIR' || attendance.status === 'TERLAMBAT' || attendance.status === 'IZIN'
      )
      
      const totalStudents = meeting.attendances.length
      const presentCount = presentStudents.length

      // Process each teacher attendance record for this meeting
      // This handles both main teacher and substitute teacher cases
      for (const teacherAttendance of meeting.teacherAttendances) {
        const teacher = teacherAttendance.teacher
        if (!teacher) continue

        // If filtering by teacherId, only include records for that teacher
        if (teacherId && teacherAttendance.teacherId !== teacherId) {
          continue;
        }

        // Convert status from database format to API format
        const teacherStatus = teacherAttendance.status === 'HADIR' ? 'present' : 'absent'

        teacherAttendanceRecords.push({
          id: teacherAttendance.id,
          teacherId: teacherAttendance.teacherId,
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
        })
      }

      // If no teacher attendance records exist, create one for the main teacher
      // This is for backward compatibility with old meetings
      if (meeting.teacherAttendances.length === 0) {
        const mainTeacher = meeting.class.teacher
        if (mainTeacher && (!teacherId || mainTeacher.id === teacherId)) {
          // Determine teacher attendance based on student attendance
          const teacherStatus = presentCount >= 1 ? 'present' : 'absent'

          // Create teacher attendance record automatically
          const newTeacherAttendance = await db.teacherAttendance.create({
            data: {
              classMeetingId: meeting.id,
              teacherId: mainTeacher.id,
              status: teacherStatus.toUpperCase() === 'PRESENT' ? 'HADIR' : 'TIDAK_HADIR',
              markedAt: new Date()
            }
          })

          teacherAttendanceRecords.push({
            id: newTeacherAttendance.id,
            teacherId: mainTeacher.id,
            teacherName: mainTeacher.name,
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
          })
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`Teacher attendance records fetched in ${duration}ms`)

    return NextResponse.json({
      success: true,
      records: teacherAttendanceRecords,
      meta: {
        count: teacherAttendanceRecords.length,
        fetchTime: `${duration}ms`,
        teacherId: teacherId || 'all'
      }
    })
  } catch (error) {
    console.error('Error fetching teacher attendance records:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil data absensi guru',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}