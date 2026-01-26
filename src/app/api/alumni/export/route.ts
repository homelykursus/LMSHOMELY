import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateStudentExcel } from '@/lib/excel-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status'); // completed, graduated, or all
    const courseId = searchParams.get('courseId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    console.log('Export alumni parameters:', {
      status,
      courseId,
      dateFrom,
      dateTo
    });

    // Build where clause for filtering alumni
    const whereClause: any = {
      status: {
        in: ['completed', 'graduated'] // Only alumni
      }
    };

    // Filter by specific status if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by course
    if (courseId && courseId !== 'all') {
      whereClause.courseId = courseId;
    }

    // Filter by registration date range
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    console.log('Database query where clause:', JSON.stringify(whereClause, null, 2));

    // Fetch alumni with related data
    const alumni = await db.student.findMany({
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
        { status: 'asc' }, // completed first, then graduated
        { name: 'asc' }    // Then alphabetical by name
      ]
    });

    console.log(`Found ${alumni.length} alumni for export`);

    if (alumni.length === 0) {
      return NextResponse.json(
        { 
          error: 'No alumni found matching the specified criteria',
          message: 'Try adjusting your filter parameters'
        },
        { status: 404 }
      );
    }

    // Generate Excel file
    const buffer = generateStudentExcel(alumni);

    // Create filename with timestamp and filters
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `alumni_export_${timestamp}`;
    
    // Add filter info to filename
    const filterParts: string[] = [];
    if (status && status !== 'all') {
      filterParts.push(`status_${status}`);
    }
    if (courseId && courseId !== 'all') {
      filterParts.push(`course_${courseId}`);
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
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error exporting alumni to Excel:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to export alumni to Excel',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}