import { Request, Response } from "express";

import httpStatus from "http-status";
import { FolderService } from "./folder.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../shared/pick";
import { paginationOptions } from "../../helper/paginationHelper";

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
  const filters = pick(req.query, ["parentId"]);
  const options = pick(req.query, paginationOptions);

  const result = await FolderService.getMyFolders(
    req.user.id,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getFolderTree = catchAsync(async (req: any, res: Response) => {
  const result = await FolderService.getFolderTree(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Folder tree retrieved successfully",
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
    data: {},
  });
});

export const FolderController = {
  createFolder,
  getMyFolders,
  getFolderTree,
  getSingleFolder,
  updateFolder,
  deleteFolder,
};
