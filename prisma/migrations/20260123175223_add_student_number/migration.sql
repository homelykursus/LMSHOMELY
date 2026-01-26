/*
  Warnings:

  - Added the required column `studentNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- First, add the column with a temporary default
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentNumber" TEXT NOT NULL DEFAULT 'TEMP000',
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

-- Copy existing data
INSERT INTO "new_Student" ("completedAt", "courseId", "courseType", "createdAt", "dateOfBirth", "discount", "finalPrice", "gender", "id", "lastEducation", "name", "participants", "photo", "referralSource", "status", "updatedAt", "whatsapp") 
SELECT "completedAt", "courseId", "courseType", "createdAt", "dateOfBirth", "discount", "finalPrice", "gender", "id", "lastEducation", "name", "participants", "photo", "referralSource", "status", "updatedAt", "whatsapp" FROM "Student";

-- Drop old table and rename new one
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";

-- Create unique index (will be updated by script after migration)
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
