import { Router, Request, Response } from "express";
import { z } from "zod";
import { scheduleSolve } from "../services/reviewScheduling";
import { prisma } from "../db/prisma";
import { extensionSyncLimiter, deviceSyncLimiter } from "../middlewares/rateLimiter";
import { requireAuth, resolveAuthenticatedUser } from "../middlewares/auth";
import {
  requireExtensionToken,
  generateDeviceToken,
} from "../middlewares/extensionAuth";
import { invalidateWeakTopicsCache } from "../services";
import { ensureExtraPracticeProblem } from "../services/leetcodeImportService";

const router = Router();

// =========================================================================
// 2.1 PAIRING TOKEN DEVICE MANAGEMENT ROUTES (Requires User Auth)
// =========================================================================

const createDeviceSchema = z.object({
  name: z.string().trim().min(1).max(100).default("Chrome Extension"),
  scopes: z.array(z.string()).default(["sync:write"]),
  expiresInDays: z.number().int().positive().optional(),
});

/**
 * POST /api/extension/devices
 * Creates a new extension pairing token for the authenticated user.
 * Displays plaintext token ONCE; stores only the SHA-256 hash.
 */
router.post(
  "/extension/devices",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const parsed = createDeviceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid device data", details: parsed.error.format() });
      }

      const { name, scopes, expiresInDays } = parsed.data;
      const { plaintext, tokenHash, tokenPrefix } = generateDeviceToken();
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 86_400_000)
        : null;

      const device = await prisma.extensionDevice.create({
        data: {
          userId: req.user!.id,
          name,
          tokenHash,
          tokenPrefix,
          scopes,
          expiresAt,
        },
        select: {
          id: true,
          name: true,
          tokenPrefix: true,
          scopes: true,
          createdAt: true,
          expiresAt: true,
        },
      });

      return res.status(201).json({
        device,
        token: plaintext,
      });
    } catch (err) {
      console.error("[extension] Error creating pairing token device:", err);
      return res.status(500).json({ error: "Failed to create extension device pairing token" });
    }
  },
);

/**
 * GET /api/extension/devices
 * Lists pairing devices belonging to the authenticated user.
 */
router.get(
  "/extension/devices",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const devices = await prisma.extensionDevice.findMany({
        where: { userId: req.user!.id },
        select: {
          id: true,
          name: true,
          tokenPrefix: true,
          scopes: true,
          lastUsedAt: true,
          expiresAt: true,
          revokedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ devices });
    } catch (err) {
      console.error("[extension] Error listing pairing devices:", err);
      return res.status(500).json({ error: "Failed to list extension pairing devices" });
    }
  },
);

/**
 * DELETE /api/extension/devices/:id
 * Revokes a pairing device. User can only revoke their own devices.
 */
router.delete(
  "/extension/devices/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const deviceId = req.params.id as string;
      const device = await prisma.extensionDevice.findFirst({
        where: { id: deviceId, userId: req.user!.id },
      });

      if (!device) {
        return res.status(404).json({ error: "Device not found or not owned by user" });
      }

      await prisma.extensionDevice.update({
        where: { id: deviceId },
        data: { revokedAt: new Date() },
      });

      return res.json({ success: true, message: "Device pairing revoked successfully" });
    } catch (err) {
      console.error("[extension] Error revoking device:", err);
      return res.status(500).json({ error: "Failed to revoke extension device" });
    }
  },
);

// =========================================================================
// 2.2 & 2.4 EXTENSION SYNC CONTRACT & LEGACY SYNC ROUTE
// =========================================================================

import { ExtensionSyncRequestSchema } from "../contracts/extensionSyncContract";

const syncStrictSchema = ExtensionSyncRequestSchema;

/**
 * Helper middleware that supports pairing token auth (primary) or user JWT auth.
 */
