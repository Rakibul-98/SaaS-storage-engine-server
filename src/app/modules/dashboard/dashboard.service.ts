import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getUsageStatistics = async (userId: string) => {
  const activeSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      isActive: true,
      isDeleted: false,
    },
    include: {
      package: true,
    },
  });

  if (!activeSubscription) {
    throw new ApiError(httpStatus.FORBIDDEN, "No active subscription");
  }

  const packageData = activeSubscription.package;

  const totalFiles = await prisma.file.count({
    where: {
      userId,
      isDeleted: false,
    },
  });

  const totalFolders = await prisma.folder.count({
    where: {
      userId,
      isDeleted: false,
    },
  });

  const totalStorageUsedBytes = await prisma.file.aggregate({
    where: {
      userId,
      isDeleted: false,
    },
    _sum: {
      size: true,
    },
  });

  const usedMB = (totalStorageUsedBytes._sum.size || 0) / (1024 * 1024);

  return {
    totalFiles,
    totalFolders,
    totalStorageUsedMB: Number(usedMB.toFixed(2)),

    fileLimit: packageData.fileLimit,
    folderLimit: packageData.maxFolders,
    storageLimitMB: packageData.maxFileSizeMB * packageData.fileLimit,

    filesRemaining: packageData.fileLimit - totalFiles,
    foldersRemaining: packageData.maxFolders - totalFolders,
  };
};

export const DashboardService = {
  getUsageStatistics,
};
