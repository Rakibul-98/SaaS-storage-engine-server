import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/catchAsync";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const AuthController = {
  register,
  login,
};
