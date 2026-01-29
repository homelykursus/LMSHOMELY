import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    console.log(`📝 [ANNOUNCEMENTS] Updating announcement: ${id}`);

    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        title,
        content,
        isActive,
        priority,
        targetRole
      }
    });

    console.log(`✅ [ANNOUNCEMENTS] Updated announcement: ${id}`);

    return NextResponse.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('❌ [ANNOUNCEMENTS] Error updating announcement:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update announcement',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`🗑️ [ANNOUNCEMENTS] Deleting announcement: ${id}`);

    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    await db.announcement.delete({
      where: { id }
    });

    console.log(`✅ [ANNOUNCEMENTS] Deleted announcement: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('❌ [ANNOUNCEMENTS] Error deleting announcement:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete announcement',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}