import jwt from "jsonwebtoken";
import config from "../../config";

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.jwt_access_secret as string, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.jwt_refresh_secret as string, {
    expiresIn: "7d",
  });
};
