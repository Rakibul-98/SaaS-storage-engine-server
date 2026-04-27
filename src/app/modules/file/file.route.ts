import express from "express";
import auth from "../../middlewares/auth";
import { FileController } from "./file.controller";
import { upload } from "../../middlewares/file";

const router = express.Router();

// Upload
router.post(
  "/upload",
  auth("USER", "ADMIN"),
  upload.single("file"),
  FileController.uploadFile,
);

// Search — must be before /:id routes
router.get("/search", auth("USER", "ADMIN"), FileController.searchFiles);

// Activity log
router.get("/activity", auth("USER", "ADMIN"), FileController.getActivityLog);

// Trash
router.get("/trash", auth("USER", "ADMIN"), FileController.getTrashFiles);

// Shared file (public — no auth required)
router.get("/share/:token", FileController.getSharedFile);

// Revoke share link (auth required)
router.delete(
  "/share/:token/revoke",
  auth("USER", "ADMIN"),
  FileController.revokeShareLink,
);

// List files by folder
router.get("/", auth("USER", "ADMIN"), FileController.getFilesByFolder);

// Download
router.get("/:id/download", auth("USER", "ADMIN"), FileController.downloadFile);

// Restore from trash
router.patch("/:id/restore", auth("USER", "ADMIN"), FileController.restoreFile);

// Create share link
router.post(
  "/:id/share",
  auth("USER", "ADMIN"),
  FileController.createShareLink,
);

// Permanent delete
router.delete(
  "/:id/permanent",
  auth("USER", "ADMIN"),
  FileController.permanentDeleteFile,
);

// Single file
router.get("/:id", auth("USER", "ADMIN"), FileController.getSingleFile);

// Update (rename / move)
router.patch("/:id", auth("USER", "ADMIN"), FileController.updateFile);

// Soft delete
router.delete("/:id", auth("USER", "ADMIN"), FileController.deleteFile);

export const FileRoutes = router;
