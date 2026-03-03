import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { TLoginPayload, TRegisterPayload } from "../../types/auth.types";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} from "../../utils/auth.utils";
import { prisma } from "../../shared/prisma";
import { sendEmail } from "../../shared/sendEmail";
import config from "../../config";

const registerUser = async (payload: TRegisterPayload) => {
  const { name, email } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const verifyToken = generateToken();

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const verifyLink = `${config.frontend_url}/verify-email?token=${verifyToken}`;

    try {
      await sendEmail(
        email,
        "Verify Your Email",
        `<p>Click below to verify:</p>
         <a href="${verifyLink}">${verifyLink}</a>`,
      );
    } catch (emailError) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send verification email. Please try again.",
      );
    }

    const { password, resetToken, resetTokenExpiry, ...userWithoutPassword } =
      user;
    return userWithoutPassword;
  });
};

const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      verifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired token");
  }

  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    const newToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken: newToken,
        verifyTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const verifyLink = `${config.frontend_url}/verify-email?token=${newToken}`;

    await sendEmail(
      user.email,
      "New Verification Link",
      `<p>Your previous link expired. Use this new one:</p><a href="${verifyLink}">${verifyLink}</a>`,
    );

    return {
      message: "Token expired. A new verification email has been sent.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });

  return { message: "Email verified successfully" };
};

const loginUser = async (payload: TLoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, "Please verify your email");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return;

  const resetToken = generateToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const resetLink = `${config.frontend_url}/reset-password?token=${resetToken}`;

  await sendEmail(
    email,
    "Reset Password",
    `<p>Click below to reset:</p>
     <a href="${resetLink}">${resetLink}</a>`,
  );
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: "Password reset successful" };
};

export const AuthService = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
};
