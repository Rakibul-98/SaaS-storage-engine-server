import { z } from "zod";

export const createFolderValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    parentId: z.string().optional(),
  }),
});

export const updateFolderValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});
