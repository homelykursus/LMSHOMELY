-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassMeeting" (
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
    "actualTeacherId" TEXT,
    "calculatedCommission" INTEGER,
    "commissionBreakdown" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassMeeting_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassMeeting_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClassMeeting_actualTeacherId_fkey" FOREIGN KEY ("actualTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClassMeeting" ("calculatedCommission", "classId", "commissionBreakdown", "createdAt", "date", "endTime", "id", "meetingNumber", "notes", "startTime", "status", "substituteTeacherId", "topic", "updatedAt") SELECT "calculatedCommission", "classId", "commissionBreakdown", "createdAt", "date", "endTime", "id", "meetingNumber", "notes", "startTime", "status", "substituteTeacherId", "topic", "updatedAt" FROM "ClassMeeting";
DROP TABLE "ClassMeeting";
ALTER TABLE "new_ClassMeeting" RENAME TO "ClassMeeting";
CREATE INDEX "ClassMeeting_classId_idx" ON "ClassMeeting"("classId");
CREATE INDEX "ClassMeeting_date_idx" ON "ClassMeeting"("date");
CREATE INDEX "ClassMeeting_substituteTeacherId_idx" ON "ClassMeeting"("substituteTeacherId");
CREATE INDEX "ClassMeeting_actualTeacherId_idx" ON "ClassMeeting"("actualTeacherId");
CREATE INDEX "ClassMeeting_calculatedCommission_idx" ON "ClassMeeting"("calculatedCommission");
CREATE UNIQUE INDEX "ClassMeeting_classId_meetingNumber_key" ON "ClassMeeting"("classId", "meetingNumber");
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("completedAt", "courseId", "courseType", "createdAt", "dateOfBirth", "discount", "finalPrice", "gender", "id", "lastEducation", "name", "participants", "photo", "referralSource", "status", "studentNumber", "updatedAt", "whatsapp") SELECT "completedAt", "courseId", "courseType", "createdAt", "dateOfBirth", "discount", "finalPrice", "gender", "id", "lastEducation", "name", "participants", "photo", "referralSource", "status", "studentNumber", "updatedAt", "whatsapp" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
