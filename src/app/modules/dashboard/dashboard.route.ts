import express from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/", auth("USER", "ADMIN"), DashboardController.getUsageStatistics);

export const DashboardRoutes = router;
