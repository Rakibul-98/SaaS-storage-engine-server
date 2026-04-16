import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation";
import { authRateLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerValidationSchema),
  AuthController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginValidationSchema),
  AuthController.login,
);

router.get("/verify-email", AuthController.verifyEmail);

router.post("/forgot-password", authRateLimiter, AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
