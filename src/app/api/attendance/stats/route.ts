import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total students
    const totalStudents = await db.student.count({
      where: {
        status: 'confirmed'
      }
    })

    // Get today's attendance statistics
    const todayAttendance = await db.attendance.groupBy({
      by: ['status'],
      where: {
        classMeeting: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      },
      _count: {
        id: true
      }
    })

    const presentToday = todayAttendance.find(a => a.status === 'HADIR')?._count.id || 0
    const absentToday = todayAttendance.find(a => a.status === 'TIDAK_HADIR')?._count.id || 0
    const lateToday = todayAttendance.find(a => a.status === 'TERLAMBAT')?._count.id || 0

    // Get total meetings
    const totalMeetings = await db.classMeeting.count()

    // Calculate average attendance rate
    const allAttendance = await db.attendance.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const totalAttendanceRecords = allAttendance.reduce((sum, a) => sum + a._count.id, 0)
    const totalPresentRecords = allAttendance.find(a => a.status === 'HADIR')?._count.id || 0
    const averageAttendance = totalAttendanceRecords > 0 
      ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100) 
      : 0

    return NextResponse.json({
      totalStudents,
      presentToday,
      absentToday,
      lateToday,
      totalMeetings,
      averageAttendance
    })
  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    return NextResponse.json(
      { 
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        totalMeetings: 0,
        averageAttendance: 0,
        error: 'Gagal mengambil statistik absensi' 
      },
      { status: 500 }
    )
  }
}