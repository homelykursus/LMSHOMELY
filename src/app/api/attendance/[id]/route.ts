import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status, notes } = await request.json()

    // Validate input
    if (!status || !['present', 'absent', 'late', 'excused'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    // Check if attendance record exists
    const existingRecord = await db.attendance.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Record absensi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update attendance record
    const updatedRecord = await db.attendance.update({
      where: { id },
      data: {
        status: status.toUpperCase() === 'PRESENT' ? 'HADIR' :
               status.toUpperCase() === 'ABSENT' ? 'TIDAK_HADIR' :
               status.toUpperCase() === 'LATE' ? 'TERLAMBAT' : 'IZIN',
        notes: notes || null,
        markedAt: new Date()
      },
      include: {
        student: {
          select: {
            name: true,
            id: true
          }
        },
        classMeeting: {
          include: {
            class: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Status absensi berhasil diperbarui',
      record: updatedRecord
    })
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui status absensi' },
      { status: 500 }
    )
  }
}