async function authenticateSyncRequest(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!req.body || !("submissionId" in req.body)) {
      // Pre-pairing extensions (v1) sent { problemSlug, leetcodeSession }.
      const { problemSlug, leetcodeSession } = req.body || {};
      if (!problemSlug || typeof leetcodeSession !== "string" || leetcodeSession.trim().length < 20) {
        return res.status(400).json({ error: "Missing problemSlug or session" });
      }
      return res.status(400).json({
        error: "Legacy extension sync is no longer supported. Update the extension and pair it.",
      });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  if (token.startsWith("dsat_")) {
    return requireExtensionToken(req, res, next);
  }

  // Fallback to standard user JWT
  const user = await resolveAuthenticatedUser(authHeader);
  if (user) {
    req.user = user;
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
}

/**
 * POST /api/extension/sync
 * Modern pairing-token authenticated sync endpoint with idempotent submission tracking.
 */
router.post(
  "/extension/sync",
  deviceSyncLimiter,
  extensionSyncLimiter,
  authenticateSyncRequest,
  async (req: Request, res: Response) => {
    try {
      // 1. Check for Modern Strict Contract Payload (2.2)
      if (req.body && "submissionId" in req.body) {
        const parseResult = syncStrictSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            error: "Invalid sync submission payload",
            details: parseResult.error.format(),
          });
        }

        const { submissionId, slug, verdict, runtimeMs, memoryKb, submittedAt } =
          parseResult.data;
        const userId = req.user!.id;

        // Idempotency check: replay returns 200 with idempotent flag
        const existingReceipt = await prisma.syncReceipt.findUnique({
          where: {
            userId_submissionId: {
              userId,
              submissionId,
            },
          },
        });

        if (existingReceipt) {
          return res.status(200).json({
            status: "already_synced",
            submissionId,
            idempotent: true,
          });
        }

        // Exact slug match ("two-sum" must not match "two-sum-ii-...").
        const normalizedSlug = slug.trim().toLowerCase();
        let problem = await prisma.problem.findFirst({
          where: {
            OR: [
              { link: { contains: `/problems/${normalizedSlug}/` } },
              { link: { endsWith: `/problems/${normalizedSlug}` } },
            ],
          },
        });

        // Solved something outside the curriculum: track it under Extra Practice.
        if (!problem && verdict.toUpperCase() === "ACCEPTED" && parseResult.data.title) {
          problem = await ensureExtraPracticeProblem(normalizedSlug, parseResult.data.title, parseResult.data.difficulty);
        }

        if (!problem) {
          return res.status(404).json({
            error: "Problem not found",
            code: "PROBLEM_NOT_FOUND",
          });
        }

        const submittedDate = new Date(submittedAt);
        const isAccepted = verdict.toUpperCase() === "ACCEPTED";

        if (isAccepted) {
          const existingProgress = await prisma.progress.findUnique({
            where: { userId_problemId: { userId, problemId: problem.id } },
            select: {
              completedAt: true,
              stability: true,
              difficultyFsrs: true,
              interval: true,
              repetitions: true,
              lapses: true,
              state: true,
              nextReviewDate: true,
              lastReviewedAt: true,
            },
          });
          const solveSchedule = scheduleSolve(existingProgress, submittedDate);
          const acceptedCode = parseResult.data.code;
          await prisma.$transaction(async (tx) => {
            await tx.syncReceipt.create({
              data: {
                userId,
                submissionId,
                slug: normalizedSlug,
                verdict,
                syncedAt: new Date(),
              },
            });

            await tx.progress.upsert({
              where: {
                userId_problemId: {
                  userId,
                  problemId: problem.id,
                },
              },
              update: {
                status: "DONE",
                // A re-solve refreshes the review clock but keeps the first solve date.
                completedAt: existingProgress?.completedAt ?? submittedDate,
                ...solveSchedule,
                leetcodeRuntime: runtimeMs ? `${runtimeMs} ms` : null,
                leetcodeMemory: memoryKb ? `${memoryKb} KB` : null,
              },
              create: {
                userId,
                problemId: problem.id,
                status: "DONE",
                completedAt: submittedDate,
                ...solveSchedule,
                leetcodeRuntime: runtimeMs ? `${runtimeMs} ms` : null,
                leetcodeMemory: memoryKb ? `${memoryKb} KB` : null,
              },
            });

            if (acceptedCode) {
              await tx.solutionHistory.create({
                data: {
                  userId,
                  problemId: problem.id,
                  code: acceptedCode,
                  language: parseResult.data.lang ?? "unknown",
                  isCorrect: true,
                  score: 100,
                  verdict: "ACCEPTED",
                },
              });
            }

            await tx.activityEvent.create({
              data: {
                userId,
                problemId: problem.id,
                type: "SOLVED",
                occurredAt: submittedDate,
                metadata: {
                  submissionId,
                  runtimeMs,
                  memoryKb,
                  verdict,
                },
              },
            });
          });

          void invalidateWeakTopicsCache(userId);

          return res.json({
            success: true,
            status: "solved",
            submissionId,
          });
        } else {
          // Non-ACCEPTED verdict logs an ATTEMPTED ActivityEvent without marking DONE
          await prisma.$transaction(async (tx) => {
            await tx.syncReceipt.create({
              data: {
                userId,
                submissionId,
                slug: normalizedSlug,
                verdict,
                syncedAt: new Date(),
              },
            });

            await tx.activityEvent.create({
              data: {
                userId,
                problemId: problem.id,
                type: "ATTEMPTED",
                occurredAt: submittedDate,
                metadata: {
                  submissionId,
                  runtimeMs,
                  memoryKb,
                  verdict,
                },
              },
            });
          });

          return res.json({
            success: true,
            status: "attempted",
            submissionId,
          });
        }
      }

      return res.status(400).json({ error: "Invalid sync submission payload" });
    } catch (err) {
      console.error("Extension Sync Error:", err);
      return res.status(500).json({ error: "Extension sync failed" });
    }
  },
);

export default router;
