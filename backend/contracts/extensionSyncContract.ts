import { z } from "zod";

/**
 * Extension Sync Request Payload Schema (Strict Contract)
 * No extra fields permitted (.strict()).
 */
export const ExtensionSyncRequestSchema = z
  .object({
    submissionId: z.string().trim().min(1, "submissionId is required"),
    slug: z.string().trim().min(1, "slug is required"),
    verdict: z.string().trim().min(1, "verdict is required"),
    runtimeMs: z.number().nonnegative().optional(),
    memoryKb: z.number().nonnegative().optional(),
    submittedAt: z.string().min(1, "submittedAt must be non-empty"),
  })
  .strict();

export type ExtensionSyncRequest = z.infer<typeof ExtensionSyncRequestSchema>;

/**
 * Extension Sync Response Payload Schemas
 */
export const ExtensionSyncSolvedResponseSchema = z.object({
  success: z.literal(true),
  status: z.literal("solved"),
  submissionId: z.string(),
});

export const ExtensionSyncAttemptedResponseSchema = z.object({
  success: z.literal(true),
  status: z.literal("attempted"),
  submissionId: z.string(),
});

export const ExtensionSyncAlreadySyncedResponseSchema = z.object({
  status: z.literal("already_synced"),
  submissionId: z.string(),
  idempotent: z.literal(true),
});

export const ExtensionSyncResponseSchema = z.union([
  ExtensionSyncSolvedResponseSchema,
  ExtensionSyncAttemptedResponseSchema,
  ExtensionSyncAlreadySyncedResponseSchema,
]);

export type ExtensionSyncResponse = z.infer<typeof ExtensionSyncResponseSchema>;

