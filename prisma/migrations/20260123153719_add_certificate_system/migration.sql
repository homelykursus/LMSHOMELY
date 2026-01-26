-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'course_completion',
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "placeholders" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certificateNumber" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "teacherName" TEXT,
    "courseDuration" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedBy" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CertificateTemplate_isActive_idx" ON "CertificateTemplate"("isActive");

-- CreateIndex
CREATE INDEX "CertificateTemplate_category_idx" ON "CertificateTemplate"("category");

-- CreateIndex
CREATE INDEX "CertificateTemplate_createdBy_idx" ON "CertificateTemplate"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Certificate_templateId_idx" ON "Certificate"("templateId");

-- CreateIndex
CREATE INDEX "Certificate_studentId_idx" ON "Certificate"("studentId");

-- CreateIndex
CREATE INDEX "Certificate_teacherId_idx" ON "Certificate"("teacherId");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- CreateIndex
CREATE INDEX "Certificate_generatedAt_idx" ON "Certificate"("generatedAt");

-- CreateIndex
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");
