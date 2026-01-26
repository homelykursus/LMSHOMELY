-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CertificateTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "CertificateTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CertificateTemplate" ("category", "createdAt", "createdBy", "description", "filePath", "fileSize", "fileType", "id", "isActive", "name", "originalFileName", "placeholders", "updatedAt") SELECT "category", "createdAt", "createdBy", "description", "filePath", "fileSize", "fileType", "id", "isActive", "name", "originalFileName", "placeholders", "updatedAt" FROM "CertificateTemplate";
DROP TABLE "CertificateTemplate";
ALTER TABLE "new_CertificateTemplate" RENAME TO "CertificateTemplate";
CREATE INDEX "CertificateTemplate_isActive_idx" ON "CertificateTemplate"("isActive");
CREATE INDEX "CertificateTemplate_category_idx" ON "CertificateTemplate"("category");
CREATE INDEX "CertificateTemplate_courseId_idx" ON "CertificateTemplate"("courseId");
CREATE INDEX "CertificateTemplate_createdBy_idx" ON "CertificateTemplate"("createdBy");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
