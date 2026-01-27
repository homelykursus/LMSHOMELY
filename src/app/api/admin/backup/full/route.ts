import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup-service';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 [BACKUP FULL] Starting full backup...');

    const backupService = new BackupService();
    const backupBuffer = await backupService.createFullBackup();

    const sizeInMB = (backupBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`✅ [BACKUP FULL] Full backup completed: ${sizeInMB} MB`);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `backup-full-${timestamp}.zip`;

    return new NextResponse(backupBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': backupBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ [BACKUP FULL] Full backup failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Full backup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}