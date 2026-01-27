import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup-service';
import { AuthService } from '@/lib/auth';
import JSZip from 'jszip';

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

    let backupData;
    let backupType = 'data';

    // Check if it's a ZIP file (full backup) or JSON file (data backup)
    if (backupFile.name.endsWith('.zip')) {
      console.log('📦 [BACKUP RESTORE] Processing ZIP file (full backup)...');
      backupType = 'full';
      
      try {
        // Read ZIP file
        const arrayBuffer = await backupFile.arrayBuffer();
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);
        
        // Extract database.json from ZIP
        const databaseFile = zipContent.file('database.json');
        if (!databaseFile) {
          throw new Error('database.json not found in ZIP file');
        }
        
        const databaseContent = await databaseFile.async('text');
        backupData = JSON.parse(databaseContent);
        
        console.log('✅ [BACKUP RESTORE] ZIP file processed, database.json extracted');
        
        // Note: File assets (templates, certificates) are not restored in serverless environment
        // This is a limitation of Vercel's serverless functions
        console.log('⚠️  [BACKUP RESTORE] File assets will not be restored (serverless limitation)');
        
      } catch (error) {
        console.error('❌ [BACKUP RESTORE] Failed to process ZIP file:', error);
        return NextResponse.json(
          { error: 'Failed to process ZIP backup file' },
          { status: 400 }
        );
      }
    } else {
      console.log('📄 [BACKUP RESTORE] Processing JSON file (data backup)...');
      
      // Read file content as JSON
      try {
        const fileContent = await backupFile.text();
        console.log(`📄 [BACKUP RESTORE] File content length: ${fileContent.length} characters`);
        backupData = JSON.parse(fileContent);
        console.log('✅ [BACKUP RESTORE] JSON parsed successfully');
      } catch (error) {
        console.error('❌ [BACKUP RESTORE] Failed to read/parse JSON file:', error);
        return NextResponse.json(
          { error: 'Failed to read backup file or invalid JSON format' },
          { status: 400 }
        );
      }
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
      message: backupType === 'full' 
        ? 'Data restored successfully (files not restored due to serverless limitations)' 
        : 'Data restored successfully',
      restored_records: backupData.metadata.total_records,
      backup_date: backupData.metadata.created_at,
      backup_type: backupData.metadata.backup_type,
      notes: backupType === 'full' 
        ? 'File assets (templates, certificates) were not restored due to serverless environment limitations'
        : undefined
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