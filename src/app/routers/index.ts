import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { SubscriptionRoutes } from "../modules/subscription/subscription.routes";
import { UserSubscriptionRoutes } from "../modules/userSubscription/userSubscription.route";
import { FolderRoutes } from "../modules/folder/folder.route";

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
  {
    path: "/folders",
    route: FolderRoutes,
  },
];

moduleRouters.forEach((route) => router.use(route.path, route.route));
export default router;
