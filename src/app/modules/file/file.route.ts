import express from "express";
import auth from "../../middlewares/auth";
import { FileController } from "./file.controller";
import { upload } from "../../middlewares/file";
import { uploadRateLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

// public share
router.get("/share/:token", FileController.getSharedFile);

// authenticated
router.post(
  "/upload",
  auth("USER", "ADMIN"),
  uploadRateLimiter,
  upload.single("file"),
  FileController.uploadFile,
);
router.get("/", auth("USER", "ADMIN"), FileController.getFilesByFolder);
router.get("/search", auth("USER", "ADMIN"), FileController.searchFiles);
router.get("/trash", auth("USER", "ADMIN"), FileController.getTrashFiles);
router.get("/activity", auth("USER", "ADMIN"), FileController.getActivityLog);
router.get("/:id/download", FileController.downloadFile);
router.patch("/:id/restore", auth("USER", "ADMIN"), FileController.restoreFile);
router.post(
  "/:id/share",
  auth("USER", "ADMIN"),
  FileController.createShareLink,
);
router.delete(
  "/share/:token/revoke",
  auth("USER", "ADMIN"),
  FileController.revokeShareLink,
);
router.get("/:id", auth("USER", "ADMIN"), FileController.getSingleFile);
router.patch("/:id", auth("USER", "ADMIN"), FileController.updateFile);
router.delete("/:id", auth("USER", "ADMIN"), FileController.deleteFile);
router.delete(
  "/:id/permanent",
  auth("USER", "ADMIN"),
  FileController.permanentDeleteFile,
);

export const FileRoutes = router;
