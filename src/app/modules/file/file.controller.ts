import { Request, Response } from "express";
import httpStatus from "http-status";
import { FileService } from "./file.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";

const uploadFile = catchAsync(async (req: any, res: Response) => {
  if (!req.body.folderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "folderId is required");
  }

  const result = await FileService.uploadFile(
    req.user.id,
    req.file,
    req.body.folderId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "File uploaded successfully",
    data: result,
  });
});

const getSingleFile = catchAsync(async (req: any, res) => {
  const result = await FileService.getSingleFile(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File retrieved successfully",
    data: result,
  });
});

const updateFile = catchAsync(async (req: any, res) => {
  const result = await FileService.updateFile(
    req.user.id,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File updated successfully",
    data: result,
  });
});

const deleteFile = catchAsync(async (req: any, res) => {
  const result = await FileService.deleteFile(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted successfully",
    data: result,
  });
});

const permanentDeleteFile = catchAsync(async (req: any, res) => {
  const result = await FileService.permanentDeleteFile(
    req.user.id,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted permanently",
    data: result,
  });
});

export const FileController = {
  uploadFile,
  getSingleFile,
  updateFile,
  deleteFile,
  permanentDeleteFile,
};
