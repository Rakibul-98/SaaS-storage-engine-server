import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import { resolveFileType } from "../../utils/file.utils";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import crypto from "crypto";

const uploadFile = async (
  userId: string,
  file: Express.Multer.File,
  folderId: string,
) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  if (!folderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "folderId is required");
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
  });

  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

  const activeSubscription = await prisma.userSubscription.findFirst({
    where: { userId, isActive: true, isDeleted: false },
    include: { package: true },
  });

  if (!activeSubscription) {
    throw new ApiError(httpStatus.FORBIDDEN, "No active subscription");
  }

  const packageData = activeSubscription.package;

  const totalFiles = await prisma.file.count({
    where: { userId, isDeleted: false },
  });

  if (totalFiles >= packageData.fileLimit) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `File limit exceeded. Max allowed: ${packageData.fileLimit}`,
    );
  }

  const folderFiles = await prisma.file.count({
    where: { folderId, isDeleted: false },
  });

  if (folderFiles >= packageData.filesPerFolder) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Files per folder limit exceeded (${packageData.filesPerFolder})`,
    );
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > packageData.maxFileSizeMB) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Max file size is ${packageData.maxFileSizeMB}MB`,
    );
  }

  const fileType = resolveFileType(file.mimetype);

  if (!fileType) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unsupported file type");
  }

  if (!packageData.allowedFileType.includes(fileType)) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "File type not allowed by your subscription",
    );
  }

  const savedFile = await prisma.file.create({
    data: {
      name: file.originalname,
      userId,
      folderId,
      size: file.size,
      type: fileType,
      mimeType: file.mimetype,
      path: file.path,
    },
  });

  // Log activity
  await prisma.activityLog
    .create({
      data: { userId, fileId: savedFile.id, action: "UPLOAD" },
    })
    .catch(() => {
      /* non-fatal */
    });

  return savedFile;
};

const getFilesByFolder = async (
  userId: string,
  folderId: string,
  options: IOptions,
) => {
  if (!folderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "folderId is required");
  }

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
  });

  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const whereConditions = { folderId, userId, isDeleted: false };

  const [data, total] = await Promise.all([
    prisma.file.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { shareLinks: { where: { isActive: true } } },
    }),
    prisma.file.count({ where: whereConditions }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getSingleFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
    include: { shareLinks: { where: { isActive: true } } },
  });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  return file;
};

const downloadFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  // Log download activity
  await prisma.activityLog
    .create({
      data: { userId, fileId: file.id, action: "DOWNLOAD" },
    })
    .catch(() => {
      /* non-fatal */
    });

  // Return cloudinary URL if available, otherwise file path
  return file;
};

const updateFile = async (
  userId: string,
  id: string,
  payload: { name?: string; folderId?: string },
) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  if (payload.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: payload.folderId, userId, isDeleted: false },
    });
    if (!folder) {
      throw new ApiError(httpStatus.NOT_FOUND, "Target folder not found");
    }
  }

  const action = payload.folderId ? "MOVE" : "RENAME";
  await prisma.activityLog
    .create({
      data: { userId, fileId: id, action },
    })
    .catch(() => {
      /* non-fatal */
    });

  return prisma.file.update({ where: { id }, data: payload });
};

const deleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  await prisma.activityLog
    .create({
      data: { userId, fileId: id, action: "DELETE" },
    })
    .catch(() => {
      /* non-fatal */
    });

  return prisma.file.update({ where: { id }, data: { isDeleted: true } });
};

const getTrashFiles = async (userId: string) => {
  return prisma.file.findMany({
    where: { isDeleted: true, userId },
    include: {
      folder: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
};

const restoreFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  if (!file.isDeleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is not deleted");
  }

  await prisma.activityLog
    .create({
      data: { userId, fileId: id, action: "RESTORE" },
    })
    .catch(() => {
      /* non-fatal */
    });

  return prisma.file.update({ where: { id }, data: { isDeleted: false } });
};

const permanentDeleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  await prisma.activityLog
    .create({
      data: { userId, fileId: id, action: "PERMANENT_DELETE" },
    })
    .catch(() => {
      /* non-fatal */
    });

  await prisma.file.delete({ where: { id } });

  return { message: "File permanently deleted" };
};

const searchFiles = async (userId: string, q: string, options: IOptions) => {
  if (!q || !q.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Search query is required");
  }

  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const whereConditions = {
    userId,
    isDeleted: false,
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { aiTags: { has: q } },
      { aiSummary: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.file.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.file.count({ where: whereConditions }),
  ]);

  return { meta: { page, limit, total }, data };
};

const createShareLink = async (
  userId: string,
  fileId: string,
  payload: { expiresInHours?: number; maxViews?: number },
) => {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
  });

  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = payload.expiresInHours
    ? new Date(Date.now() + payload.expiresInHours * 60 * 60 * 1000)
    : null;

  const shareLink = await prisma.shareLink.create({
    data: {
      token,
      fileId,
      expiresAt,
      maxViews: payload.maxViews ?? null,
      isActive: true,
    },
  });

  await prisma.activityLog
    .create({
      data: { userId, fileId, action: "SHARE" },
    })
    .catch(() => {
      /* non-fatal */
    });

  return shareLink;
};

const revokeShareLink = async (userId: string, token: string) => {
  const shareLink = await prisma.shareLink.findFirst({
    where: { token },
    include: { file: true },
  });

  if (!shareLink) {
    throw new ApiError(httpStatus.NOT_FOUND, "Share link not found");
  }

  if (shareLink.file.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  return prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { isActive: false },
  });
};

const getSharedFile = async (token: string) => {
  const shareLink = await prisma.shareLink.findFirst({
    where: { token, isActive: true },
    include: {
      file: true,
    },
  });

  if (!shareLink) {
    throw new ApiError(httpStatus.NOT_FOUND, "Share link not found or expired");
  }

  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { isActive: false },
    });
    throw new ApiError(httpStatus.GONE, "Share link has expired");
  }

  if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: { isActive: false },
    });
    throw new ApiError(httpStatus.GONE, "Share link view limit reached");
  }

  // Increment view count
  await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: { viewCount: { increment: 1 } },
  });

  return { file: shareLink.file, viewCount: shareLink.viewCount + 1 };
};

const getActivityLog = async (userId: string, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        action: true,
        createdAt: true,
        file: {
          select: { name: true, type: true, thumbnailUrl: true },
        },
      },
    }),
    prisma.activityLog.count({ where: { userId } }),
  ]);

  return { meta: { page, limit, total }, data };
};

export const FileService = {
  uploadFile,
  getFilesByFolder,
  getSingleFile,
  downloadFile,
  updateFile,
  deleteFile,
  getTrashFiles,
  restoreFile,
  permanentDeleteFile,
  searchFiles,
  createShareLink,
  revokeShareLink,
  getSharedFile,
  getActivityLog,
};
