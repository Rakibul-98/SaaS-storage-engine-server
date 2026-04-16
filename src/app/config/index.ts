import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
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
  resend_from_email:
    process.env.RESEND_FROM_EMAIL ||
    "SaaS Storage <noreply@rakibulhasandev.com>",

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  gemini_api_key: process.env.GEMINI_API_KEY,
};
