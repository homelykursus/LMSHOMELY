import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateStudentExcel } from '@/lib/excel-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const courseId = searchParams.get('courseId');
    const classId = searchParams.get('classId');

    console.log('Export parameters:', {
      includeInactive,
      dateFrom,
      dateTo,
      courseId,
      classId
    });

    // Build where clause for filtering
    const whereClause: any = {};

    // Filter by status (exclude alumni)
    if (!includeInactive) {
      whereClause.status = {
        in: ['confirmed'] // Only confirmed students, exclude alumni (completed/graduated)
      };
    } else {
      // Even when including inactive, exclude alumni
      whereClause.status = {
        notIn: ['completed', 'graduated']
      };
    }

    // Filter by join date range
    if (dateFrom || dateTo) {
      whereClause.joinDate = {};
      if (dateFrom) {
        whereClause.joinDate.gte = dateFrom;
      }
      if (dateTo) {
        whereClause.joinDate.lte = dateTo;
      }
    }

    // Filter by course
    if (courseId && courseId !== 'all') {
      whereClause.courseId = courseId;
    }

    // Filter by class (through class enrollment)
    if (classId && classId !== 'all') {
      whereClause.classes = {
        some: {
          classId: classId
        }
      };
    }

    console.log('Database query where clause:', JSON.stringify(whereClause, null, 2));

    // Fetch students with related data
    const students = await db.student.findMany({
      where: whereClause,
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
              select: {
                id: true,
                name: true,
                isActive: true
              }
            }
          },
          orderBy: {
            joinedAt: 'desc'
          },
          take: 1 // Get the most recent class enrollment
        }
      },
      orderBy: [
        { status: 'asc' }, // Active students first
        { name: 'asc' }    // Then alphabetical by name
      ]
    });

    console.log(`Found ${students.length} students for export`);

    if (students.length === 0) {
      return NextResponse.json(
        { 
          error: 'No students found matching the specified criteria',
          message: 'Try adjusting your filter parameters'
        },
        { status: 404 }
      );
    }

    // Generate Excel file
    const buffer = generateStudentExcel(students);

    // Create filename with timestamp and filters
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `students_export_${timestamp}`;
    
    // Add filter info to filename
    const filterParts: string[] = [];
    if (courseId && courseId !== 'all') {
      filterParts.push(`course_${courseId}`);
    }
    if (classId && classId !== 'all') {
      filterParts.push(`class_${classId}`);
    }
    if (!includeInactive) {
      filterParts.push('active_only');
    }
    if (dateFrom || dateTo) {
      filterParts.push('date_filtered');
    }
    
    if (filterParts.length > 0) {
      filename += `_${filterParts.join('_')}`;
    }
    
    filename += '.xlsx';

    console.log(`Generated Excel file: ${filename}, size: ${buffer.length} bytes`);

    // Return the Excel file
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=\"${filename}\"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error exporting students to Excel:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to export students to Excel',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support POST for more complex export options
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      includeInactive = false,
      dateFrom,
      dateTo,
      courseId,
      classId,
      studentIds, // Array of specific student IDs to export
      format = 'xlsx'
    } = body;

    console.log('POST Export parameters:', {
      includeInactive,
      dateFrom,
      dateTo,
      courseId,
      classId,
      studentIds,
      format
    });

    // Build where clause
    const whereClause: any = {};

    // Filter by specific student IDs if provided
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      whereClause.id = {
        in: studentIds
      };
    } else {
      // Apply other filters only if not filtering by specific IDs
      
      if (!includeInactive) {
        whereClause.status = {
          in: ['confirmed'] // Only confirmed students
        };
      } else {
        // Even when including inactive, exclude alumni
        whereClause.status = {
          notIn: ['completed', 'graduated']
        };
      }

      if (dateFrom || dateTo) {
        whereClause.joinDate = {};
        if (dateFrom) {
          whereClause.joinDate.gte = dateFrom;
        }
        if (dateTo) {
          whereClause.joinDate.lte = dateTo;
        }
      }

      if (courseId && courseId !== 'all') {
        whereClause.courseId = courseId;
      }

      if (classId && classId !== 'all') {
        whereClause.classes = {
          some: {
            classId: classId
          }
        };
      }
    }

    // Fetch students
    const students = await db.student.findMany({
      where: whereClause,
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
              select: {
                id: true,
                name: true,
                isActive: true
              }
            }
          },
          orderBy: {
            joinedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: [
        { status: 'asc' },
        { name: 'asc' }
      ]
    });

    if (students.length === 0) {
      return NextResponse.json(
        { 
          error: 'No students found matching the specified criteria'
        },
        { status: 404 }
      );
    }

    // Generate Excel file
    const buffer = generateStudentExcel(students);

    // Create filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `students_export_${timestamp}_${students.length}records.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=\"${filename}\"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in POST export:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}