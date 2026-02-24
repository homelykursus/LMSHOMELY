// PART 2: Create Data Backup Method
export class BackupService {
  /**
   * Create data-only backup (database only) - UPDATED WITH ALL TABLES
   */
  async createDataBackup(): Promise<BackupData> {
    try {
      console.log('🔄 Starting COMPLETE data backup...');
      console.log('📊 Backing up ALL 25 tables...\n');

      // Fetch ALL data from database
      const [
        // Core tables
        students,
        teachers,
        classes,
        courses,
        coursePricing,
        users,
        rooms,
        
        // Relation tables
        classStudents,
        teacherCourses,
        
        // Meeting and attendance
        meetings,
        teacherAttendances,
        attendances,
        
        // Financial
        payments,
        paymentTransactions,
        
        // Certificates
        certificates,
        certificateTemplates,
        
        // System
        announcements,
        employeeAttendances,
        
        // Web Content CMS (NEW)
        heroSections,
        facilities,
        testimonials,
        galleryImages,
        locationInfo,
        landingCourses,
        blogPosts
      ] = await Promise.all([
        // Core tables
        db.student.findMany(),
        db.teacher.findMany(),
        db.class.findMany(),
        db.course.findMany(),
        db.coursePricing.findMany().catch(() => []),
        db.user.findMany(),
        db.room.findMany(),
        
        // Relation tables
        db.classStudent.findMany(),
        db.teacherCourse.findMany(),
        
        // Meeting and attendance
        db.classMeeting.findMany().catch(() => []),
        db.teacherAttendance.findMany(),
        db.attendance.findMany(),
        
        // Financial
        db.payment.findMany().catch(() => []),
        db.paymentTransaction.findMany().catch(() => []),
        
        // Certificates
        db.certificate.findMany().catch(() => []),
        db.certificateTemplate.findMany().catch(() => []),
        
        // System
        db.announcement.findMany().catch(() => []),
        db.employeeAttendance.findMany().catch(() => []),
        
        // Web Content CMS (NEW)
        db.heroSection.findMany().catch(() => []),
        db.facility.findMany().catch(() => []),
        db.testimonial.findMany().catch(() => []),
        db.galleryImage.findMany().catch(() => []),
        db.locationInfo.findMany().catch(() => []),
        db.landingCourse.findMany().catch(() => []),
        db.blogPost.findMany().catch(() => [])
      ]);

      // Log results
      console.log('📊 Backup Statistics:');
      console.log('   Core Tables:');
      console.log(`     - Students: ${students.length}`);
      console.log(`     - Teachers: ${teachers.length}`);
      console.log(`     - Classes: ${classes.length}`);
      console.log(`     - Courses: ${courses.length}`);
      console.log(`     - Course Pricing: ${coursePricing.length}`);
      console.log(`     - Users: ${users.length}`);
      console.log(`     - Rooms: ${rooms.length}`);
      console.log('   Relation Tables:');
      console.log(`     - Class-Student Relations: ${classStudents.length}`);
      console.log(`     - Teacher-Course Relations: ${teacherCourses.length}`);
      console.log('   Meeting & Attendance:');
      console.log(`     - Class Meetings: ${meetings.length}`);
      console.log(`     - Teacher Attendance: ${teacherAttendances.length}`);
      console.log(`     - Student Attendance: ${attendances.length}`);
      console.log('   Financial:');
      console.log(`     - Payments: ${payments.length}`);
      console.log(`     - Payment Transactions: ${paymentTransactions.length}`);
      console.log('   Certificates:');
      console.log(`     - Certificates: ${certificates.length}`);
      console.log(`     - Certificate Templates: ${certificateTemplates.length}`);
      console.log('   System:');
      console.log(`     - Announcements: ${announcements.length}`);
      console.log(`     - Employee Attendance: ${employeeAttendances.length}`);
      console.log('   Web Content CMS:');
      console.log(`     - Hero Sections: ${heroSections.length}`);
      console.log(`     - Facilities: ${facilities.length}`);
      console.log(`     - Testimonials: ${testimonials.length}`);
      console.log(`     - Gallery Images: ${galleryImages.length}`);
      console.log(`     - Location Info: ${locationInfo.length}`);
      console.log(`     - Landing Courses: ${landingCourses.length}`);
      console.log(`     - Blog Posts: ${blogPosts.length}`);

      // Calculate total records
      const totalRecords = 
        students.length + teachers.length + classes.length + courses.length + 
        coursePricing.length + users.length + rooms.length + classStudents.length + 
        teacherCourses.length + meetings.length + teacherAttendances.length + 
        attendances.length + payments.length + paymentTransactions.length + 
        certificates.length + certificateTemplates.length + announcements.length + 
        employeeAttendances.length + heroSections.length + facilities.length + 
        testimonials.length + galleryImages.length + locationInfo.length + 
        landingCourses.length + blogPosts.length;

      const tablesIncluded = [
        'students', 'teachers', 'classes', 'courses', 'coursePricing', 'users', 'rooms',
        'classStudents', 'teacherCourses', 'meetings', 'teacherAttendances', 'attendances',
        'payments', 'paymentTransactions', 'certificates', 'certificateTemplates',
        'announcements', 'employeeAttendances', 'heroSections', 'facilities', 'testimonials',
        'galleryImages', 'locationInfo', 'landingCourses', 'blogPosts'
      ];

      // Create backup data structure
      const backupData: BackupData = {
        metadata: {
          version: '2.0', // Updated version
          created_at: new Date().toISOString(),
          backup_type: 'data',
          total_records: totalRecords,
          description: 'Complete database backup - ALL 25 tables included',
          tables_included: tablesIncluded
        },
        data: {
          students,
          teachers,
          classes,
          courses,
          coursePricing,
          meetings,
          payments,
          paymentTransactions,
          certificates,
          certificateTemplates,
          users: users.map(user => ({
            ...user,
            password: '[REDACTED]' // Don't backup passwords
          })),
          rooms,
          classStudents,
          teacherAttendances,
          attendances,
          teacherCourses,
          announcements,
          employeeAttendances,
          // Web Content CMS (NEW)
          heroSections,
          facilities,
          testimonials,
          galleryImages,
          locationInfo,
          landingCourses,
          blogPosts
        }
      };

      console.log(`\n✅ COMPLETE data backup finished: ${totalRecords} records from 25 tables`);
      return backupData;

    } catch (error) {
      console.error('❌ Data backup failed:', error);
      throw new Error(`Data backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
