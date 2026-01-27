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

      console.log(`📊 Restoring backup from: ${backupData.metadata.created_at}`);
      console.log(`📋 Total records to restore: ${backupData.metadata.total_records}`);

      // Clear existing data and restore (in transaction)
      await db.$transaction(async (tx) => {
        console.log('🗑️  Clearing existing data...');
        
        // Delete in correct order to avoid foreign key constraints
        try {
          await tx.certificate.deleteMany();
          console.log('   ✅ Certificates cleared');
        } catch (e) {
          console.log('   ⚠️  Certificates table not found or empty');
        }

        try {
          await tx.payment.deleteMany();
          console.log('   ✅ Payments cleared');
        } catch (e) {
          console.log('   ⚠️  Payments table not found or empty');
        }

        try {
          await tx.classMeeting.deleteMany();
          console.log('   ✅ Class meetings cleared');
        } catch (e) {
          console.log('   ⚠️  Class meetings table not found or empty');
        }

        try {
          await tx.class.deleteMany();
          console.log('   ✅ Classes cleared');
        } catch (e) {
          console.log('   ⚠️  Classes table not found or empty');
        }

        try {
          await tx.student.deleteMany();
          console.log('   ✅ Students cleared');
        } catch (e) {
          console.log('   ⚠️  Students table not found or empty');
        }

        try {
          await tx.teacher.deleteMany();
          console.log('   ✅ Teachers cleared');
        } catch (e) {
          console.log('   ⚠️  Teachers table not found or empty');
        }

        try {
          await tx.certificateTemplate.deleteMany();
          console.log('   ✅ Certificate templates cleared');
        } catch (e) {
          console.log('   ⚠️  Certificate templates table not found or empty');
        }

        try {
          await tx.course.deleteMany();
          console.log('   ✅ Courses cleared');
        } catch (e) {
          console.log('   ⚠️  Courses table not found or empty');
        }

        try {
          await tx.room.deleteMany();
          console.log('   ✅ Rooms cleared');
        } catch (e) {
          console.log('   ⚠️  Rooms table not found or empty');
        }

        try {
          await tx.financialRecord.deleteMany();
          console.log('   ✅ Financial records cleared');
        } catch (e) {
          console.log('   ⚠️  Financial records table not found or empty');
        }

        try {
          await tx.user.deleteMany();
          console.log('   ✅ Users cleared');
        } catch (e) {
          console.log('   ⚠️  Users table not found or empty');
        }

        console.log('📥 Starting data restoration...');

        // Restore data in correct order
        console.log('📝 Restoring courses...');
        if (backupData.data.courses?.length > 0) {
          try {
            for (const course of backupData.data.courses) {
              const { pricing, students, teachers, classes, certificates, templates, ...courseData } = course;
              await tx.course.create({
                data: {
                  ...courseData,
                  // Ensure required fields have default values
                  category: courseData.category || 'General',
                  isActive: courseData.isActive !== undefined ? courseData.isActive : true,
                  createdAt: courseData.createdAt ? new Date(courseData.createdAt) : new Date(),
                  updatedAt: courseData.updatedAt ? new Date(courseData.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.courses.length} courses restored`);
          } catch (error) {
            console.error('   ❌ Error restoring courses:', error);
            throw error;
          }
        }

        console.log('📝 Restoring rooms...');
        if (backupData.data.rooms?.length > 0) {
          try {
            await tx.room.createMany({
              data: backupData.data.rooms.map(room => ({
                ...room,
                createdAt: room.createdAt ? new Date(room.createdAt) : new Date(),
                updatedAt: room.updatedAt ? new Date(room.updatedAt) : new Date()
              }))
            });
            console.log(`   ✅ ${backupData.data.rooms.length} rooms restored`);
          } catch (error) {
            console.error('   ❌ Error restoring rooms:', error);
            throw error;
          }
        }

        console.log('📝 Restoring teachers...');
        if (backupData.data.teachers?.length > 0) {
          try {
            for (const teacher of backupData.data.teachers) {
              const { courses, classes, attendances, substituteMeetings, actualMeetings, certificates, ...teacherData } = teacher;
              await tx.teacher.create({
                data: {
                  ...teacherData,
                  // Ensure required fields have default values
                  dateOfBirth: teacherData.dateOfBirth || '1990-01-01',
                  education: teacherData.education || 'S1',
                  joinDate: teacherData.joinDate || new Date().toISOString().split('T')[0],
                  status: teacherData.status || 'active',
                  createdAt: teacherData.createdAt ? new Date(teacherData.createdAt) : new Date(),
                  updatedAt: teacherData.updatedAt ? new Date(teacherData.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.teachers.length} teachers restored`);
          } catch (error) {
            console.error('   ❌ Error restoring teachers:', error);
            throw error;
          }
        }

        console.log('📝 Restoring students...');
        if (backupData.data.students?.length > 0) {
          try {
            for (const student of backupData.data.students) {
              const { course, classes, payments, meetings, certificates, attendances, ...studentData } = student;
              await tx.student.create({
                data: {
                  ...studentData,
                  // Ensure required fields have default values
                  dateOfBirth: studentData.dateOfBirth || '2000-01-01',
                  whatsapp: studentData.whatsapp || '081234567890',
                  courseType: studentData.courseType || 'regular',
                  participants: studentData.participants || 1,
                  finalPrice: studentData.finalPrice || 0,
                  discount: studentData.discount || 0,
                  status: studentData.status || 'pending',
                  createdAt: studentData.createdAt ? new Date(studentData.createdAt) : new Date(),
                  updatedAt: studentData.updatedAt ? new Date(studentData.updatedAt) : new Date(),
                  completedAt: studentData.completedAt ? new Date(studentData.completedAt) : null
                }
              });
            }
            console.log(`   ✅ ${backupData.data.students.length} students restored`);
          } catch (error) {
            console.error('   ❌ Error restoring students:', error);
            throw error;
          }
        }

        console.log('📝 Restoring certificate templates...');
        if (backupData.data.certificateTemplates?.length > 0) {
          try {
            for (const template of backupData.data.certificateTemplates) {
              const { certificates, ...templateData } = template;
              await tx.certificateTemplate.create({
                data: {
                  ...templateData,
                  createdAt: templateData.createdAt ? new Date(templateData.createdAt) : new Date(),
                  updatedAt: templateData.updatedAt ? new Date(templateData.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.certificateTemplates.length} certificate templates restored`);
          } catch (error) {
            console.error('   ❌ Error restoring certificate templates:', error);
            throw error;
          }
        }

        console.log('📝 Restoring classes...');
        if (backupData.data.classes?.length > 0) {
          try {
            for (const classData of backupData.data.classes) {
              const { course, teacher, students, meetings, room, ...classInfo } = classData;
              
              // Handle class data with proper field mapping
              const processedClass = {
                ...classInfo,
                // Ensure required fields have proper values
                name: classInfo.name || 'Unnamed Class',
                status: classInfo.status || 'active',
                createdAt: classInfo.createdAt ? new Date(classInfo.createdAt) : new Date(),
                updatedAt: classInfo.updatedAt ? new Date(classInfo.updatedAt) : new Date(),
                startDate: classInfo.startDate ? new Date(classInfo.startDate) : new Date(),
                endDate: classInfo.endDate ? new Date(classInfo.endDate) : null
              };
              
              await tx.class.create({
                data: processedClass
              });
            }
            console.log(`   ✅ ${backupData.data.classes.length} classes restored`);
          } catch (error) {
            console.error('   ❌ Error restoring classes:', error);
            throw error;
          }
        }

        console.log('📝 Restoring meetings...');
        if (backupData.data.meetings?.length > 0) {
          try {
            for (const meeting of backupData.data.meetings) {
              const { class: classData, teacher, actualTeacher, attendances, ...meetingData } = meeting;
              
              // Handle meeting data with proper field mapping
              const processedMeeting = {
                ...meetingData,
                // Ensure required fields have proper values
                meetingNumber: meetingData.meetingNumber || 1,
                status: meetingData.status || 'scheduled',
                createdAt: meetingData.createdAt ? new Date(meetingData.createdAt) : new Date(),
                updatedAt: meetingData.updatedAt ? new Date(meetingData.updatedAt) : new Date(),
                date: meetingData.date ? new Date(meetingData.date) : new Date()
              };
              
              await tx.classMeeting.create({
                data: processedMeeting
              });
            }
            console.log(`   ✅ ${backupData.data.meetings.length} meetings restored`);
          } catch (error) {
            console.error('   ❌ Error restoring meetings:', error);
            throw error;
          }
        }

        console.log('📝 Restoring payments...');
        if (backupData.data.payments?.length > 0) {
          try {
            for (const payment of backupData.data.payments) {
              const { student, transactions, ...paymentData } = payment;
              
              // Handle payment data with proper field mapping
              const processedPayment = {
                ...paymentData,
                // Ensure required fields have proper values
                totalAmount: paymentData.totalAmount || 0,
                paidAmount: paymentData.paidAmount || 0,
                remainingAmount: paymentData.remainingAmount || paymentData.totalAmount || 0,
                status: paymentData.status || 'pending',
                createdAt: paymentData.createdAt ? new Date(paymentData.createdAt) : new Date(),
                updatedAt: paymentData.updatedAt ? new Date(paymentData.updatedAt) : new Date(),
                // Handle date fields properly - map paymentDate to completedAt if exists
                completedAt: paymentData.completedAt ? new Date(paymentData.completedAt) : 
                           (paymentData.paymentDate ? new Date(paymentData.paymentDate) : null),
                dueDate: paymentData.dueDate ? new Date(paymentData.dueDate) : null,
                reminderDismissedAt: paymentData.reminderDismissedAt ? new Date(paymentData.reminderDismissedAt) : null
              };
              
              // Remove any fields that don't exist in the schema
              delete (processedPayment as any).paymentDate;
              
              await tx.payment.create({
                data: processedPayment
              });
            }
            console.log(`   ✅ ${backupData.data.payments.length} payments restored`);
          } catch (error) {
            console.error('   ❌ Error restoring payments:', error);
            throw error;
          }
        }

        console.log('📝 Restoring certificates...');
        if (backupData.data.certificates?.length > 0) {
          try {
            for (const certificate of backupData.data.certificates) {
              const { student, template, ...certData } = certificate;
              
              // Handle certificate data with proper field mapping
              const processedCertificate = {
                ...certData,
                // Ensure required fields have proper values
                certificateNumber: certData.certificateNumber || `CERT-${Date.now()}`,
                status: certData.status || 'issued',
                createdAt: certData.createdAt ? new Date(certData.createdAt) : new Date(),
                updatedAt: certData.updatedAt ? new Date(certData.updatedAt) : new Date(),
                issuedDate: certData.issuedDate ? new Date(certData.issuedDate) : new Date()
              };
              
              await tx.certificate.create({
                data: processedCertificate
              });
            }
            console.log(`   ✅ ${backupData.data.certificates.length} certificates restored`);
          } catch (error) {
            console.error('   ❌ Error restoring certificates:', error);
            throw error;
          }
        }

        console.log('📝 Restoring financial records...');
        if (backupData.data.financialRecords?.length > 0) {
          try {
            await tx.financialRecord.createMany({
              data: backupData.data.financialRecords.map(record => ({
                ...record,
                createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
                updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
                date: record.date ? new Date(record.date) : new Date()
              }))
            });
            console.log(`   ✅ ${backupData.data.financialRecords.length} financial records restored`);
          } catch (error) {
            console.error('   ❌ Error restoring financial records:', error);
            throw error;
          }
        }

        console.log('📝 Restoring users...');
        if (backupData.data.users?.length > 0) {
          try {
            for (const user of backupData.data.users) {
              let userData = { ...user };
              if (userData.password === '[REDACTED]') {
                // Skip users with redacted passwords or set default
                userData.password = 'admin123'; // Default password
              }
              await tx.user.create({
                data: {
                  ...userData,
                  createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
                  updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.users.length} users restored`);
          } catch (error) {
            console.error('   ❌ Error restoring users:', error);
            throw error;
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