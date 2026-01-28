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

    // Get all students with gender data
    const students = await prisma.student.findMany({
      where: whereConditions,
      select: {
        id: true,
        gender: true,
        createdAt: true
      }
    });

    // Count by gender
    const genderCounts = students.reduce((acc: any, student) => {
      const gender = student.gender || 'Tidak Diketahui';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format for pie chart
    const genderData = Object.entries(genderCounts).map(([gender, count]) => ({
      name: gender === 'male' ? 'Laki-laki' : 
            gender === 'female' ? 'Perempuan' : 
            gender,
      value: count as number,
      percentage: Math.round(((count as number) / students.length) * 100)
    }));

    // Sort by count (descending)
    genderData.sort((a, b) => b.value - a.value);

    // Calculate summary
    const summary = {
      totalStudents: students.length,
      maleCount: genderCounts.male || 0,
      femaleCount: genderCounts.female || 0,
      unknownCount: genderCounts['Tidak Diketahui'] || 0,
      malePercentage: students.length > 0 ? Math.round(((genderCounts.male || 0) / students.length) * 100) : 0,
      femalePercentage: students.length > 0 ? Math.round(((genderCounts.female || 0) / students.length) * 100) : 0,
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
      data: genderData,
      summary: summary
    });

  } catch (error) {
    console.error('Error fetching gender statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch gender statistics',
        data: [],
        summary: null
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}