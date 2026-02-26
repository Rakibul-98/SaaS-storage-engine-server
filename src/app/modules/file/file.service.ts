import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import fs from "fs";

const resolveFileType = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (mimeType === "application/pdf") return "PDF";

  return null;
};

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
    where: {
      id: folderId,
      userId,
      isDeleted: false,
    },
  });

  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

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

  if (totalFiles >= packageData.fileLimit) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `File limit exceeded. Max allowed: ${packageData.fileLimit}`,
    );
  }

  const folderFiles = await prisma.file.count({
    where: {
      folderId,
      isDeleted: false,
    },
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
      `File type not allowed by your subscription`,
    );
  }

  const savedFile = await prisma.file.create({
    data: {
      name: file.originalname,
      userId,
      folderId,
      size: file.size,
      type: fileType,
      path: file.path,
    },
  });

  return savedFile;
};

const getSingleFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: {
      id,
      userId,
      isDeleted: false,
    },
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

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
    throw new ApiError(404, "File not found");
  }

  if (payload.folderId) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: payload.folderId,
        userId,
        isDeleted: false,
      },
    });

    if (!folder) {
      throw new ApiError(404, "Target folder not found");
    }
  }

  return prisma.file.update({
    where: { id },
    data: payload,
  });
};

const deleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  return prisma.file.update({
    where: { id },
    data: { isDeleted: true },
  });
};

const permanentDeleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId },
  });

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  await prisma.file.delete({
    where: { id },
  });

  return { message: "File permanently deleted" };
};

export const FileService = {
  uploadFile,
  getSingleFile,
  updateFile,
  deleteFile,
  permanentDeleteFile,
};
