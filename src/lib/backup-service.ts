import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';

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
    // Core entities
    students: any[];
    teachers: any[];
    classes: any[];
    courses: any[];
    coursePricing: any[];
    users: any[];
    rooms: any[];
    
    // Relations
    classStudents: any[]; // Junction table for Class-Student relations
    teacherCourses: any[]; // Teacher-Course relations
    
    // Meetings & Attendance
    meetings: any[]; // ClassMeeting
    teacherAttendances: any[]; // Teacher attendance records
    attendances: any[]; // Student attendance records
    employeeAttendances: any[]; // Employee attendance records
    
    // Payments
    payments: any[];
    paymentTransactions: any[];
    
    // Certificates
    certificates: any[];
    certificateTemplates: any[];
    
    // Announcements
    announcements: any[]; // System announcements
    
    // Web Content (Landing Page)
    heroSections: any[]; // Hero section content
    facilities: any[]; // Facilities list
    testimonials: any[]; // Testimonials
    galleryImages: any[]; // Gallery images
    locationInfo: any[]; // Location information
    landingCourses: any[]; // Landing page courses
    
    // Blog
    blogPosts: any[]; // Blog posts
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

      console.log('📦 Fetching all data from database...');
      
      // Fetch ALL data from database with proper error handling
      // Core entities
      let students: any[] = [];
      let teachers: any[] = [];
      let classes: any[] = [];
      let courses: any[] = [];
      let coursePricing: any[] = [];
      let users: any[] = [];
      let rooms: any[] = [];
      
      // Relations
      let classStudents: any[] = [];
      let teacherCourses: any[] = [];
      
      // Meetings & Attendance
      let meetings: any[] = [];
      let teacherAttendances: any[] = [];
      let attendances: any[] = [];
      let employeeAttendances: any[] = [];
      
      // Payments
      let payments: any[] = [];
      let paymentTransactions: any[] = [];
      
      // Certificates
      let certificates: any[] = [];
      let certificateTemplates: any[] = [];
      
      // Announcements
      let announcements: any[] = [];
      
      // Web Content (Landing Page)
      let heroSections: any[] = [];
      let facilities: any[] = [];
      let testimonials: any[] = [];
      let galleryImages: any[] = [];
      let locationInfo: any[] = [];
      let landingCourses: any[] = [];
      
      // Blog
      let blogPosts: any[] = [];

      // Fetch core entities
      try {
        students = await db.student.findMany();
        console.log(`✅ Students: ${students.length}`);
      } catch (e) {
        console.warn('⚠️  Student table not accessible');
      }

      try {
        teachers = await db.teacher.findMany();
        console.log(`✅ Teachers: ${teachers.length}`);
      } catch (e) {
        console.warn('⚠️  Teacher table not accessible');
      }

      try {
        classes = await db.class.findMany();
        console.log(`✅ Classes: ${classes.length}`);
      } catch (e) {
        console.warn('⚠️  Class table not accessible');
      }

      try {
        courses = await db.course.findMany();
        console.log(`✅ Courses: ${courses.length}`);
      } catch (e) {
        console.warn('⚠️  Course table not accessible');
      }

      try {
        coursePricing = await db.coursePricing.findMany();
        console.log(`✅ CoursePricing: ${coursePricing.length}`);
      } catch (e) {
        console.warn('⚠️  CoursePricing table not accessible');
      }

      try {
        users = await db.user.findMany();
        console.log(`✅ Users: ${users.length}`);
      } catch (e) {
        console.warn('⚠️  User table not accessible');
      }

      try {
        rooms = await db.room.findMany();
        console.log(`✅ Rooms: ${rooms.length}`);
      } catch (e) {
        console.warn('⚠️  Room table not accessible');
      }

      // Fetch relations
      try {
        classStudents = await db.classStudent.findMany();
        console.log(`✅ ClassStudents: ${classStudents.length}`);
      } catch (e) {
        console.warn('⚠️  ClassStudent table not accessible');
      }

      try {
        teacherCourses = await db.teacherCourse.findMany();
        console.log(`✅ TeacherCourses: ${teacherCourses.length}`);
      } catch (e) {
        console.warn('⚠️  TeacherCourse table not accessible');
      }

      // Fetch meetings & attendance
      try {
        meetings = await db.classMeeting.findMany();
        console.log(`✅ ClassMeetings: ${meetings.length}`);
      } catch (e) {
        console.warn('⚠️  ClassMeeting table not accessible');
      }

      try {
        teacherAttendances = await db.teacherAttendance.findMany();
        console.log(`✅ TeacherAttendances: ${teacherAttendances.length}`);
      } catch (e) {
        console.warn('⚠️  TeacherAttendance table not accessible');
      }

      try {
        attendances = await db.attendance.findMany();
        console.log(`✅ Attendances: ${attendances.length}`);
      } catch (e) {
        console.warn('⚠️  Attendance table not accessible');
      }

      try {
        employeeAttendances = await db.employeeAttendance.findMany();
        console.log(`✅ EmployeeAttendances: ${employeeAttendances.length}`);
      } catch (e) {
        console.warn('⚠️  EmployeeAttendance table not accessible');
      }

      // Fetch payments
      try {
        payments = await db.payment.findMany();
        console.log(`✅ Payments: ${payments.length}`);
      } catch (e) {
        console.warn('⚠️  Payment table not accessible');
      }

      try {
        paymentTransactions = await db.paymentTransaction.findMany();
        console.log(`✅ PaymentTransactions: ${paymentTransactions.length}`);
      } catch (e) {
        console.warn('⚠️  PaymentTransaction table not accessible');
      }

      // Fetch certificates
      try {
        certificates = await db.certificate.findMany();
        console.log(`✅ Certificates: ${certificates.length}`);
      } catch (e) {
        console.warn('⚠️  Certificate table not accessible');
      }

      try {
        certificateTemplates = await db.certificateTemplate.findMany();
        console.log(`✅ CertificateTemplates: ${certificateTemplates.length}`);
      } catch (e) {
        console.warn('⚠️  CertificateTemplate table not accessible');
      }

      // Fetch announcements
      try {
        announcements = await db.announcement.findMany();
        console.log(`✅ Announcements: ${announcements.length}`);
      } catch (e) {
        console.warn('⚠️  Announcement table not accessible');
      }

      // Fetch web content (Landing Page)
      try {
        heroSections = await db.heroSection.findMany();
        console.log(`✅ HeroSections: ${heroSections.length}`);
      } catch (e) {
        console.warn('⚠️  HeroSection table not accessible');
      }

      try {
        facilities = await db.facility.findMany();
        console.log(`✅ Facilities: ${facilities.length}`);
      } catch (e) {
        console.warn('⚠️  Facility table not accessible');
      }

      try {
        testimonials = await db.testimonial.findMany();
        console.log(`✅ Testimonials: ${testimonials.length}`);
      } catch (e) {
        console.warn('⚠️  Testimonial table not accessible');
      }

      try {
        galleryImages = await db.galleryImage.findMany();
        console.log(`✅ GalleryImages: ${galleryImages.length}`);
      } catch (e) {
        console.warn('⚠️  GalleryImage table not accessible');
      }

      try {
        locationInfo = await db.locationInfo.findMany();
        console.log(`✅ LocationInfo: ${locationInfo.length}`);
      } catch (e) {
        console.warn('⚠️  LocationInfo table not accessible');
      }

      try {
        landingCourses = await db.landingCourse.findMany();
        console.log(`✅ LandingCourses: ${landingCourses.length}`);
      } catch (e) {
        console.warn('⚠️  LandingCourse table not accessible');
      }

      // Fetch blog
      try {
        blogPosts = await db.blogPost.findMany();
        console.log(`✅ BlogPosts: ${blogPosts.length}`);
      } catch (e) {
        console.warn('⚠️  BlogPost table not accessible');
      }

      // Calculate total records
      const totalRecords = students.length + teachers.length + classes.length + 
                          courses.length + coursePricing.length + users.length + rooms.length +
                          classStudents.length + teacherCourses.length +
                          meetings.length + teacherAttendances.length + attendances.length + employeeAttendances.length +
                          payments.length + paymentTransactions.length + 
                          certificates.length + certificateTemplates.length + 
                          announcements.length +
                          heroSections.length + facilities.length + testimonials.length + 
                          galleryImages.length + locationInfo.length + landingCourses.length +
                          blogPosts.length;

      // Create backup data structure with ALL tables
      const backupData: BackupData = {
        metadata: {
          version: '2.0', // Updated version for new comprehensive backup
          created_at: new Date().toISOString(),
          backup_type: 'data',
          total_records: totalRecords,
          description: 'Comprehensive database backup - all tables included'
        },
        data: {
          // Core entities
          students,
          teachers,
          classes,
          courses,
          coursePricing,
          users: users.map(user => ({
            ...user,
            password: '[REDACTED]' // Don't backup passwords for security
          })),
          rooms,
          
          // Relations
          classStudents,
          teacherCourses,
          
          // Meetings & Attendance
          meetings,
          teacherAttendances,
          attendances,
          employeeAttendances,
          
          // Payments
          payments,
          paymentTransactions,
          
          // Certificates
          certificates,
          certificateTemplates,
          
          // Announcements
          announcements,
          
          // Web Content (Landing Page)
          heroSections,
          facilities,
          testimonials,
          galleryImages,
          locationInfo,
          landingCourses,
          
          // Blog
          blogPosts
        }
      };

      console.log(`✅ Comprehensive backup completed: ${totalRecords} records from ${Object.keys(backupData.data).length} tables`);
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
            console.log(`📄 Added template: ${template.name}`);
          } catch (error) {
            console.warn(`⚠️  Could not read template file: ${template.path} (serverless limitation)`);
          }
        }
      } else {
        console.log('📄 No certificate templates to backup');
      }

      // Add generated certificates
      if (assets.certificates.length > 0) {
        const certsFolder = zip.folder('certificates');
        for (const cert of assets.certificates) {
          try {
            const fileBuffer = await fs.readFile(cert.path);
            certsFolder?.file(cert.name, fileBuffer);
            console.log(`📄 Added certificate: ${cert.name}`);
          } catch (error) {
            console.warn(`⚠️  Could not read certificate file: ${cert.path} (serverless limitation)`);
          }
        }
      } else {
        console.log('📄 No generated certificates to backup');
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

      // Clear existing data and restore (in transaction with increased timeout)
      await db.$transaction(async (tx) => {
        console.log('🗑️  Clearing existing data...');
        
        // Delete in correct order to avoid foreign key constraints
        // Start with dependent tables first
        
        try {
          await tx.certificate.deleteMany();
          console.log('   ✅ Certificates cleared');
        } catch (e) {
          console.log('   ⚠️  Certificates table not found or empty');
        }

        try {
          await tx.paymentTransaction.deleteMany();
          console.log('   ✅ Payment transactions cleared');
        } catch (e) {
          console.log('   ⚠️  Payment transactions table not found or empty');
        }

        try {
          await tx.payment.deleteMany();
          console.log('   ✅ Payments cleared');
        } catch (e) {
          console.log('   ⚠️  Payments table not found or empty');
        }

        try {
          await tx.attendance.deleteMany();
          console.log('   ✅ Student attendance cleared');
        } catch (e) {
          console.log('   ⚠️  Student attendance table not found or empty');
        }

        try {
          await tx.teacherAttendance.deleteMany();
          console.log('   ✅ Teacher attendance cleared');
        } catch (e) {
          console.log('   ⚠️  Teacher attendance table not found or empty');
        }

        try {
          await tx.classMeeting.deleteMany();
          console.log('   ✅ Class meetings cleared');
        } catch (e) {
          console.log('   ⚠️  Class meetings table not found or empty');
        }

        try {
          await tx.classStudent.deleteMany();
          console.log('   ✅ Class-student relations cleared');
        } catch (e) {
          console.log('   ⚠️  Class-student relations table not found or empty');
        }

        try {
          await tx.teacherCourse.deleteMany();
          console.log('   ✅ Teacher-course relations cleared');
        } catch (e) {
          console.log('   ⚠️  Teacher-course relations table not found or empty');
        }

        try {
          await tx.announcement.deleteMany();
          console.log('   ✅ Announcements cleared');
        } catch (e) {
          console.log('   ⚠️  Announcements table not found or empty');
        }

        try {
          await tx.employeeAttendance.deleteMany();
          console.log('   ✅ Employee attendance cleared');
        } catch (e) {
          console.log('   ⚠️  Employee attendance table not found or empty');
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
          await tx.coursePricing.deleteMany();
          console.log('   ✅ Course pricing cleared');
        } catch (e) {
          console.log('   ⚠️  Course pricing table not found or empty');
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
          await tx.user.deleteMany();
          console.log('   ✅ Users cleared');
        } catch (e) {
          console.log('   ⚠️  Users table not found or empty');
        }

        // Clear web content tables
        try {
          await tx.blogPost.deleteMany();
          console.log('   ✅ Blog posts cleared');
        } catch (e) {
          console.log('   ⚠️  Blog posts table not found or empty');
        }

        try {
          await tx.landingCourse.deleteMany();
          console.log('   ✅ Landing courses cleared');
        } catch (e) {
          console.log('   ⚠️  Landing courses table not found or empty');
        }

        try {
          await tx.locationInfo.deleteMany();
          console.log('   ✅ Location info cleared');
        } catch (e) {
          console.log('   ⚠️  Location info table not found or empty');
        }

        try {
          await tx.galleryImage.deleteMany();
          console.log('   ✅ Gallery images cleared');
        } catch (e) {
          console.log('   ⚠️  Gallery images table not found or empty');
        }

        try {
          await tx.testimonial.deleteMany();
          console.log('   ✅ Testimonials cleared');
        } catch (e) {
          console.log('   ⚠️  Testimonials table not found or empty');
        }

        try {
          await tx.facility.deleteMany();
          console.log('   ✅ Facilities cleared');
        } catch (e) {
          console.log('   ⚠️  Facilities table not found or empty');
        }

        try {
          await tx.heroSection.deleteMany();
          console.log('   ✅ Hero sections cleared');
        } catch (e) {
          console.log('   ⚠️  Hero sections table not found or empty');
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

        console.log('📝 Restoring course pricing...');
        if (backupData.data.coursePricing?.length > 0) {
          try {
            for (const pricing of backupData.data.coursePricing) {
              const { course, ...pricingData } = pricing;
              await tx.coursePricing.create({
                data: {
                  ...pricingData,
                  // Ensure required fields have default values
                  basePrice: pricingData.basePrice || 0,
                  discountRate: pricingData.discountRate || 0,
                  isActive: pricingData.isActive !== undefined ? pricingData.isActive : true,
                  createdAt: pricingData.createdAt ? new Date(pricingData.createdAt) : new Date(),
                  updatedAt: pricingData.updatedAt ? new Date(pricingData.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.coursePricing.length} course pricing restored`);
          } catch (error) {
            console.error('   ❌ Error restoring course pricing:', error);
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
              const { course, teacher, students, meetings, room, status, ...classInfo } = classData;
              
              // Handle class data with proper field mapping
              const processedClass = {
                ...classInfo,
                // Ensure required fields have proper values
                name: classInfo.name || 'Unnamed Class',
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

        console.log('📝 Restoring class-student relations...');
        if (backupData.data.classStudents?.length > 0) {
          try {
            for (const classStudent of backupData.data.classStudents) {
              const { class: classData, student, ...relationData } = classStudent;
              
              // Handle class-student relation data with proper field mapping
              const processedRelation = {
                ...relationData,
                // Ensure required fields have proper values
                joinedAt: relationData.joinedAt ? new Date(relationData.joinedAt) : new Date()
              };
              
              await tx.classStudent.create({
                data: processedRelation
              });
            }
            console.log(`   ✅ ${backupData.data.classStudents.length} class-student relations restored`);
          } catch (error) {
            console.error('   ❌ Error restoring class-student relations:', error);
            throw error;
          }
        }

        console.log('📝 Restoring teacher-course relations...');
        if (backupData.data.teacherCourses?.length > 0) {
          try {
            for (const teacherCourse of backupData.data.teacherCourses) {
              const { teacher, course, ...relationData } = teacherCourse;
              
              // Handle teacher-course relation data with proper field mapping
              const processedRelation = {
                ...relationData,
                // Ensure required fields have proper values
                isMain: relationData.isMain !== undefined ? relationData.isMain : false,
                createdAt: relationData.createdAt ? new Date(relationData.createdAt) : new Date()
              };
              
              await tx.teacherCourse.create({
                data: processedRelation
              });
            }
            console.log(`   ✅ ${backupData.data.teacherCourses.length} teacher-course relations restored`);
          } catch (error) {
            console.error('   ❌ Error restoring teacher-course relations:', error);
            throw error;
          }
        }

        console.log('📝 Restoring announcements...');
        if (backupData.data.announcements?.length > 0) {
          try {
            for (const announcement of backupData.data.announcements) {
              // Handle announcement data with proper field mapping
              const processedAnnouncement = {
                ...announcement,
                // Ensure required fields have proper values
                title: announcement.title || 'Untitled Announcement',
                content: announcement.content || '',
                isActive: announcement.isActive !== undefined ? announcement.isActive : true,
                priority: announcement.priority || 1,
                targetRole: announcement.targetRole || 'teacher',
                createdAt: announcement.createdAt ? new Date(announcement.createdAt) : new Date(),
                updatedAt: announcement.updatedAt ? new Date(announcement.updatedAt) : new Date()
              };
              
              await tx.announcement.create({
                data: processedAnnouncement
              });
            }
            console.log(`   ✅ ${backupData.data.announcements.length} announcements restored`);
          } catch (error) {
            console.error('   ❌ Error restoring announcements:', error);
            throw error;
          }
        }

        console.log('📝 Restoring employee attendance...');
        if (backupData.data.employeeAttendances?.length > 0) {
          try {
            for (const employeeAttendance of backupData.data.employeeAttendances) {
              // Handle employee attendance data with proper field mapping
              const processedAttendance = {
                ...employeeAttendance,
                // Ensure required fields have proper values
                employeeName: employeeAttendance.employeeName || 'Unknown Employee',
                employeeId: employeeAttendance.employeeId || 'UNKNOWN',
                type: employeeAttendance.type || 'check_in',
                status: employeeAttendance.status || 'success',
                timestamp: employeeAttendance.timestamp ? new Date(employeeAttendance.timestamp) : new Date(),
                createdAt: employeeAttendance.createdAt ? new Date(employeeAttendance.createdAt) : new Date()
              };
              
              await tx.employeeAttendance.create({
                data: processedAttendance
              });
            }
            console.log(`   ✅ ${backupData.data.employeeAttendances.length} employee attendance records restored`);
          } catch (error) {
            console.error('   ❌ Error restoring employee attendance:', error);
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

        console.log('📝 Restoring teacher attendance...');
        if (backupData.data.teacherAttendances?.length > 0) {
          try {
            for (const teacherAttendance of backupData.data.teacherAttendances) {
              const { classMeeting, teacher, ...attendanceData } = teacherAttendance;
              
              // Handle teacher attendance data with proper field mapping
              const processedAttendance = {
                ...attendanceData,
                // Ensure required fields have proper values
                status: attendanceData.status || 'HADIR',
                markedAt: attendanceData.markedAt ? new Date(attendanceData.markedAt) : new Date()
              };
              
              await tx.teacherAttendance.create({
                data: processedAttendance
              });
            }
            console.log(`   ✅ ${backupData.data.teacherAttendances.length} teacher attendance records restored`);
          } catch (error) {
            console.error('   ❌ Error restoring teacher attendance:', error);
            throw error;
          }
        }

        console.log('📝 Restoring student attendance...');
        if (backupData.data.attendances?.length > 0) {
          try {
            for (const attendance of backupData.data.attendances) {
              const { classMeeting, student, ...attendanceData } = attendance;
              
              // Handle student attendance data with proper field mapping
              const processedAttendance = {
                ...attendanceData,
                // Ensure required fields have proper values
                status: attendanceData.status || 'HADIR',
                markedAt: attendanceData.markedAt ? new Date(attendanceData.markedAt) : new Date()
              };
              
              await tx.attendance.create({
                data: processedAttendance
              });
            }
            console.log(`   ✅ ${backupData.data.attendances.length} student attendance records restored`);
          } catch (error) {
            console.error('   ❌ Error restoring student attendance:', error);
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

        console.log('📝 Restoring payment transactions...');
        if (backupData.data.paymentTransactions?.length > 0) {
          try {
            for (const transaction of backupData.data.paymentTransactions) {
              const { payment, ...transactionData } = transaction;
              
              // Handle payment transaction data with proper field mapping
              const processedTransaction = {
                ...transactionData,
                // Ensure required fields have proper values
                amount: transactionData.amount || 0,
                paymentMethod: transactionData.paymentMethod || 'cash',
                createdAt: transactionData.createdAt ? new Date(transactionData.createdAt) : new Date(),
                paymentDate: transactionData.paymentDate ? new Date(transactionData.paymentDate) : new Date()
              };
              
              await tx.paymentTransaction.create({
                data: processedTransaction
              });
            }
            console.log(`   ✅ ${backupData.data.paymentTransactions.length} payment transactions restored`);
          } catch (error) {
            console.error('   ❌ Error restoring payment transactions:', error);
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

        console.log('📝 Restoring users...');
        if (backupData.data.users?.length > 0) {
          try {
            for (const user of backupData.data.users) {
              let userData = { ...user };
              if (userData.password === '[REDACTED]') {
                // Skip users with redacted passwords or set default
                const hashedPassword = await AuthService.hashPassword('admin123');
                userData.password = hashedPassword;
              }
              
              // Check if user already exists (to avoid duplicates)
              const existingUser = await tx.user.findUnique({
                where: { email: userData.email }
              });
              
              if (!existingUser) {
                await tx.user.create({
                  data: {
                    ...userData,
                    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
                    updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date()
                  }
                });
              } else {
                console.log(`   ⚠️  User ${userData.email} already exists, skipping`);
              }
            }
            console.log(`   ✅ ${backupData.data.users.length} users processed`);
          } catch (error) {
            console.error('   ❌ Error restoring users:', error);
            throw error;
          }
        }

        // Restore web content tables
        console.log('📝 Restoring hero sections...');
        if (backupData.data.heroSections?.length > 0) {
          try {
            for (const heroSection of backupData.data.heroSections) {
              await tx.heroSection.create({
                data: {
                  ...heroSection,
                  createdAt: heroSection.createdAt ? new Date(heroSection.createdAt) : new Date(),
                  updatedAt: heroSection.updatedAt ? new Date(heroSection.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.heroSections.length} hero sections restored`);
          } catch (error) {
            console.error('   ❌ Error restoring hero sections:', error);
            // Don't throw, continue with other tables
          }
        }

        console.log('📝 Restoring facilities...');
        if (backupData.data.facilities?.length > 0) {
          try {
            for (const facility of backupData.data.facilities) {
              await tx.facility.create({
                data: {
                  ...facility,
                  createdAt: facility.createdAt ? new Date(facility.createdAt) : new Date(),
                  updatedAt: facility.updatedAt ? new Date(facility.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.facilities.length} facilities restored`);
          } catch (error) {
            console.error('   ❌ Error restoring facilities:', error);
          }
        }

        console.log('📝 Restoring testimonials...');
        if (backupData.data.testimonials?.length > 0) {
          try {
            for (const testimonial of backupData.data.testimonials) {
              await tx.testimonial.create({
                data: {
                  ...testimonial,
                  createdAt: testimonial.createdAt ? new Date(testimonial.createdAt) : new Date(),
                  updatedAt: testimonial.updatedAt ? new Date(testimonial.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.testimonials.length} testimonials restored`);
          } catch (error) {
            console.error('   ❌ Error restoring testimonials:', error);
          }
        }

        console.log('📝 Restoring gallery images...');
        if (backupData.data.galleryImages?.length > 0) {
          try {
            for (const galleryImage of backupData.data.galleryImages) {
              await tx.galleryImage.create({
                data: {
                  ...galleryImage,
                  createdAt: galleryImage.createdAt ? new Date(galleryImage.createdAt) : new Date(),
                  updatedAt: galleryImage.updatedAt ? new Date(galleryImage.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.galleryImages.length} gallery images restored`);
          } catch (error) {
            console.error('   ❌ Error restoring gallery images:', error);
          }
        }

        console.log('📝 Restoring location info...');
        if (backupData.data.locationInfo?.length > 0) {
          try {
            for (const location of backupData.data.locationInfo) {
              await tx.locationInfo.create({
                data: {
                  ...location,
                  createdAt: location.createdAt ? new Date(location.createdAt) : new Date(),
                  updatedAt: location.updatedAt ? new Date(location.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.locationInfo.length} location info restored`);
          } catch (error) {
            console.error('   ❌ Error restoring location info:', error);
          }
        }

        console.log('📝 Restoring landing courses...');
        if (backupData.data.landingCourses?.length > 0) {
          try {
            for (const landingCourse of backupData.data.landingCourses) {
              await tx.landingCourse.create({
                data: {
                  ...landingCourse,
                  createdAt: landingCourse.createdAt ? new Date(landingCourse.createdAt) : new Date(),
                  updatedAt: landingCourse.updatedAt ? new Date(landingCourse.updatedAt) : new Date()
                }
              });
            }
            console.log(`   ✅ ${backupData.data.landingCourses.length} landing courses restored`);
          } catch (error) {
            console.error('   ❌ Error restoring landing courses:', error);
          }
        }

        console.log('📝 Restoring blog posts...');
        if (backupData.data.blogPosts?.length > 0) {
          try {
            for (const blogPost of backupData.data.blogPosts) {
              await tx.blogPost.create({
                data: {
                  ...blogPost,
                  createdAt: blogPost.createdAt ? new Date(blogPost.createdAt) : new Date(),
                  updatedAt: blogPost.updatedAt ? new Date(blogPost.updatedAt) : new Date(),
                  publishedAt: blogPost.publishedAt ? new Date(blogPost.publishedAt) : null,
                  scheduledAt: blogPost.scheduledAt ? new Date(blogPost.scheduledAt) : null
                }
              });
            }
            console.log(`   ✅ ${backupData.data.blogPosts.length} blog posts restored`);
          } catch (error) {
            console.error('   ❌ Error restoring blog posts:', error);
          }
        }

        // Ensure admin user exists after restore
        console.log('🔐 Ensuring admin user exists...');
        const adminExists = await tx.user.findFirst({
          where: {
            OR: [
              { role: 'super_admin' },
              { role: 'admin' }
            ]
          }
        });

        if (!adminExists) {
          console.log('   🆘 No admin user found, creating emergency admin...');
          const hashedPassword = await AuthService.hashPassword('admin123');
          
          await tx.user.create({
            data: {
              email: 'admin@kursus.com',
              name: 'Auto-Created Admin',
              password: hashedPassword,
              role: 'super_admin',
              isActive: true
            }
          });
          console.log('   ✅ Emergency admin created');
        } else {
          console.log('   ✅ Admin user exists');
        }
      }, {
        timeout: 60000 // 60 seconds timeout for large restore operations with many tables
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
      // In serverless environment (Vercel), file system access is limited
      // We'll try to collect what we can, but gracefully handle failures
      
      // Collect certificate templates
      try {
        const templatesDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
        const templateFiles = await fs.readdir(templatesDir);
        for (const file of templateFiles) {
          if (file.endsWith('.docx')) {
            assets.certificateTemplates.push({
              name: file,
              path: path.join(templatesDir, file)
            });
          }
        }
        console.log(`📄 Found ${assets.certificateTemplates.length} certificate templates`);
      } catch (error) {
        console.warn('⚠️  Certificate templates directory not accessible (serverless limitation)');
      }

      // Collect generated certificates
      try {
        const certsDir = path.join(process.cwd(), 'public', 'certificates');
        const certFiles = await fs.readdir(certsDir);
        for (const file of certFiles) {
          if (file.endsWith('.pdf')) {
            assets.certificates.push({
              name: file,
              path: path.join(certsDir, file)
            });
          }
        }
        console.log(`📄 Found ${assets.certificates.length} generated certificates`);
      } catch (error) {
        console.warn('⚠️  Certificates directory not accessible (serverless limitation)');
      }

      // Collect Cloudinary URLs from database (this should work in serverless)
      try {
        const students = await db.student.findMany({
          select: { photo: true }
        });
        const teachers = await db.teacher.findMany({
          select: { photo: true }
        });

        students.forEach(student => {
          if (student.photo && student.photo.includes('cloudinary')) {
            assets.cloudinary_urls.push(student.photo);
          }
        });

        teachers.forEach(teacher => {
          if (teacher.photo && teacher.photo.includes('cloudinary')) {
            assets.cloudinary_urls.push(teacher.photo);
          }
        });
        
        console.log(`🌐 Found ${assets.cloudinary_urls.length} Cloudinary URLs`);
      } catch (error) {
        console.warn('⚠️  Error collecting Cloudinary URLs:', error);
      }

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
        
        // Check optional tables (including new web content and blog tables)
        const optionalTables = [
          'coursePricing', 'payments', 'paymentTransactions', 'certificates', 'certificateTemplates', 
          'meetings', 'users', 'rooms', 'classStudents', 'teacherAttendances', 'attendances', 
          'teacherCourses', 'announcements', 'employeeAttendances',
          'heroSections', 'facilities', 'testimonials', 'galleryImages', 'locationInfo', 
          'landingCourses', 'blogPosts'
        ];
        for (const table of optionalTables) {
          if (backupData.data[table] && !Array.isArray(backupData.data[table])) {
            errors.push(`Invalid ${table} data format`);
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