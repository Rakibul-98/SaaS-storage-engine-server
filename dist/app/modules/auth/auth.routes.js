"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = express_1.default.Router();
router.post("/register", rateLimiter_1.authRateLimiter, (0, validateRequest_1.default)(auth_validation_1.registerValidationSchema), auth_controller_1.AuthController.register);
router.post("/login", rateLimiter_1.authRateLimiter, (0, validateRequest_1.default)(auth_validation_1.loginValidationSchema), auth_controller_1.AuthController.login);
router.get("/verify-email", auth_controller_1.AuthController.verifyEmail);
router.post("/forgot-password", rateLimiter_1.authRateLimiter, auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password", auth_controller_1.AuthController.resetPassword);
exports.AuthRoutes = router;
