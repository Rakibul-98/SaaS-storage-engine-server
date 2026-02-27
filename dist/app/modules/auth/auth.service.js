"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const auth_utils_1 = require("../../utils/auth.utils");
const prisma_1 = require("../../shared/prisma");
const sendEmail_1 = require("../../shared/sendEmail");
const config_1 = __importDefault(require("../../config"));
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = payload;
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "User already exists");
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload.password, 10);
    const verifyToken = (0, auth_utils_1.generateToken)();
    const user = yield prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            verifyToken,
            verifyTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
        },
    });
    const verifyLink = `${config_1.default.frontend_url}/verify-email?token=${verifyToken}`;
    yield (0, sendEmail_1.sendEmail)(email, "Verify Your Email", `<p>Click below to verify:</p>
     <a href="${verifyLink}">${verifyLink}</a>`);
    const { password, resetToken, resetTokenExpiry } = user, userWithoutPassword = __rest(user, ["password", "resetToken", "resetTokenExpiry"]);
    return userWithoutPassword;
});
const verifyEmail = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            verifyToken: token,
            verifyTokenExpiry: { gt: new Date() },
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired token");
    }
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verifyToken: null,
            verifyTokenExpiry: null,
        },
    });
    return { message: "Email verified successfully" };
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (!user.isVerified) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Please verify your email");
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.generateAccessToken)(jwtPayload);
    const refreshToken = (0, auth_utils_1.generateRefreshToken)(jwtPayload);
    return {
        accessToken,
        refreshToken,
    };
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return; // prevent enumeration
    const resetToken = (0, auth_utils_1.generateToken)();
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
        },
    });
    const resetLink = `${config_1.default.frontend_url}/reset-password?token=${resetToken}`;
    yield (0, sendEmail_1.sendEmail)(email, "Reset Password", `<p>Click below to reset:</p>
     <a href="${resetLink}">${resetLink}</a>`);
});
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gt: new Date() },
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired token");
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
    return { message: "Password reset successful" };
});
exports.AuthService = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword,
};
