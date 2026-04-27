import { prisma } from "../../shared/prisma";

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

  // Return zero-state instead of throwing — client handles no-subscription UI
  if (!activeSubscription) {
    return {
      subscription: { packageName: null, isActive: false },
      files: { total: 0, limit: 0, remaining: 0, byType: [] },
      folders: { total: 0, limit: 0, remaining: 0 },
      storage: { usedBytes: 0, usedMB: 0, limitMB: 0, usedPercent: 0 },
      recentActivity: [],
    };
  }

  const packageData = activeSubscription.package;

  const totalFiles = await prisma.file.count({
    where: { userId, isDeleted: false },
  });

  const totalFolders = await prisma.folder.count({
    where: { userId, isDeleted: false },
  });

  const storageAgg = await prisma.file.aggregate({
    where: { userId, isDeleted: false },
    _sum: { size: true },
  });

  const usedBytes = Number(storageAgg._sum.size ?? 0);
  const usedMB = Number((usedBytes / (1024 * 1024)).toFixed(2));
  const storageLimitMB = packageData.maxFileSizeMB * packageData.fileLimit;
  const usedPercent =
    storageLimitMB > 0
      ? Number(((usedMB / storageLimitMB) * 100).toFixed(1))
      : 0;

  // Files by type breakdown
  const filesByType = await prisma.file.groupBy({
    by: ["type"],
    where: { userId, isDeleted: false },
    _count: { type: true },
  });

  // Recent activity (last 10 actions)
  const recentActivity = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      action: true,
      createdAt: true,
      file: {
        select: { name: true, type: true, thumbnailUrl: true },
      },
    },
  });

  return {
    subscription: {
      packageName: packageData.name,
      isActive: activeSubscription.isActive,
    },
    files: {
      total: totalFiles,
      limit: packageData.fileLimit,
      remaining: packageData.fileLimit - totalFiles,
      byType: filesByType.map((f) => ({ type: f.type, count: f._count.type })),
    },
    folders: {
      total: totalFolders,
      limit: packageData.maxFolders,
      remaining: packageData.maxFolders - totalFolders,
    },
    storage: {
      usedBytes,
      usedMB,
      limitMB: storageLimitMB,
      usedPercent,
    },
    recentActivity,
  };
};

export const DashboardService = {
  getUsageStatistics,
};
