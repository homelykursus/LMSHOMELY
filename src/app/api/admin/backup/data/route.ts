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

    console.log('🔄 [BACKUP DATA] Starting data backup...');

    const backupService = new BackupService();
    const backupData = await backupService.createDataBackup();

    // Calculate file size
    const jsonString = JSON.stringify(backupData, null, 2);
    const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    console.log(`✅ [BACKUP DATA] Backup completed: ${sizeInMB} MB`);

    return NextResponse.json({
      success: true,
      data: backupData,
      size: `${sizeInMB} MB`,
      records: backupData.metadata.total_records,
      message: 'Data backup created successfully'
    });

  } catch (error) {
    console.error('❌ [BACKUP DATA] Backup failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Backup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}