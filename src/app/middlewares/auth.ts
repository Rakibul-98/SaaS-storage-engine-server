import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import config from "../config";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
}

const auth = (...requiredRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    try {
      const verifiedUser = jwt.verify(
        token,
        config.jwt.secret as string,
      ) as any;

      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");
      }

      next();
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }
  };
};

export default auth;
