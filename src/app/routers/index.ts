import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";
import { SubscriptionRouter } from "../modules/subscription/subscription.routes";

const router = Router();
const moduleRouters = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRouter,
  },
];

moduleRouters.forEach((route) => router.use(route.path, route.route));
export default router;
