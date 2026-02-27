import httpStatus from "http-status";
import { UserSubscriptionService } from "./userSubscription.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Response } from "express";

const createSubscription = catchAsync(async (req: any, res: Response) => {
  const result = await UserSubscriptionService.createSubscription(
    req.user.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription activated successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: any, res: Response) => {
  const result = await UserSubscriptionService.getMyActiveSubscription(
    req.user.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const getMySubscriptionHistory = catchAsync(async (req: any, res: Response) => {
  const result = await UserSubscriptionService.getMySubscriptionHistory(
    req.user.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription history retrieved successfully",
    data: result,
  });
});

export const UserSubscriptionController = {
  createSubscription,
  getMySubscription,
  getMySubscriptionHistory,
};
