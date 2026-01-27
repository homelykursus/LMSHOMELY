import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup-service';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request);
    if (!user) {
      console.log('❌ [BACKUP RESTORE] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 [BACKUP RESTORE] Starting data restore...');
    console.log(`👤 [BACKUP RESTORE] User: ${user.email}`);

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('❌ [BACKUP RESTORE] Failed to parse form data:', error);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    const backupFile = formData.get('backup') as File;

    if (!backupFile) {
      console.log('❌ [BACKUP RESTORE] No backup file provided');
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 [BACKUP RESTORE] File received: ${backupFile.name} (${backupFile.size} bytes)`);

    // Read file content
    let fileContent;
    try {
      fileContent = await backupFile.text();
      console.log(`📄 [BACKUP RESTORE] File content length: ${fileContent.length} characters`);
    } catch (error) {
      console.error('❌ [BACKUP RESTORE] Failed to read file content:', error);
      return NextResponse.json(
        { error: 'Failed to read backup file' },
        { status: 400 }
      );
    }

    // Parse JSON
    let backupData;
    try {
      backupData = JSON.parse(fileContent);
      console.log('✅ [BACKUP RESTORE] JSON parsed successfully');
    } catch (error) {
      console.error('❌ [BACKUP RESTORE] Invalid JSON format:', error);
      return NextResponse.json(
        { error: 'Invalid backup file format - not valid JSON' },
        { status: 400 }
      );
    }

    // Validate backup data structure
    const backupService = new BackupService();
    const validation = await backupService.validateBackup(backupData);

    if (!validation.isValid) {
      console.error('❌ [BACKUP RESTORE] Backup validation failed:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Invalid backup file',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ [BACKUP RESTORE] Backup validation passed');
    console.log(`📊 [BACKUP RESTORE] Backup info: ${backupData.metadata?.total_records} records from ${backupData.metadata?.created_at}`);

    // Perform restore
    try {
      await backupService.restoreFromBackup(backupData);
      console.log('✅ [BACKUP RESTORE] Data restore completed successfully');
    } catch (error) {
      console.error('❌ [BACKUP RESTORE] Restore operation failed:', error);
      throw error; // Re-throw to be caught by outer catch
    }

    return NextResponse.json({
      success: true,
      message: 'Data restored successfully',
      restored_records: backupData.metadata.total_records,
      backup_date: backupData.metadata.created_at,
      backup_type: backupData.metadata.backup_type
    });

  } catch (error) {
    console.error('❌ [BACKUP RESTORE] Restore failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: 'Restore failed',
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}