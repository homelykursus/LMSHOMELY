import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { validateInput, announcementSchema, createErrorResponse } from '@/lib/validation';

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
    
    // Validate input using Zod schema
    const validation = validateInput(announcementSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }
    
    const { title, content, isActive, priority, targetRole } = validation.data;

    console.log('📝 [ANNOUNCEMENTS] Creating new announcement:', { title, targetRole, isActive });

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        isActive,
        priority,
        targetRole,
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