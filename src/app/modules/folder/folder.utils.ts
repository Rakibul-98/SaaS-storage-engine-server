import { prisma } from "../../shared/prisma";
import { TFolderNode } from "./folder.types";

export const buildFolderTree = (
  folders: TFolderNode[],
  parentId: string | null = null,
): any[] => {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .map((folder) => ({
      ...folder,
      children: buildFolderTree(folders, folder.id),
    }));
};

export const checkIfDescendant = async (
  folderId: string,
  targetParentId: string,
): Promise<boolean> => {
  let currentParent = await prisma.folder.findFirst({
    where: { id: targetParentId, isDeleted: false },
  });

  while (currentParent) {
    if (currentParent.parentId === folderId) {
      return true;
    }

    if (!currentParent.parentId) break;

    currentParent = await prisma.folder.findFirst({
      where: { id: currentParent.parentId, isDeleted: false },
    });
  }

  return false;
};
