import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import {
  resolveFileType,
  getCloudinaryResourceType,
} from "../../utils/file.utils";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinary.utils";
import {
  generateFileTags,
  generateDocumentSummary,
  generateImageDescription,
} from "../../utils/gemini.utils";
import { ActivityAction } from "@prisma/client";

const pdfParse = require("pdf-parse");

const logActivity = async (
  userId: string,
  action: ActivityAction,
  fileId?: string,
  metadata?: object,
) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, fileId, metadata },
    });
  } catch {}
};

const uploadFile = async (
  userId: string,
  file: Express.Multer.File,
  folderId: string,
) => {
  if (!file) throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  if (!folderId)
    throw new ApiError(httpStatus.BAD_REQUEST, "folderId is required");

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
  });
  if (!folder) throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");

  const activeSubscription = await prisma.userSubscription.findFirst({
    where: { userId, isActive: true, isDeleted: false },
    include: { package: true },
  });
  if (!activeSubscription)
    throw new ApiError(httpStatus.FORBIDDEN, "No active subscription");

  const pkg = activeSubscription.package;

  const totalFiles = await prisma.file.count({
    where: { userId, isDeleted: false },
  });
  if (totalFiles >= pkg.fileLimit)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `File limit reached (${pkg.fileLimit})`,
    );

  const folderFiles = await prisma.file.count({
    where: { folderId, isDeleted: false },
  });
  if (folderFiles >= pkg.filesPerFolder)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Files per folder limit reached (${pkg.filesPerFolder})`,
    );

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > pkg.maxFileSizeMB)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `File too large. Max: ${pkg.maxFileSizeMB}MB`,
    );

  const storageAgg = await prisma.file.aggregate({
    where: { userId, isDeleted: false },
    _sum: { size: true },
  });
  const usedMB = (storageAgg._sum.size || 0) / (1024 * 1024);
  if (usedMB + fileSizeMB > pkg.storageQuotaMB)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Storage quota exceeded. Used: ${usedMB.toFixed(1)}MB / ${pkg.storageQuotaMB}MB`,
    );

  const fileType = resolveFileType(file.mimetype);
  if (!pkg.allowedFileType.includes(fileType))
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `File type not allowed by your subscription`,
    );

  const resourceType = getCloudinaryResourceType(file.mimetype);
  const cloudinaryResult = await uploadToCloudinary(file.buffer, {
    folder: `saas-storage/${userId}`,
    resource_type: resourceType,
  });

  let aiTags: string[] = [];
  let aiSummary: string | null = null;

  try {
    if (file.mimetype.startsWith("image/")) {
      const base64 = file.buffer.toString("base64");
      aiTags = await generateImageDescription(
        file.originalname,
        base64,
        file.mimetype,
      );
    } else if (file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(file.buffer);
      const text = pdfData.text;
      [aiTags, aiSummary] = await Promise.all([
        generateFileTags(file.originalname, file.mimetype, text),
        generateDocumentSummary(file.originalname, text),
      ]);
    } else {
      aiTags = await generateFileTags(file.originalname, file.mimetype);
    }
  } catch {}

  const savedFile = await prisma.file.create({
    data: {
      name: file.originalname,
      userId,
      folderId,
      size: file.size,
      type: fileType,
      mimeType: file.mimetype,
      path: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      thumbnailUrl: cloudinaryResult.thumbnail_url ?? null,
      aiTags,
      aiSummary,
    },
  });

  await logActivity(userId, "UPLOAD" as any, savedFile.id, {
    fileName: file.originalname,
    size: file.size,
    folderId,
  });

  return savedFile;
};

