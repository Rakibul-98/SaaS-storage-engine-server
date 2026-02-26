import jwt from "jsonwebtoken";
import config from "../config";
import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

const auth = (...requiredRoles: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }

    const verifiedUser = jwt.verify(
      token,
      config.jwt.jwt_access_secret as string,
    ) as any;

    if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden access");
    }

    req.user = verifiedUser;

    next();
  };
};

export default auth;
