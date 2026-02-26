import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { TCreateFolderPayload, TUpdateFolderPayload } from "./folder.types";
import { prisma } from "../../shared/prisma";

const createFolder = async (userId: string, payload: TCreateFolderPayload) => {
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
    throw new ApiError(httpStatus.FORBIDDEN, "No active subscription found");
  }

  const packageData = activeSubscription.package;

  const totalFolders = await prisma.folder.count({
    where: {
      userId,
      isDeleted: false,
    },
  });

  if (totalFolders >= packageData.maxFolders) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `Folder limit exceeded. Max allowed: ${packageData.maxFolders}`,
    );
  }

  let depthLevel = 1;

  if (payload.parentId) {
    const parent = await prisma.folder.findFirst({
      where: {
        id: payload.parentId,
        userId,
        isDeleted: false,
      },
    });

    if (!parent) {
      throw new ApiError(httpStatus.NOT_FOUND, "Parent folder not found");
    }

    depthLevel = parent.depthLevel + 1;

    if (depthLevel > packageData.maxLevels) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        `Maximum folder depth (${packageData.maxLevels}) exceeded`,
      );
    }
  }

  const folder = await prisma.folder.create({
    data: {
      name: payload.name,
      userId,
      parentId: payload.parentId || null,
      depthLevel,
    },
  });

  return folder;
};

const getMyFolders = async (userId: string) => {
  return prisma.folder.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    include: {
      children: true,
    },
  });
};

const getSingleFolder = async (userId: string, folderId: string) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
      isDeleted: false,
    },
    include: {
      children: {
        where: { isDeleted: false },
      },
      files: {
        where: { isDeleted: false },
      },
    },
  });

  if (!folder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

  return folder;
};

const updateFolder = async (
  userId: string,
  folderId: string,
  payload: TUpdateFolderPayload,
) => {
  const existingFolder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
      isDeleted: false,
    },
  });

  if (!existingFolder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

  return prisma.folder.update({
    where: { id: folderId },
    data: payload,
  });
};

const deleteFolder = async (userId: string, folderId: string) => {
  const existingFolder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
      isDeleted: false,
    },
  });

  if (!existingFolder) {
    throw new ApiError(httpStatus.NOT_FOUND, "Folder not found");
  }

  return prisma.folder.update({
    where: { id: folderId },
    data: {
      isDeleted: true,
    },
  });
};

export const FolderService = {
  createFolder,
  getMyFolders,
  getSingleFolder,
  updateFolder,
  deleteFolder,
};
