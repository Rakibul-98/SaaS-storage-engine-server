import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import {
  createFolderValidationSchema,
  updateFolderValidationSchema,
} from "./folder.validation";
import { FolderController } from "./folder.controller";

const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(createFolderValidationSchema),
  FolderController.createFolder,
);

router.get("/", auth("USER", "ADMIN"), FolderController.getMyFolders);

router.get("/:id", auth("USER", "ADMIN"), FolderController.getSingleFolder);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateFolderValidationSchema),
  FolderController.updateFolder,
);

router.delete("/:id", auth("USER", "ADMIN"), FolderController.deleteFolder);

export const FolderRoutes = router;
