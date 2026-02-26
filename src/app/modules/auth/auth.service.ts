import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { TLoginPayload, TRegisterPayload } from "./auth.types";
import { generateAccessToken, generateRefreshToken } from "./auth.utils";
import { prisma } from "../../shared/prisma";

const registerUser = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: "USER",
    },
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
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
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
