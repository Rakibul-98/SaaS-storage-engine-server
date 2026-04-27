"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    frontend_url: process.env.FRONTEND_URL,
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN,
        jwt_access_secret: process.env.JWT_ACCESS_SECRET,
        jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    },
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    resend_api_key: process.env.RESEND_API_KEY,
    resend_from_email: process.env.RESEND_FROM_EMAIL ||
        "SaaS Storage <noreply@rakibulhasandev.com>",
};
