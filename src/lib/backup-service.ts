import { PrismaClient } from '@prisma/client';
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export interface BackupMetadata {
  version: string;
  created_at: string;
  backup_type: 'data' | 'full';
  total_records: number;
  file_size?: string;
  description: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    students: any[];
    teachers: any[];
    classes: any[];
    courses: any[];
    meetings: any[];
    payments: any[];
    certificates: any[];
    certificateTemplates: any[];
    users: any[];
    financialRecords: any[];
    rooms: any[];
  };
  assets?: {
    cloudinary_urls: string[];
    local_files: string[];
  };
}

export class BackupService {
  /**
   * Create data-only backup (database only)
   */
  async createDataBackup(): Promise<BackupData> {
    try {
      console.log('🔄 Starting data backup...');

      // Fetch basic data from database (without complex relations for now)
      const [
        students,
        teachers,
        classes,
        courses,
        users,
        rooms
      ] = await Promise.all([
        db.student.findMany(),
        db.teacher.findMany(),
        db.class.findMany(),
        db.course.findMany(),
        db.user.findMany(),
        db.room.findMany()
      ]);

      // Try to get other data if tables exist
      let payments: any[] = [];
      let certificates: any[] = [];
      let certificateTemplates: any[] = [];
      let financialRecords: any[] = [];
      let meetings: any[] = [];

      try {
        payments = await db.payment.findMany();
      } catch (e) {
        console.warn('⚠️  Payment table not accessible');
      }

      try {
        certificates = await db.certificate.findMany();
      } catch (e) {
        console.warn('⚠️  Certificate table not accessible');
      }

      try {
        certificateTemplates = await db.certificateTemplate.findMany();
      } catch (e) {
        console.warn('⚠️  CertificateTemplate table not accessible');
      }

      try {
        financialRecords = await db.financialRecord.findMany();
      } catch (e) {
        console.warn('⚠️  FinancialRecord table not accessible');
      }

      try {
        meetings = await db.classMeeting.findMany();
      } catch (e) {
        console.warn('⚠️  ClassMeeting table not accessible');
      }

      // Calculate total records
      const totalRecords = students.length + teachers.length + classes.length + 
                          courses.length + payments.length + certificates.length + 
                          certificateTemplates.length + users.length + 
                          financialRecords.length + rooms.length + meetings.length;

      // Create backup data structure
      const backupData: BackupData = {
        metadata: {
          version: '1.0',
          created_at: new Date().toISOString(),
          backup_type: 'data',
          total_records: totalRecords,
          description: 'Database backup - data only (no files)'
        },
        data: {
          students,
          teachers,
          classes,
          courses,
          meetings,
          payments,
          certificates,
          certificateTemplates,
          users: users.map(user => ({
            ...user,
            password: '[REDACTED]' // Don't backup passwords
          })),
          financialRecords,
          rooms
        }
      };

      console.log(`✅ Data backup completed: ${totalRecords} records`);
      return backupData;

    } catch (error) {
      console.error('❌ Data backup failed:', error);
      throw new Error(`Data backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create full backup (database + files)
   */
  async createFullBackup(): Promise<Buffer> {
    try {
      console.log('🔄 Starting full backup...');

      // Get data backup first
      const dataBackup = await this.createDataBackup();
      dataBackup.metadata.backup_type = 'full';
      dataBackup.metadata.description = 'Full backup - database and files';

      // Create ZIP file
      const zip = new JSZip();

      // Add database backup as JSON
      zip.file('database.json', JSON.stringify(dataBackup, null, 2));

      // Add file assets
      const assets = await this.collectFileAssets();
      
      // Add certificate templates
      if (assets.certificateTemplates.length > 0) {
        const templatesFolder = zip.folder('certificate-templates');
        for (const template of assets.certificateTemplates) {
          try {
            const fileBuffer = await fs.readFile(template.path);
            templatesFolder?.file(template.name, fileBuffer);
          } catch (error) {
            console.warn(`⚠️  Could not read template file: ${template.path}`);
          }
        }
      }

      // Add generated certificates
      if (assets.certificates.length > 0) {
        const certsFolder = zip.folder('certificates');
        for (const cert of assets.certificates) {
          try {
            const fileBuffer = await fs.readFile(cert.path);
            certsFolder?.file(cert.name, fileBuffer);
          } catch (error) {
            console.warn(`⚠️  Could not read certificate file: ${cert.path}`);
          }
        }
      }

      // Add asset manifest
      zip.file('assets-manifest.json', JSON.stringify(assets, null, 2));

      // Generate ZIP buffer
      const zipBuffer = await zip.generateAsync({ 
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      console.log(`✅ Full backup completed: ${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      return zipBuffer;

    } catch (error) {
      console.error('❌ Full backup failed:', error);
      throw new Error(`Full backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backupData: BackupData): Promise<void> {
    try {
      console.log('🔄 Starting data restore...');

      // Validate backup data
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup format');
      }

      // Clear existing data (in transaction)
      await db.$transaction(async (tx) => {
        // Delete in correct order to avoid foreign key constraints
        await tx.certificate.deleteMany();
        await tx.payment.deleteMany();
        await tx.classMeeting.deleteMany();
        await tx.class.deleteMany();
        await tx.student.deleteMany();
        await tx.teacher.deleteMany();
        await tx.certificateTemplate.deleteMany();
        await tx.course.deleteMany();
        await tx.room.deleteMany();
        await tx.financialRecord.deleteMany();
        await tx.user.deleteMany();

        // Restore data in correct order
        console.log('📝 Restoring courses...');
        if (backupData.data.courses?.length > 0) {
          await tx.course.createMany({
            data: backupData.data.courses
          });
        }

        console.log('📝 Restoring rooms...');
        if (backupData.data.rooms?.length > 0) {
          await tx.room.createMany({
            data: backupData.data.rooms
          });
        }

        console.log('📝 Restoring teachers...');
        if (backupData.data.teachers?.length > 0) {
          for (const teacher of backupData.data.teachers) {
            const { classes, meetings, commissions, ...teacherData } = teacher;
            await tx.teacher.create({
              data: teacherData
            });
          }
        }

        console.log('📝 Restoring students...');
        if (backupData.data.students?.length > 0) {
          for (const student of backupData.data.students) {
            const { classes, payments, meetings, certificates, ...studentData } = student;
            await tx.student.create({
              data: studentData
            });
          }
        }

        console.log('📝 Restoring certificate templates...');
        if (backupData.data.certificateTemplates?.length > 0) {
          for (const template of backupData.data.certificateTemplates) {
            const { certificates, ...templateData } = template;
            await tx.certificateTemplate.create({
              data: templateData
            });
          }
        }

        console.log('📝 Restoring classes...');
        if (backupData.data.classes?.length > 0) {
          for (const classData of backupData.data.classes) {
            const { course, teacher, students, meetings, room, ...classInfo } = classData;
            await tx.class.create({
              data: classInfo
            });
          }
        }

        console.log('📝 Restoring meetings...');
        if (backupData.data.meetings?.length > 0) {
          for (const meeting of backupData.data.meetings) {
            const { class: classData, teacher, actualTeacher, attendances, ...meetingData } = meeting;
            await tx.meeting.create({
              data: meetingData
            });
          }
        }

        console.log('📝 Restoring payments...');
        if (backupData.data.payments?.length > 0) {
          for (const payment of backupData.data.payments) {
            const { student, ...paymentData } = payment;
            await tx.payment.create({
              data: paymentData
            });
          }
        }

        console.log('📝 Restoring certificates...');
        if (backupData.data.certificates?.length > 0) {
          for (const certificate of backupData.data.certificates) {
            const { student, template, ...certData } = certificate;
            await tx.certificate.create({
              data: certData
            });
          }
        }

        console.log('📝 Restoring financial records...');
        if (backupData.data.financialRecords?.length > 0) {
          await tx.financialRecord.createMany({
            data: backupData.data.financialRecords
          });
        }

        console.log('📝 Restoring users...');
        if (backupData.data.users?.length > 0) {
          for (const user of backupData.data.users) {
            if (user.password === '[REDACTED]') {
              // Skip users with redacted passwords or set default
              user.password = 'admin123'; // Default password
            }
            await tx.user.create({
              data: user
            });
          }
        }
      });

      console.log('✅ Data restore completed successfully');

    } catch (error) {
      console.error('❌ Data restore failed:', error);
      throw new Error(`Data restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Collect file assets for full backup
   */
  private async collectFileAssets() {
    const assets = {
      certificateTemplates: [] as Array<{name: string, path: string}>,
      certificates: [] as Array<{name: string, path: string}>,
      cloudinary_urls: [] as string[]
    };

    try {
      // Collect certificate templates
      const templatesDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
      try {
        const templateFiles = await fs.readdir(templatesDir);
        for (const file of templateFiles) {
          if (file.endsWith('.docx')) {
            assets.certificateTemplates.push({
              name: file,
              path: path.join(templatesDir, file)
            });
          }
        }
      } catch (error) {
        console.warn('⚠️  Certificate templates directory not found');
      }

      // Collect generated certificates
      const certsDir = path.join(process.cwd(), 'public', 'certificates');
      try {
        const certFiles = await fs.readdir(certsDir);
        for (const file of certFiles) {
          if (file.endsWith('.pdf')) {
            assets.certificates.push({
              name: file,
              path: path.join(certsDir, file)
            });
          }
        }
      } catch (error) {
        console.warn('⚠️  Certificates directory not found');
      }

      // Collect Cloudinary URLs from database
      const students = await db.student.findMany({
        select: { photoUrl: true }
      });
      const teachers = await db.teacher.findMany({
        select: { photoUrl: true }
      });

      students.forEach(student => {
        if (student.photoUrl && student.photoUrl.includes('cloudinary')) {
          assets.cloudinary_urls.push(student.photoUrl);
        }
      });

      teachers.forEach(teacher => {
        if (teacher.photoUrl && teacher.photoUrl.includes('cloudinary')) {
          assets.cloudinary_urls.push(teacher.photoUrl);
        }
      });

    } catch (error) {
      console.warn('⚠️  Error collecting file assets:', error);
    }

    return assets;
  }

  /**
   * Validate backup file
   */
  async validateBackup(backupData: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check metadata
      if (!backupData.metadata) {
        errors.push('Missing backup metadata');
      } else {
        if (!backupData.metadata.version) errors.push('Missing backup version');
        if (!backupData.metadata.created_at) errors.push('Missing backup creation date');
        if (!backupData.metadata.backup_type) errors.push('Missing backup type');
      }

      // Check data structure
      if (!backupData.data) {
        errors.push('Missing backup data');
      } else {
        const requiredTables = ['students', 'teachers', 'classes', 'courses'];
        for (const table of requiredTables) {
          if (!Array.isArray(backupData.data[table])) {
            errors.push(`Invalid or missing ${table} data`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid backup file format']
      };
    }
  }
}