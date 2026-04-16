-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('UPLOAD', 'DELETE', 'RESTORE', 'PERMANENT_DELETE', 'RENAME', 'MOVE', 'SHARE', 'DOWNLOAD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileType" ADD VALUE 'DOCUMENT';
ALTER TYPE "FileType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiTags" TEXT[],
ADD COLUMN     "cloudinaryId" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionPackages" ADD COLUMN     "storageQuotaMB" INTEGER NOT NULL DEFAULT 1000;

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT,
    "action" "ActivityAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLinks" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLogs_userId_idx" ON "ActivityLogs"("userId");

-- CreateIndex
CREATE INDEX "ActivityLogs_fileId_idx" ON "ActivityLogs"("fileId");

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLinks_token_key" ON "ShareLinks"("token");

-- CreateIndex
CREATE INDEX "ShareLinks_token_idx" ON "ShareLinks"("token");

-- CreateIndex
CREATE INDEX "ShareLinks_fileId_idx" ON "ShareLinks"("fileId");

-- CreateIndex
CREATE INDEX "Files_name_idx" ON "Files"("name");

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLinks" ADD CONSTRAINT "ShareLinks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
