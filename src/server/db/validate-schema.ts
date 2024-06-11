import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { files } from "./schemas/files";
import { apps } from "./schemas/apps";
import { z } from "zod";

export const selectFileSchema = createSelectSchema(files);

export const filesCanOrderByColumns = selectFileSchema.pick({
  createdAt: true,
});

export const createAppSchema = createInsertSchema(apps, {
  name: (schema) =>
    schema.name
      .trim()
      .min(3, {
        message: "Name must be at least 3 characters",
      })
      .max(64, {
        message: "Name must be at most 64 characters",
      }),
}).pick({ name: true, description: true });

export const createStorageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(64, "Name must be at most 64 characters"),
  bucket: z
    .string()
    .trim()
    .min(3, "Bucket must be at least 3 characters")
    .max(64, "Bucket must be at most 64 characters"),
  region: z
    .string()
    .trim()
    .min(6, "Region must be at least 6 characters")
    .max(32, "Region must be at most 32 characters"),
  accessKeyId: z
    .string()
    .trim()
    .min(16, "Access Key ID must be at least 16 characters")
    .max(128, "Access Key ID must be at most 128 characters"),
  secretAccessKey: z
    .string()
    .trim()
    .min(16, "Secret Access Key must be at least 16 characters")
    .max(128, "Secret Access Key must be at most 128 characters"),
  endpoint: z
    .string()
    .trim()
    .max(255, "API Endpoint must be at most 255 characters")
    .optional(),
});

export const createApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(64, "Name must be at most 64 characters"),
  appId: z.string().trim().uuid("App ID must be a valid UUID"),
});
