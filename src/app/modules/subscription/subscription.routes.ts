import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "./subscription.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createPackage,
);

router.get("/", auth("ADMIN"), SubscriptionController.getAllPackages);

router.get("/:id", auth("ADMIN"), SubscriptionController.getSinglePackage);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(updateSubscriptionSchema),
  SubscriptionController.updatePackage,
);

router.delete("/:id", auth("ADMIN"), SubscriptionController.deletePackage);

export const SubscriptionRoutes = router;
