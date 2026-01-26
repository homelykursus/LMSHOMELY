/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Teacher_whatsapp_key" ON "Teacher"("whatsapp");
