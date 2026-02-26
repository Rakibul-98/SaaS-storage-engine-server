import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { UserSubscriptionRoutes } from "../modules/userSubscription/userSubscription.route";

const router = Router();
const moduleRouters = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/userSubscriptions",
    route: UserSubscriptionRoutes,
  },
];

moduleRouters.forEach((route) => router.use(route.path, route.route));
export default router;
