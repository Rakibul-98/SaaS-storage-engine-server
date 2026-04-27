import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (
    req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      return cb(new Error("Unauthorized"), "");
    }

    const uploadPath = path.join(process.cwd(), "uploads", userId);

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 100MB hard cap at middleware level (subscription limits enforced in service)
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});
