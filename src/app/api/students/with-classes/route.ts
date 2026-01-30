import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get students who have classes (eligible for certificates)
export async function GET(request: NextRequest) {
  try {
    // Get students who are enrolled in at least one class
    const studentsWithClasses = await prisma.student.findMany({
      where: {
        classes: {
          some: {} // Has at least one class enrollment
        }
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            duration: true
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
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data for certificate generation
    const transformedStudents = studentsWithClasses.map(student => ({
      id: student.id,
      name: student.name,
      studentNumber: student.studentNumber,
      course: {
        id: student.course.id,
        name: student.course.name,
        duration: student.course.duration
      },
      classCount: student.classes.length,
      teachers: student.classes.map(sc => sc.class.teacher?.name).filter(Boolean),
      hasClasses: student.classes.length > 0
    }));

    return NextResponse.json(transformedStudents);

  } catch (error: any) {
    console.error('Failed to fetch students with classes:', error);
    return NextResponse.json(
      { error: `Failed to fetch students: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}