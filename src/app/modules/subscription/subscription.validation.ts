import { z } from "zod";

const subscriptionBaseSchema = z.object({
  name: z.string().min(1),

  maxFolders: z.number().int().positive(),
  maxLevels: z.number().int().positive(),

  allowedFileType: z.array(z.enum(["IMAGE", "VIDEO", "AUDIO", "PDF"])).min(1),

  maxFileSizeMB: z.number().positive(),
  fileLimit: z.number().int().positive(),
  filesPerFolder: z.number().int().positive(),
});

export const createSubscriptionSchema = z.object({
  body: subscriptionBaseSchema,
});

export const updateSubscriptionSchema = z.object({
  body: subscriptionBaseSchema.partial(),
});
