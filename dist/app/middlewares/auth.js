"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const config_1 = __importDefault(require("../config"));
const auth = (...requiredRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        try {
            const verifiedUser = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
            req.user = verifiedUser;
            if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden access");
            }
            next();
        }
        catch (error) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid or expired token");
        }
    };
};
exports.default = auth;
