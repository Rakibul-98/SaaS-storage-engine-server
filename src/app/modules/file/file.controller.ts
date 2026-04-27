import { Response } from "express";
import httpStatus from "http-status";
import { FileService } from "./file.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";
import pick from "../../shared/pick";
import { paginationOptions } from "../../helper/paginationHelper";

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

const getFilesByFolder = catchAsync(async (req: any, res: Response) => {
  const options = pick(req.query, paginationOptions);

  const result = await FileService.getFilesByFolder(
    req.user.id,
    req.query.folderId as string,
    options,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Files retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const searchFiles = catchAsync(async (req: any, res: Response) => {
  const options = pick(req.query, paginationOptions);
  const q = req.query.q as string;

  const result = await FileService.searchFiles(req.user.id, q, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Search results retrieved",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleFile = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.getSingleFile(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File retrieved successfully",
    data: result,
  });
});

const downloadFile = catchAsync(async (req: any, res: Response) => {
  const file = await FileService.downloadFile(req.user.id, req.params.id);

  // If file has a Cloudinary URL, return it for client-side download
  if (file.path && file.path.startsWith("http")) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Download URL retrieved",
      data: { url: file.path },
    });
  }

  // Return URL from cloudinaryId if present
  if ((file as any).cloudinaryId) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Download URL retrieved",
      data: { url: file.path },
    });
  }

  // Fallback: return the stored path as URL
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Download URL retrieved",
    data: { url: file.path },
  });
});

const updateFile = catchAsync(async (req: any, res: Response) => {
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

const deleteFile = catchAsync(async (req: any, res: Response) => {
  await FileService.deleteFile(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted successfully",
    data: {},
  });
});

const getTrashFiles = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.getTrashFiles(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Trash files retrieved successfully",
    data: result,
  });
});

const restoreFile = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.restoreFile(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File restored successfully",
    data: result,
  });
});

const permanentDeleteFile = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.permanentDeleteFile(
    req.user.id,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted permanently",
    data: {},
  });
});

const createShareLink = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.createShareLink(
    req.user.id,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Share link created",
    data: result,
  });
});

const revokeShareLink = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.revokeShareLink(
    req.user.id,
    req.params.token,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Share link revoked",
    data: result,
  });
});

const getSharedFile = catchAsync(async (req: any, res: Response) => {
  const result = await FileService.getSharedFile(req.params.token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shared file retrieved",
    data: result,
  });
});

const getActivityLog = catchAsync(async (req: any, res: Response) => {
  const options = pick(req.query, paginationOptions);

  const result = await FileService.getActivityLog(req.user.id, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Activity log retrieved",
    meta: result.meta,
    data: result.data,
  });
});

export const FileController = {
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
  revokeShareLink,
  getSharedFile,
  getActivityLog,
};
