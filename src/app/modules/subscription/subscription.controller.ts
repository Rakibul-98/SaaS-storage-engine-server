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

export const SubscriptionController = {
  createPackage,
};
