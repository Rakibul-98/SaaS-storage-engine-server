import { Request, Response } from "express";

import httpStatus from "http-status";
import { FolderService } from "./folder.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const createFolder = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.createFolder(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Folder created successfully",
    data: result,
  });
});

const getMyFolders = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.getMyFolders(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folders retrieved successfully",
    data: result,
  });
});

const getSingleFolder = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.getSingleFolder(
    req.user.id,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folder retrieved successfully",
    data: result,
  });
});

const updateFolder = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.updateFolder(
    req.user.id,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folder updated successfully",
    data: result,
  });
});

const deleteFolder = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.deleteFolder(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folder deleted successfully",
    data: result,
  });
});

export const FolderController = {
  createFolder,
  getMyFolders,
  getSingleFolder,
  updateFolder,
  deleteFolder,
};
