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
