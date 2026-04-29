/*
  Warnings:

  - Added the required column `storageQuotaMB` to the `SubscriptionPackages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShareLinks" DROP CONSTRAINT "ShareLinks_fileId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionPackages" ADD COLUMN     "storageQuotaMB" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- CreateIndex
CREATE INDEX "Files_name_idx" ON "Files"("name");

-- AddForeignKey
ALTER TABLE "ShareLinks" ADD CONSTRAINT "ShareLinks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
