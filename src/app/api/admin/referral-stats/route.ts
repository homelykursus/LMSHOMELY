import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    console.log('🔍 [REFERRAL STATS] Fetching referral source statistics...');
    console.log(`📅 [REFERRAL STATS] Filters - Month: ${month}, Year: ${year}`);

    // Fetch all students with referral source data
    const students = await db.student.findMany({
      select: {
        id: true,
        referralSource: true,
        createdAt: true,
        name: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 [REFERRAL STATS] Found ${students.length} total students`);

    // Filter students by period if filters are applied
    let filteredStudents = students;
    if (month || year) {
      filteredStudents = students.filter((student) => {
        const registrationDate = new Date(student.createdAt);
        const studentMonth = (registrationDate.getMonth() + 1).toString().padStart(2, '0');
        const studentYear = registrationDate.getFullYear().toString();
        
        const monthMatch = !month || studentMonth === month;
        const yearMatch = !year || studentYear === year;
        
        return monthMatch && yearMatch;
      });
    }

    console.log(`📊 [REFERRAL STATS] Filtered to ${filteredStudents.length} students for the period`);

    // Count referral sources
    const referralCounts: { [key: string]: number } = {};
    const referralLabels: { [key: string]: string } = {
      'Instagram': 'Instagram',
      'Facebook': 'Facebook', 
      'Google': 'Google',
      'Tiktok': 'TikTok',
      'dari Teman': 'Dari Teman',
      'Lainnya': 'Lainnya'
    };

    // Initialize all possible referral sources with 0
    Object.keys(referralLabels).forEach(source => {
      referralCounts[source] = 0;
    });

    // Count actual referral sources
    filteredStudents.forEach((student) => {
      const source = student.referralSource || 'Lainnya';
      if (referralCounts.hasOwnProperty(source)) {
        referralCounts[source]++;
      } else {
        referralCounts['Lainnya']++;
      }
    });

    // Convert to array format for pie chart
    const pieData = Object.entries(referralCounts)
      .map(([source, count]) => ({
        name: referralLabels[source] || source,
        value: count,
        percentage: filteredStudents.length > 0 ? Math.round((count / filteredStudents.length) * 100) : 0
      }))
      .filter(item => item.value > 0) // Only include sources with data
      .sort((a, b) => b.value - a.value); // Sort by count descending

    console.log(`📈 [REFERRAL STATS] Generated pie data:`, pieData);

    // Calculate summary statistics
    const totalStudents = filteredStudents.length;
    const topSource = pieData.length > 0 ? pieData[0] : null;
    
    const summary = {
      totalStudents,
      totalSources: pieData.length,
      topSource: topSource ? {
        name: topSource.name,
        count: topSource.value,
        percentage: topSource.percentage
      } : null,
      period: {
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        monthName: month ? [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ][parseInt(month) - 1] : null
      }
    };

    console.log(`✅ [REFERRAL STATS] Summary:`, summary);

    return NextResponse.json({
      success: true,
      data: pieData,
      summary,
      filters: {
        month,
        year
      }
    });

  } catch (error) {
    console.error('❌ [REFERRAL STATS] Error fetching referral statistics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch referral statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}