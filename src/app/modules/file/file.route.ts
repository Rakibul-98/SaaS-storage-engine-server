import express from "express";
import auth from "../../middlewares/auth";
import { FileController } from "./file.controller";
import { upload } from "../../middlewares/file";

const router = express.Router();

router.post(
  "/upload",
  auth("USER", "ADMIN"),
  upload.single("file"),
  FileController.uploadFile,
);

router.get("/", auth("USER", "ADMIN"), FileController.getFilesByFolder);

router.get("/trash", auth("USER", "ADMIN"), FileController.getTrashFiles);

router.get("/:id/download", auth("USER", "ADMIN"), FileController.downloadFile);

router.patch("/:id/restore", auth("USER", "ADMIN"), FileController.restoreFile);

router.get("/:id", auth("USER", "ADMIN"), FileController.getSingleFile);

router.patch("/:id", auth("USER", "ADMIN"), FileController.updateFile);

router.delete("/:id", auth("USER", "ADMIN"), FileController.deleteFile);

router.delete(
  "/:id/permanent",
  auth("USER", "ADMIN"),
  FileController.permanentDeleteFile,
);

export const FileRoutes = router;
