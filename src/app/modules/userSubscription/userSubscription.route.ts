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

export const UserSubscriptionRoutes = router;
