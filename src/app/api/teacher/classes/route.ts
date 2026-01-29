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

    // Get classes taught by this teacher
    const classes = await db.class.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true
      },
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
                dateOfBirth: true, // Added for age calculation
                lastEducation: true, // Added for education column
                gender: true // Added for gender column
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format the response to match admin classes API format
    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      description: cls.description,
      maxStudents: cls.maxStudents,
      commissionType: cls.commissionType,
      commissionAmount: cls.commissionAmount,
      schedule: cls.schedule,
      startDate: cls.startDate,
      endDate: cls.endDate,
      totalMeetings: cls.totalMeetings,
      completedMeetings: cls.completedMeetings,
      isActive: cls.isActive,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      course: cls.course,
      teacher: cls.teacher,
      room: cls.room,
      students: cls.students.map(cs => ({
        id: cs.id,
        joinedAt: cs.joinedAt,
        student: cs.student
      }))
    }));

    return NextResponse.json(formattedClasses);

  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}