import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CommissionCalculator, type AttendanceRecord } from '@/lib/commission-calculator'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Get employee attendance records
    const employeeRecords = await db.employeeAttendance.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50,
      select: {
        id: true,
        employeeName: true,
        employeeId: true,
        type: true,
        timestamp: true,
        notes: true,
        status: true,
        errorMessage: true
      }
    })

    // Get student attendance records
    const studentAttendance = await db.attendance.findMany({
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
            }
          }
        }
      },
      orderBy: {
        markedAt: 'desc'
      },
      take: 100
    })

    const studentRecords = studentAttendance.map(record => {
      const mappedRecord = {
        id: record.id,
        studentId: record.studentId,
        studentName: record.student.name,
        classId: record.classMeeting.classId,
        className: record.classMeeting.class.name,
        teacherId: record.classMeeting.class.teacher?.id,
        teacherName: record.classMeeting.class.teacher?.name,
        substituteTeacherId: record.classMeeting.substituteTeacher?.id || null,
        substituteTeacherName: record.classMeeting.substituteTeacher?.name || null,
        meetingId: record.classMeetingId,
        meetingDate: record.classMeeting.date.toISOString(),
        meetingTopic: record.classMeeting.topic || 'Pertemuan',
        status: record.status.toLowerCase() === 'hadir' ? 'present' :
                record.status.toLowerCase() === 'tidak_hadir' ? 'absent' :
                record.status.toLowerCase() === 'terlambat' ? 'late' : 'excused',
        notes: record.notes,
        recordedAt: record.markedAt.toISOString(),
        recordedBy: 'System'
      };
      
      return mappedRecord;
    })

    const duration = Date.now() - startTime
    console.log(`Attendance records fetched in ${duration}ms`)

    return NextResponse.json({
      success: true,
      records: [...studentRecords, ...employeeRecords.map(record => ({
        ...record,
        timestamp: record.timestamp.toISOString()
      }))],
      meta: {
        count: studentRecords.length + employeeRecords.length,
        fetchTime: `${duration}ms`
      }
    })
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil data absensi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received attendance request:', body)

    // Check if this is class attendance or employee attendance
    if (body.classId && body.attendanceRecords) {
      // This is class attendance
      return await handleClassAttendance(body)
    } else {
      // This is employee attendance
      return await handleEmployeeAttendance(body, request)
    }
  } catch (error) {
    console.error('Error recording attendance:', error)
    
    // Better error handling with more details
    let errorMessage = 'Terjadi kesalahan saat mencatat absensi. Silakan coba lagi.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: statusCode }
    )
  }
}

