import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation";

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthController.register,
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthController.login,
);

router.get("/verify-email", AuthController.verifyEmail);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
