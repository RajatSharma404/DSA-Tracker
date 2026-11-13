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
    // Optional enrichment captured from LeetCode's own judge response
    title: z.string().trim().max(200).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    lang: z.string().trim().max(30).optional(),
    code: z.string().max(100_000).optional(),
    runtimePercentile: z.number().min(0).max(100).optional(),
    memoryPercentile: z.number().min(0).max(100).optional(),
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