const getFilesByFolder = async (
  userId: string,
  folderId: string,
  options: IOptions,
) => {
  if (!folderId)
    throw new ApiError(httpStatus.BAD_REQUEST, "folderId is required");

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId, isDeleted: false },
  });
  if (!folder) throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const where = { folderId, userId, isDeleted: false };

  const [data, total] = await Promise.all([
    prisma.file.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.file.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const searchFiles = async (
  userId: string,
  query: string,
  options: IOptions,
) => {
  if (!query || query.trim().length < 1)
    throw new ApiError(httpStatus.BAD_REQUEST, "Search query is required");

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const where = {
    userId,
    isDeleted: false,
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { aiTags: { has: query.toLowerCase() } },
      { aiSummary: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.file.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.file.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getSingleFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
    include: { shareLinks: { where: { isActive: true } } },
  });
  if (!file) throw new ApiError(404, "File not found");
  return file;
};

const downloadFile = async (id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, isDeleted: false },
  });
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, "File not found");
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
  if (!file) throw new ApiError(404, "File not found");

  if (payload.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: payload.folderId, userId, isDeleted: false },
    });
    if (!folder) throw new ApiError(404, "Target folder not found");
  }

  const updated = await prisma.file.update({ where: { id }, data: payload });

  const action = payload.folderId ? ("MOVE" as any) : ("RENAME" as any);
  await logActivity(userId, action, id, payload);

  return updated;
};

const deleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
  });
  if (!file) throw new ApiError(404, "File not found");

  const result = await prisma.file.update({
    where: { id },
    data: { isDeleted: true },
  });
  await logActivity(userId, "DELETE" as any, id, { fileName: file.name });
  return result;
};

const getTrashFiles = async (userId: string) => {
  return prisma.file.findMany({
    where: { isDeleted: true, userId },
    include: {
      user: { select: { name: true } },
      folder: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
};

const restoreFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  if (!file.isDeleted)
    throw new ApiError(httpStatus.BAD_REQUEST, "File is not in trash");

  const result = await prisma.file.update({
    where: { id },
    data: { isDeleted: false },
  });
  await logActivity(userId, "RESTORE" as any, id, { fileName: file.name });
  return result;
};

const permanentDeleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });
  if (!file) throw new ApiError(404, "File not found");

  // Delete from Cloudinary
  if (file.cloudinaryId) {
    const resourceType = getCloudinaryResourceType(
      file.mimeType || "application/octet-stream",
    );
    await deleteFromCloudinary(file.cloudinaryId, resourceType).catch(() => {});
  }

  await prisma.activityLog.deleteMany({ where: { fileId: id } });
  await prisma.shareLink.deleteMany({ where: { fileId: id } });
  await prisma.file.delete({ where: { id } });

  return { message: "File permanently deleted" };
};

const createShareLink = async (
  userId: string,
  fileId: string,
  options: { expiresInHours?: number; maxViews?: number },
) => {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, isDeleted: false },
  });
  if (!file) throw new ApiError(404, "File not found");

  const { randomBytes } = await import("crypto");
  const token = randomBytes(32).toString("hex");

  const expiresAt = options.expiresInHours
    ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
    : null;

  const link = await prisma.shareLink.create({
    data: {
      token,
      fileId,
      expiresAt,
      maxViews: options.maxViews ?? null,
    },
  });

  await logActivity(userId, "SHARE" as any, fileId, { token });
  return link;
};

const getSharedFile = async (token: string) => {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { file: true },
  });

  if (!link || !link.isActive)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Share link not found or inactive",
    );

  if (link.expiresAt && link.expiresAt < new Date())
    throw new ApiError(httpStatus.GONE, "Share link has expired");

  if (link.maxViews && link.viewCount >= link.maxViews)
    throw new ApiError(httpStatus.GONE, "Share link view limit reached");

  await prisma.shareLink.update({
    where: { token },
    data: { viewCount: { increment: 1 } },
  });

  return { file: link.file, viewCount: link.viewCount + 1 };
};

const revokeShareLink = async (userId: string, token: string) => {
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { file: true },
  });

  if (!link || link.file.userId !== userId)
    throw new ApiError(httpStatus.NOT_FOUND, "Share link not found");

  return prisma.shareLink.update({
    where: { token },
    data: { isActive: false },
  });
};

const getActivityLog = async (userId: string, options: IOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const where = { userId };
  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        file: { select: { name: true, type: true, thumbnailUrl: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { meta: { page, limit, total }, data };
};

export const FileService = {
  uploadFile,
  getFilesByFolder,
  searchFiles,
  getSingleFile,
  downloadFile,
  updateFile,
  deleteFile,
  getTrashFiles,
  restoreFile,
  permanentDeleteFile,
  createShareLink,
  getSharedFile,
  revokeShareLink,
  getActivityLog,
};
