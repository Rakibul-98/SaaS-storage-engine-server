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
    message: "Registration successful. Please verify email.",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await AuthService.verifyEmail(req.query.token as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verification successful.",
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

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "If email exists, reset link sent",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await AuthService.resetPassword(token, newPassword);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful.",
    data: {},
  });
});

export const AuthController = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
