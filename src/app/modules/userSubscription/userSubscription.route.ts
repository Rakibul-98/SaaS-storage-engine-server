import express from "express";
import auth from "../../middlewares/auth";
import { UserSubscriptionController } from "./userSubscription.controller";

const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  UserSubscriptionController.createSubscription,
);

router.get(
  "/me",
  auth("USER", "ADMIN"),
  UserSubscriptionController.getMySubscription,
);

router.get(
  "/history",
  auth("USER", "ADMIN"),
  UserSubscriptionController.getMySubscriptionHistory,
);

export const UserSubscriptionRoutes = router;
