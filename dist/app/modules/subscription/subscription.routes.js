"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const subscription_validation_1 = require("./subscription.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.post("/", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.createSubscriptionSchema), subscription_controller_1.SubscriptionController.createPackage);
router.get("/", (0, auth_1.default)("ADMIN", "USER"), subscription_controller_1.SubscriptionController.getAllPackages);
router.get("/:id", (0, auth_1.default)("ADMIN"), subscription_controller_1.SubscriptionController.getSinglePackage);
router.patch("/:id", (0, auth_1.default)("ADMIN"), (0, validateRequest_1.default)(subscription_validation_1.updateSubscriptionSchema), subscription_controller_1.SubscriptionController.updatePackage);
router.delete("/:id", (0, auth_1.default)("ADMIN"), subscription_controller_1.SubscriptionController.deletePackage);
exports.SubscriptionRoutes = router;
