/*
  Warnings:

  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'PDF');

-- DropTable
DROP TABLE "Template";

-- CreateTable
CREATE TABLE "Files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,
    "path" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "depthLevel" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPackages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxFolders" INTEGER NOT NULL,
    "maxLevels" INTEGER NOT NULL,
    "allowedFileType" "FileType"[],
    "maxFileSizeMB" INTEGER NOT NULL,
    "fileLimit" INTEGER NOT NULL,
    "filesPerFolder" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPackages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Files_userId_idx" ON "Files"("userId");

-- CreateIndex
CREATE INDEX "Files_folderId_idx" ON "Files"("folderId");

-- CreateIndex
CREATE INDEX "Folders_userId_idx" ON "Folders"("userId");

-- CreateIndex
CREATE INDEX "Folders_parentId_idx" ON "Folders"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPackages_name_key" ON "SubscriptionPackages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "UserSubscriptions_userId_idx" ON "UserSubscriptions"("userId");

-- CreateIndex
CREATE INDEX "UserSubscriptions_packageId_idx" ON "UserSubscriptions"("packageId");

-- CreateIndex
CREATE INDEX "UserSubscriptions_isActive_idx" ON "UserSubscriptions"("isActive");

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "UserSubscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscriptions" ADD CONSTRAINT "UserSubscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "SubscriptionPackages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
