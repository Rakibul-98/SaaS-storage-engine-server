"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRouter = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const route = (0, express_1.Router)();
route.post("/", 
// auth(Role.ADMIN),
// validateRequest(createSubscriptionSchema),
subscription_controller_1.SubscriptionController.createPackage);
exports.SubscriptionRouter = route;
