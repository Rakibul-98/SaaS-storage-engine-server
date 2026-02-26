import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";
import httpStatus from "http-status";

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.createPackage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription package created successfully",
    data: result,
  });
});

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllPackages();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages retrieved successfully",
    data: result,
  });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSinglePackage(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package retrieved successfully",
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updatePackage(
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package updated successfully",
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deletePackage(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package deleted successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
};
