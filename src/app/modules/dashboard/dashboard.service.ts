import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const getUsageStatistics = async (userId: string) => {
  const activeSubscription = await prisma.userSubscription.findFirst({
    where: { userId, isActive: true, isDeleted: false },
    include: { package: true },
  });

  if (!activeSubscription)
    throw new ApiError(httpStatus.FORBIDDEN, "No active subscription");

  const pkg = activeSubscription.package;

  const [totalFiles, totalFolders, storageAgg, filesByType, recentActivity] =
    await Promise.all([
      prisma.file.count({ where: { userId, isDeleted: false } }),
      prisma.folder.count({ where: { userId, isDeleted: false } }),
      prisma.file.aggregate({
        where: { userId, isDeleted: false },
        _sum: { size: true },
      }),
      prisma.file.groupBy({
        by: ["type"],
        where: { userId, isDeleted: false },
        _count: { type: true },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { file: { select: { name: true, type: true } } },
      }),
    ]);

  const usedBytes = storageAgg._sum.size || 0;
  const usedMB = usedBytes / (1024 * 1024);
  const storageLimitMB = pkg.storageQuotaMB;
  const storageUsedPercent =
    storageLimitMB > 0 ? Math.min((usedMB / storageLimitMB) * 100, 100) : 0;

  return {
    subscription: {
      packageName: pkg.name,
      isActive: activeSubscription.isActive,
    },
    files: {
      total: totalFiles,
      limit: pkg.fileLimit,
      remaining: pkg.fileLimit - totalFiles,
      byType: filesByType.map((f: any) => ({
        type: f.type,
        count: f._count.type,
      })),
    },
    folders: {
      total: totalFolders,
      limit: pkg.maxFolders,
      remaining: pkg.maxFolders - totalFolders,
    },
    storage: {
      usedBytes,
      usedMB: Number(usedMB.toFixed(2)),
      limitMB: storageLimitMB,
      usedPercent: Number(storageUsedPercent.toFixed(1)),
    },
    recentActivity,
  };
};

export const DashboardService = { getUsageStatistics };
