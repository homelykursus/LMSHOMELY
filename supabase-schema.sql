-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Course table
CREATE TABLE "Course" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- Create CoursePricing table
CREATE TABLE "CoursePricing" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "courseId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "discountRate" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoursePricing_pkey" PRIMARY KEY ("id")
);

-- Create Student table
CREATE TABLE "Student" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "studentNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT,
    "whatsapp" TEXT NOT NULL,
    "photo" TEXT,
    "courseId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "lastEducation" TEXT,
    "referralSource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Student_studentNumber_key" UNIQUE ("studentNumber")
);

-- Create Teacher table
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "password" TEXT,
    "photo" TEXT,
    "education" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" INTEGER,
    "address" TEXT,
    "joinDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "salary" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Teacher_whatsapp_key" UNIQUE ("whatsapp")
);

-- Create TeacherCourse table
CREATE TABLE "TeacherCourse" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherCourse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TeacherCourse_teacherId_courseId_key" UNIQUE ("teacherId", "courseId")
);

-- Create Payment table
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "studentId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentProof" TEXT,
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reminderDismissedAt" TIMESTAMP(3),
    "reminderDismissedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Create PaymentTransaction table
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proofUrl" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key" UNIQUE ("email")
);

-- Create Room table
CREATE TABLE "Room" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "floor" TEXT,
    "building" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Room_name_key" UNIQUE ("name")
);

-- Create Class table
CREATE TABLE "Class" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "roomId" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "commissionType" TEXT NOT NULL DEFAULT 'BY_CLASS',
    "commissionAmount" INTEGER NOT NULL,
    "schedule" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalMeetings" INTEGER NOT NULL DEFAULT 0,
    "completedMeetings" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- Create ClassStudent table
CREATE TABLE "ClassStudent" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassStudent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ClassStudent_classId_studentId_key" UNIQUE ("classId", "studentId")
);

-- Create ClassMeeting table
CREATE TABLE "ClassMeeting" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "classId" TEXT NOT NULL,
    "meetingNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "topic" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "substituteTeacherId" TEXT,
    "actualTeacherId" TEXT,
    "calculatedCommission" INTEGER,
    "commissionBreakdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassMeeting_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ClassMeeting_classId_meetingNumber_key" UNIQUE ("classId", "meetingNumber")
);

-- Create Attendance table
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "classMeetingId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Attendance_classMeetingId_studentId_key" UNIQUE ("classMeetingId", "studentId")
);

-- Create TeacherAttendance table
CREATE TABLE "TeacherAttendance" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "classMeetingId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TeacherAttendance_classMeetingId_teacherId_key" UNIQUE ("classMeetingId", "teacherId")
);

-- Create EmployeeAttendance table
CREATE TABLE "EmployeeAttendance" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("id")
);

-- Create CertificateTemplate table
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'course_completion',
    "courseId" TEXT,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "placeholders" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

-- Create Certificate table
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "certificateNumber" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "teacherName" TEXT,
    "courseDuration" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedBy" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Certificate_certificateNumber_key" UNIQUE ("certificateNumber")
);

