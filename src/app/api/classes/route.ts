import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // Build where clause based on query parameters
    const whereClause: any = {};
    
    if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    const classes = await db.class.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            education: true,
            specialization: true,
            status: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true
          }
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                whatsapp: true,
                dateOfBirth: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      courseId, 
      teacherId, 
      roomId, 
      maxStudents, 
      commissionType,
      commissionAmount, 
      schedule, 
      startDate, 
      endDate,
      totalMeetings,
      studentIds 
    } = body;

    // Validation
    if (!name || !courseId || !roomId || !maxStudents || !commissionType || !commissionAmount || !schedule || !totalMeetings) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate commission type
    if (!['BY_CLASS', 'BY_STUDENT'].includes(commissionType)) {
      return NextResponse.json(
        { error: 'Commission type must be either BY_CLASS or BY_STUDENT' },
        { status: 400 }
      );
    }

    // Validate commission amount
    if (typeof commissionAmount !== 'number' || commissionAmount < 0) {
      return NextResponse.json(
        { error: 'Commission amount must be a non-negative number' },
        { status: 400 }
      );
    }

    if (commissionAmount > 10000000) {
      return NextResponse.json(
        { error: 'Commission amount cannot exceed Rp 10,000,000' },
        { status: 400 }
      );
    }

    // Check if teacher exists and is active (only if teacherId is provided)
    if (teacherId) {
      const teacher = await db.teacher.findUnique({
        where: { id: teacherId }
      });

      if (!teacher || teacher.status !== 'active') {
        return NextResponse.json(
          { error: 'Teacher not found or not active' },
          { status: 400 }
        );
      }
    }

    // Check if room exists and is active
    const room = await db.room.findUnique({
      where: { id: roomId }
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: 'Room not found or not active' },
        { status: 400 }
      );
    }

    // Create class
    const classData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      course: {
        connect: { id: courseId }
      },
      room: {
        connect: { id: roomId }
      },
      maxStudents,
      commissionType,
      commissionAmount,
      schedule: schedule.trim(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      totalMeetings
    };

    // Only connect teacher if teacherId is provided
    if (teacherId) {
      classData.teacher = {
        connect: { id: teacherId }
      };
    }

    const newClass = await db.class.create({
      data: classData,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            education: true,
            specialization: true,
            status: true
          }
        },
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true
          }
        }
      }
    });

    // Add students to class if provided
    if (studentIds && studentIds.length > 0) {
      const classStudents = studentIds.map((studentId: string) => ({
        classId: newClass.id,
        studentId
      }));

      await db.classStudent.createMany({
        data: classStudents
      });
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}