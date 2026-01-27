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

    console.log('🔄 [BACKUP RESTORE] Starting data restore...');

    const formData = await request.formData();
    const backupFile = formData.get('backup') as File;

    if (!backupFile) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await backupFile.text();
    let backupData;

    try {
      backupData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    // Validate backup data
    const backupService = new BackupService();
    const validation = await backupService.validateBackup(backupData);

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid backup file',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Perform restore
    await backupService.restoreFromBackup(backupData);

    console.log('✅ [BACKUP RESTORE] Data restore completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Data restored successfully',
      restored_records: backupData.metadata.total_records,
      backup_date: backupData.metadata.created_at
    });

  } catch (error) {
    console.error('❌ [BACKUP RESTORE] Restore failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Restore failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}