import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createSubscriptionSchema } from "./subscription.validation";

const route = Router();

route.post(
  "/",
  // auth(Role.ADMIN),
  validateRequest(createSubscriptionSchema),
  SubscriptionController.createPackage,
);

export const SubscriptionRouter = route;
