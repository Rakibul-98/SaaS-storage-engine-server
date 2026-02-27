import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { DashboardService } from "./dashboard.service";

const getUsageStatistics = catchAsync(async (req: any, res: Response) => {
  const result = await DashboardService.getUsageStatistics(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Usage statistics retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getUsageStatistics,
};
