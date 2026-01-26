import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total teachers
    const totalTeachers = await db.teacher.count({
      where: {
        status: 'active'
      }
    })

    // Get today's class meetings
    const todayMeetings = await db.classMeeting.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      include: {
        class: {
          include: {
            teacher: true
          }
        },
        attendances: true,
        teacherAttendances: true
      }
    })

    // Calculate today's attendance
    let presentToday = 0
    let absentToday = 0
    const teacherAttendanceMap = new Map()

    for (const meeting of todayMeetings) {
      const teacher = meeting.class.teacher
      if (!teacher) continue

      // Count present students
      const presentStudents = meeting.attendances.filter(
        attendance => attendance.status === 'HADIR' || attendance.status === 'TERLAMBAT' || attendance.status === 'IZIN'
      )

      // Determine teacher attendance
      const isTeacherPresent = presentStudents.length >= 1

      // Use the first attendance record for this teacher today
      if (!teacherAttendanceMap.has(teacher.id)) {
        teacherAttendanceMap.set(teacher.id, isTeacherPresent)
        if (isTeacherPresent) {
          presentToday++
        } else {
          absentToday++
        }
      }
    }

    // Get all time attendance for average calculation
    const allMeetings = await db.classMeeting.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        class: {
          include: {
            teacher: true
          }
        },
        attendances: true
      }
    })

    let totalPresentSessions = 0
    let totalTeacherSessions = 0

    for (const meeting of allMeetings) {
      const teacher = meeting.class.teacher
      if (!teacher) continue

      const presentStudents = meeting.attendances.filter(
        attendance => attendance.status === 'HADIR' || attendance.status === 'TERLAMBAT' || attendance.status === 'IZIN'
      )

      totalTeacherSessions++
      if (presentStudents.length >= 1) {
        totalPresentSessions++
      }
    }

    const averageAttendance = totalTeacherSessions > 0 
      ? Math.round((totalPresentSessions / totalTeacherSessions) * 100)
      : 0

    return NextResponse.json({
      totalTeachers,
      presentToday,
      absentToday,
      averageAttendance
    })
  } catch (error) {
    console.error('Error fetching teacher attendance stats:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil statistik absensi guru' },
      { status: 500 }
    )
  }
}