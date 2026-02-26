"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionSchema = exports.createSubscriptionSchema = void 0;
const zod_1 = require("zod");
const subscriptionBaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    maxFolders: zod_1.z.number().int().positive(),
    maxLevels: zod_1.z.number().int().positive(),
    allowedFileType: zod_1.z.array(zod_1.z.enum(["IMAGE", "VIDEO", "AUDIO", "PDF"])).min(1),
    maxFileSizeMB: zod_1.z.number().positive(),
    fileLimit: zod_1.z.number().int().positive(),
    filesPerFolder: zod_1.z.number().int().positive(),
});
exports.createSubscriptionSchema = zod_1.z.object({
    body: subscriptionBaseSchema,
});
exports.updateSubscriptionSchema = zod_1.z.object({
    body: subscriptionBaseSchema.partial(),
});