-- Add Foreign Key Constraints
ALTER TABLE "CoursePricing" ADD CONSTRAINT "CoursePricing_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeacherCourse" ADD CONSTRAINT "TeacherCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherCourse" ADD CONSTRAINT "TeacherCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClassMeeting" ADD CONSTRAINT "ClassMeeting_actualTeacherId_fkey" FOREIGN KEY ("actualTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classMeetingId_fkey" FOREIGN KEY ("classMeetingId") REFERENCES "ClassMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_classMeetingId_fkey" FOREIGN KEY ("classMeetingId") REFERENCES "ClassMeeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Indexes
CREATE INDEX "CoursePricing_courseId_idx" ON "CoursePricing"("courseId");
CREATE INDEX "Student_courseId_idx" ON "Student"("courseId");
CREATE INDEX "TeacherCourse_teacherId_idx" ON "TeacherCourse"("teacherId");
CREATE INDEX "TeacherCourse_courseId_idx" ON "TeacherCourse"("courseId");
CREATE INDEX "Teacher_status_idx" ON "Teacher"("status");
CREATE INDEX "Teacher_education_idx" ON "Teacher"("education");
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "PaymentTransaction_paymentId_idx" ON "PaymentTransaction"("paymentId");
CREATE INDEX "PaymentTransaction_paymentDate_idx" ON "PaymentTransaction"("paymentDate");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "Room_isActive_idx" ON "Room"("isActive");
CREATE INDEX "Room_name_idx" ON "Room"("name");
CREATE INDEX "Class_isActive_idx" ON "Class"("isActive");
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");
CREATE INDEX "Class_courseId_idx" ON "Class"("courseId");
CREATE INDEX "Class_roomId_idx" ON "Class"("roomId");
CREATE INDEX "Class_commissionType_idx" ON "Class"("commissionType");
CREATE INDEX "ClassStudent_classId_idx" ON "ClassStudent"("classId");
CREATE INDEX "ClassStudent_studentId_idx" ON "ClassStudent"("studentId");
CREATE INDEX "ClassMeeting_classId_idx" ON "ClassMeeting"("classId");
CREATE INDEX "ClassMeeting_date_idx" ON "ClassMeeting"("date");
CREATE INDEX "ClassMeeting_substituteTeacherId_idx" ON "ClassMeeting"("substituteTeacherId");
CREATE INDEX "ClassMeeting_actualTeacherId_idx" ON "ClassMeeting"("actualTeacherId");
CREATE INDEX "ClassMeeting_calculatedCommission_idx" ON "ClassMeeting"("calculatedCommission");
CREATE INDEX "Attendance_classMeetingId_idx" ON "Attendance"("classMeetingId");
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");
CREATE INDEX "TeacherAttendance_classMeetingId_idx" ON "TeacherAttendance"("classMeetingId");
CREATE INDEX "TeacherAttendance_teacherId_idx" ON "TeacherAttendance"("teacherId");
CREATE INDEX "TeacherAttendance_status_idx" ON "TeacherAttendance"("status");
CREATE INDEX "EmployeeAttendance_employeeId_idx" ON "EmployeeAttendance"("employeeId");
CREATE INDEX "EmployeeAttendance_type_idx" ON "EmployeeAttendance"("type");
CREATE INDEX "EmployeeAttendance_status_idx" ON "EmployeeAttendance"("status");
CREATE INDEX "EmployeeAttendance_timestamp_idx" ON "EmployeeAttendance"("timestamp");
CREATE INDEX "CertificateTemplate_isActive_idx" ON "CertificateTemplate"("isActive");
CREATE INDEX "CertificateTemplate_category_idx" ON "CertificateTemplate"("category");
CREATE INDEX "CertificateTemplate_courseId_idx" ON "CertificateTemplate"("courseId");
CREATE INDEX "CertificateTemplate_createdBy_idx" ON "CertificateTemplate"("createdBy");
CREATE INDEX "Certificate_templateId_idx" ON "Certificate"("templateId");
CREATE INDEX "Certificate_studentId_idx" ON "Certificate"("studentId");
CREATE INDEX "Certificate_teacherId_idx" ON "Certificate"("teacherId");
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");
CREATE INDEX "Certificate_generatedAt_idx" ON "Certificate"("generatedAt");
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");

-- Insert default admin user
INSERT INTO "User" ("id", "email", "name", "password", "role", "isActive") 
VALUES (
    'admin-production-001',
    'admin@kursus.com',
    'Super Admin',
    '$2b$12$LQv3c1yqBwEHFl5ghHHyV.gHxhxjHmuffFk4Y7OGtBdleadams9S2',
    'super_admin',
    true
);

-- Success message
SELECT 'Database schema created successfully! Admin user: admin@kursus.com / admin123' as message;