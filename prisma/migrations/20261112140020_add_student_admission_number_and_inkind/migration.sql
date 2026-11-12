-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'IN_KIND';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "admissionNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_admissionNumber_key" ON "students"("admissionNumber");

