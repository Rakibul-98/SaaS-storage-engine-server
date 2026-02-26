import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "./subscription.validation";

const router = Router();

router.post(
  "/",
  // auth(Role.ADMIN),
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createPackage,
);

router.get(
  "/",
  // auth(Role.ADMIN),
  SubscriptionController.getAllPackages,
);

router.get(
  "/:id",
  // auth(Role.ADMIN),
  SubscriptionController.getSinglePackage,
);

router.patch(
  "/:id",
  // auth(Role.ADMIN),
  validateRequest(updateSubscriptionSchema),
  SubscriptionController.updatePackage,
);

router.delete(
  "/:id",
  // auth(Role.ADMIN),
  SubscriptionController.deletePackage,
);

export const SubscriptionRoutes = router;
