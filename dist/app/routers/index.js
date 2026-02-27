"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const subscription_routes_1 = require("../modules/subscription/subscription.routes");
const userSubscription_route_1 = require("../modules/userSubscription/userSubscription.route");
const folder_route_1 = require("../modules/folder/folder.route");
const file_route_1 = require("../modules/file/file.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const router = (0, express_1.Router)();
const moduleRouters = [
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/subscriptions",
        route: subscription_routes_1.SubscriptionRoutes,
    },
    {
        path: "/userSubscriptions",
        route: userSubscription_route_1.UserSubscriptionRoutes,
    },
    {
        path: "/folders",
        route: folder_route_1.FolderRoutes,
    },
    {
        path: "/files",
        route: file_route_1.FileRoutes,
    },
    {
        path: "/dashboard",
        route: dashboard_route_1.DashboardRoutes,
    },
];
moduleRouters.forEach((route) => router.use(route.path, route.route));
exports.default = router;
