import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.routes";

const router = Router();
const moduleRouters = [
  {
    path: "/auth",
    route: AuthRouter,
  },
];

moduleRouters.forEach((route) => router.use(route.path, route.route));
export default router;