async function handleClassAttendance(body: any) {
  const { 
    classId, 
    teacherId, 
    teacherPresent, 
    attendanceRecords,
    isMainTeacherAbsent,
    mainTeacherId,
    substituteTeacherId,
    teacherNotes
  } = body

  console.log('Processing class attendance:', {
    classId,
    teacherId,
    teacherPresent,
    isMainTeacherAbsent,
    mainTeacherId,
    substituteTeacherId,
    teacherNotes,
    attendanceRecordsCount: attendanceRecords?.length
  })

  // Validate input
  if (!classId || !teacherId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
    return NextResponse.json(
      { error: 'Data absensi kelas tidak lengkap' },
      { status: 400 }
    )
  }

  // Additional validation for substitute teacher
  if (isMainTeacherAbsent && !substituteTeacherId) {
    return NextResponse.json(
      { error: 'Guru pengganti harus dipilih jika guru utama berhalangan' },
      { status: 400 }
    )
  }

  // Check if at least one student is present
  const presentStudents = attendanceRecords.filter(record => 
    record.status === 'HADIR' || record.status === 'TERLAMBAT' || record.status === 'IZIN'
  );
  
  if (presentStudents.length === 0) {
    return NextResponse.json(
      { error: 'Minimal 1 siswa harus hadir untuk mencatat pertemuan' },
      { status: 400 }
    )
  }

  // Get class information including commission settings
  const classData = await db.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        include: { student: true }
      }
    }
  })

  if (!classData) {
    return NextResponse.json(
      { error: 'Kelas tidak ditemukan' },
      { status: 404 }
    )
  }

  // Calculate next meeting number
  const nextMeetingNumber = classData.completedMeetings + 1

  try {
    // Create new meeting record
    const meeting = await db.classMeeting.create({
      data: {
        classId: classId,
        meetingNumber: nextMeetingNumber,
        date: new Date(),
        startTime: new Date(),
        topic: `Pertemuan ${nextMeetingNumber}`,
        status: 'COMPLETED',
        substituteTeacherId: isMainTeacherAbsent ? substituteTeacherId : null,
        actualTeacherId: isMainTeacherAbsent ? substituteTeacherId : classData.teacherId, // Store who actually taught
        notes: `Absensi dicatat: ${attendanceRecords.filter(r => r.status === 'HADIR' || r.status === 'TERLAMBAT' || r.status === 'IZIN').length} siswa hadir`
      }
    })

    console.log('Created meeting:', meeting.id)

    // Process each attendance record
    let presentCount = 0
    const processedAttendanceRecords: AttendanceRecord[] = []
    
    for (const attendanceData of attendanceRecords) {
      const { studentId, status, notes } = attendanceData

      // Find the classStudent record
      const classStudent = await db.classStudent.findFirst({
        where: {
          classId: classId,
          studentId
        }
      })

      if (!classStudent) {
        console.warn(`Student ${studentId} not found in class ${classId}`)
        continue
      }

      // Create attendance record
      await db.attendance.create({
        data: {
          classMeetingId: meeting.id,
          studentId: studentId,
          status: status,
          notes: notes || null,
          markedAt: new Date()
        }
      })

      // Add to processed records for commission calculation
      processedAttendanceRecords.push({
        id: `${meeting.id}-${studentId}`,
        studentId: studentId,
        status: status as 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN',
        notes: notes || null
      })

      if (status === 'HADIR' || status === 'TERLAMBAT' || status === 'IZIN') {
        presentCount++
      }
    }

    // Calculate commission based on class settings
    let commissionCalculation = null
    try {
      const commissionResult = CommissionCalculator.calculateCommission(
        classData.commissionType as 'BY_CLASS' | 'BY_STUDENT',
        classData.commissionAmount,
        processedAttendanceRecords
      )

      commissionCalculation = {
        amount: commissionResult.amount,
        breakdown: commissionResult.breakdown,
        type: classData.commissionType
      }

      // Update meeting with commission information
      await db.classMeeting.update({
        where: { id: meeting.id },
        data: {
          calculatedCommission: commissionResult.amount,
          commissionBreakdown: commissionResult.breakdown
        }
      })

      console.log('Commission calculated:', commissionResult)
    } catch (commissionError) {
      console.error('Error calculating commission:', commissionError)
      // Don't fail the entire attendance recording if commission calculation fails
    }

    // Create teacher attendance records
    if (isMainTeacherAbsent) {
      // Create attendance record for main teacher (absent)
      await db.teacherAttendance.create({
        data: {
          classMeetingId: meeting.id,
          teacherId: mainTeacherId,
          status: 'TIDAK_HADIR',
          notes: `Berhalangan hadir, digantikan oleh guru lain`,
          markedAt: new Date()
        }
      })

      // Create attendance record for substitute teacher (present)
      if (substituteTeacherId) {
        await db.teacherAttendance.create({
          data: {
            classMeetingId: meeting.id,
            teacherId: substituteTeacherId,
            status: 'HADIR',
            notes: teacherNotes || `Menggantikan guru utama`,
            markedAt: new Date()
          }
        })
      }
    } else {
      // Create attendance record for main teacher (present)
      await db.teacherAttendance.create({
        data: {
          classMeetingId: meeting.id,
          teacherId: teacherId,
          status: teacherPresent ? 'HADIR' : 'TIDAK_HADIR',
          markedAt: new Date()
        }
      })
    }

    // Update class completed meetings count and startDate if this is the first meeting
    const updateData: any = {
      completedMeetings: nextMeetingNumber
    };
    
    // If this is the first meeting, set the startDate
    if (nextMeetingNumber === 1 && !classData.startDate) {
      updateData.startDate = new Date();
    }
    
    await db.class.update({
      where: { id: classId },
      data: updateData
    })

    console.log('Class attendance completed successfully')

    const response: any = {
      success: true,
      message: `Absensi berhasil dicatat! ${presentCount} siswa hadir`,
      meetingId: meeting.id,
      presentCount
    }

    // Add commission information if calculated
    if (commissionCalculation) {
      response.commissionCalculation = commissionCalculation
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in class attendance creation:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Data kelas atau siswa tidak valid. Silakan periksa kembali.');
      } else if (error.message.includes('unique constraint')) {
        if (error.message.includes('classId') && error.message.includes('meetingNumber')) {
          throw new Error('Terjadi kesalahan dalam penomoran pertemuan. Silakan refresh halaman dan coba lagi.');
        } else {
          throw new Error('Data duplikat terdeteksi. Silakan periksa kembali.');
        }
      } else {
        throw new Error(`Gagal mencatat absensi: ${error.message}`);
      }
    } else {
      throw new Error('Terjadi kesalahan tidak dikenal saat mencatat absensi.');
    }
  }
}

