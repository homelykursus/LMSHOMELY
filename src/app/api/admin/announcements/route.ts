import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔍 [ANNOUNCEMENTS] Fetching announcements for admin...');

    const announcements = await db.announcement.findMany({
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`📢 [ANNOUNCEMENTS] Found ${announcements.length} announcements`);

    return NextResponse.json({
      success: true,
      data: announcements
    });

  } catch (error) {
    console.error('❌ [ANNOUNCEMENTS] Error fetching announcements:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch announcements',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, isActive, priority, targetRole } = body;

    console.log('📝 [ANNOUNCEMENTS] Creating new announcement:', { title, targetRole, isActive });

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        isActive: isActive ?? true,
        priority: priority ?? 1,
        targetRole: targetRole ?? 'teacher',
        createdBy: user.id
      }
    });

    console.log(`✅ [ANNOUNCEMENTS] Created announcement: ${announcement.id}`);

    return NextResponse.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('❌ [ANNOUNCEMENTS] Error creating announcement:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create announcement',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}