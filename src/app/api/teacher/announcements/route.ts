import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify teacher authentication
    const teacher = await AuthService.getTeacherFromRequest(request);
    if (!teacher) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 [TEACHER ANNOUNCEMENTS] Fetching active announcements for teacher...');

    const announcements = await db.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { targetRole: 'teacher' },
          { targetRole: 'all' }
        ]
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`📢 [TEACHER ANNOUNCEMENTS] Found ${announcements.length} active announcements`);

    return NextResponse.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('❌ [TEACHER ANNOUNCEMENTS] Error fetching announcements:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch announcements',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}