import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build filter conditions
    const whereConditions: any = {};
    
    if (month || year) {
      whereConditions.createdAt = {};
      
      if (year) {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        
        if (month) {
          const startOfMonth = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`);
          const endOfMonth = new Date(startOfMonth);
          endOfMonth.setMonth(endOfMonth.getMonth() + 1);
          endOfMonth.setDate(0);
          endOfMonth.setHours(23, 59, 59, 999);
          
          whereConditions.createdAt.gte = startOfMonth;
          whereConditions.createdAt.lte = endOfMonth;
        } else {
          whereConditions.createdAt.gte = startOfYear;
          whereConditions.createdAt.lte = endOfYear;
        }
      }
    }

    // Get all students with course data
    const students = await prisma.student.findMany({
      where: whereConditions,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    // Count by course
    const courseCounts = students.reduce((acc: any, student) => {
      const courseName = student.course?.name || 'Kursus Tidak Diketahui';
      const courseId = student.course?.id || 'unknown';
      const courseCategory = student.course?.category || 'Umum';
      
      if (!acc[courseId]) {
        acc[courseId] = {
          id: courseId,
          name: courseName,
          category: courseCategory,
          count: 0
        };
      }
      acc[courseId].count++;
      return acc;
    }, {});

    // Convert to array format for pie chart
    const courseData = Object.values(courseCounts).map((course: any) => ({
      id: course.id,
      name: course.name,
      category: course.category,
      value: course.count,
      percentage: Math.round((course.count / students.length) * 100)
    }));

    // Sort by count (descending)
    courseData.sort((a: any, b: any) => b.value - a.value);

    // Get top 3 courses
    const topCourses = courseData.slice(0, 3);

    // Calculate summary
    const summary = {
      totalStudents: students.length,
      totalCourses: courseData.length,
      topCourse: courseData.length > 0 ? {
        name: courseData[0].name,
        count: courseData[0].value,
        percentage: courseData[0].percentage
      } : null,
      courseDistribution: courseData.map((course: any) => ({
        name: course.name,
        count: course.value,
        percentage: course.percentage
      })),
      period: {
        month: month,
        year: year,
        monthName: month ? [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ][parseInt(month) - 1] : null
      }
    };

    return NextResponse.json({
      success: true,
      data: courseData,
      summary: summary
    });

  } catch (error) {
    console.error('Error fetching course statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch course statistics',
        data: [],
        summary: null
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}