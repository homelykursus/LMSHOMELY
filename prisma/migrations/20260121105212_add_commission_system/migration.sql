-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoursePricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "discountRate" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoursePricing_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "photo" TEXT,
    "education" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" INTEGER,
    "address" TEXT,
    "joinDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "salary" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeacherCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeacherCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentProof" TEXT,
    "notes" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "reminderDismissedAt" DATETIME,
    "reminderDismissedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proofUrl" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "floor" TEXT,
    "building" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "roomId" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "commissionType" TEXT NOT NULL DEFAULT 'BY_CLASS',
    "commissionAmount" INTEGER NOT NULL,
    "schedule" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "totalMeetings" INTEGER NOT NULL DEFAULT 0,
    "completedMeetings" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Class_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassStudent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassMeeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "meetingNumber" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "topic" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "substituteTeacherId" TEXT,
    "calculatedCommission" INTEGER,
    "commissionBreakdown" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassMeeting_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassMeeting_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classMeetingId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "markedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_classMeetingId_fkey" FOREIGN KEY ("classMeetingId") REFERENCES "ClassMeeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classMeetingId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "markedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherAttendance_classMeetingId_fkey" FOREIGN KEY ("classMeetingId") REFERENCES "ClassMeeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Teacher_status_idx" ON "Teacher"("status");

-- CreateIndex
CREATE INDEX "Teacher_education_idx" ON "Teacher"("education");

-- CreateIndex
CREATE INDEX "TeacherCourse_teacherId_idx" ON "TeacherCourse"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherCourse_courseId_idx" ON "TeacherCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherCourse_teacherId_courseId_key" ON "TeacherCourse"("teacherId", "courseId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentId_idx" ON "PaymentTransaction"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentDate_idx" ON "PaymentTransaction"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE INDEX "Room_isActive_idx" ON "Room"("isActive");

-- CreateIndex
CREATE INDEX "Room_name_idx" ON "Room"("name");

-- CreateIndex
CREATE INDEX "Class_isActive_idx" ON "Class"("isActive");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "Class_courseId_idx" ON "Class"("courseId");

-- CreateIndex
CREATE INDEX "Class_roomId_idx" ON "Class"("roomId");

-- CreateIndex
CREATE INDEX "Class_commissionType_idx" ON "Class"("commissionType");

-- CreateIndex
CREATE INDEX "ClassStudent_classId_idx" ON "ClassStudent"("classId");

-- CreateIndex
CREATE INDEX "ClassStudent_studentId_idx" ON "ClassStudent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassStudent_classId_studentId_key" ON "ClassStudent"("classId", "studentId");

-- CreateIndex
CREATE INDEX "ClassMeeting_classId_idx" ON "ClassMeeting"("classId");

-- CreateIndex
CREATE INDEX "ClassMeeting_date_idx" ON "ClassMeeting"("date");

-- CreateIndex
CREATE INDEX "ClassMeeting_substituteTeacherId_idx" ON "ClassMeeting"("substituteTeacherId");

-- CreateIndex
CREATE INDEX "ClassMeeting_calculatedCommission_idx" ON "ClassMeeting"("calculatedCommission");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMeeting_classId_meetingNumber_key" ON "ClassMeeting"("classId", "meetingNumber");

-- CreateIndex
CREATE INDEX "Attendance_classMeetingId_idx" ON "Attendance"("classMeetingId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");

-- CreateIndex
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_classMeetingId_studentId_key" ON "Attendance"("classMeetingId", "studentId");

-- CreateIndex
CREATE INDEX "TeacherAttendance_classMeetingId_idx" ON "TeacherAttendance"("classMeetingId");

-- CreateIndex
CREATE INDEX "TeacherAttendance_teacherId_idx" ON "TeacherAttendance"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherAttendance_status_idx" ON "TeacherAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendance_classMeetingId_teacherId_key" ON "TeacherAttendance"("classMeetingId", "teacherId");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_employeeId_idx" ON "EmployeeAttendance"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_type_idx" ON "EmployeeAttendance"("type");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_status_idx" ON "EmployeeAttendance"("status");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_timestamp_idx" ON "EmployeeAttendance"("timestamp");