async function handleEmployeeAttendance(body: any, request: NextRequest) {
  const { employeeName, employeeId, type, notes } = body

  // Validasi input
  if (!employeeName || !employeeId || !type) {
    return NextResponse.json(
      { error: 'Nama, ID karyawan, dan tipe absensi wajib diisi' },
      { status: 400 }
    )
  }

  if (!['check_in', 'check_out'].includes(type)) {
    return NextResponse.json(
      { error: 'Tipe absensi tidak valid' },
      { status: 400 }
    )
  }

  // Validasi nama (hanya huruf, spasi, dan karakter umum)
  if (!/^[a-zA-Z\s\.\-']+$/.test(employeeName.trim())) {
    return NextResponse.json(
      { error: 'Nama karyawan hanya boleh mengandung huruf, spasi, titik, strip, dan apostrof' },
      { status: 400 }
    )
  }

  // Validasi ID karyawan (alphanumeric dan beberapa karakter umum)
  if (!/^[a-zA-Z0-9\-\_]+$/.test(employeeId.trim())) {
    return NextResponse.json(
      { error: 'ID karyawan hanya boleh mengandung huruf, angka, strip, dan underscore' },
      { status: 400 }
    )
  }

  // Cek duplikasi check-in/check-out pada hari yang sama
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existingRecord = await db.employeeAttendance.findFirst({
    where: {
      employeeId: employeeId.trim(),
      type: type,
      timestamp: {
        gte: today,
        lt: tomorrow
      },
      status: 'success'
    }
  })

  if (existingRecord) {
    const typeLabel = type === 'check_in' ? 'Check In' : 'Check Out'
    return NextResponse.json(
      { error: `${typeLabel} untuk karyawan ini sudah dilakukan hari ini` },
      { status: 409 }
    )
  }

  // Dapatkan informasi request untuk tracking
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Simpan record absensi
  const attendanceRecord = await db.employeeAttendance.create({
    data: {
      employeeName: employeeName.trim(),
      employeeId: employeeId.trim(),
      type,
      notes: notes?.trim() || null,
      ipAddress,
      userAgent,
      status: 'success'
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Absensi berhasil dicatat',
    record: {
      id: attendanceRecord.id,
      employeeName: attendanceRecord.employeeName,
      employeeId: attendanceRecord.employeeId,
      type: attendanceRecord.type,
      timestamp: attendanceRecord.timestamp.toISOString(),
      notes: attendanceRecord.notes,
      status: attendanceRecord.status
    }
  })
}