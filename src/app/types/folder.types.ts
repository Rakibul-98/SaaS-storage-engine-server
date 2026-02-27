export type TCreateFolderPayload = {
  name: string;
  parentId?: string;
};

export type TUpdateFolderPayload = {
  name?: string;
  parentId?: string;
};
export type TFolderNode = {
  id: string;
  name: string;
  parentId: string | null;
  depthLevel: number;
  createdAt: Date;
  updatedAt: Date;
};
