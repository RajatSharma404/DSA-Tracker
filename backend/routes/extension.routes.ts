import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { User } from "@prisma/client";
import { fetchProblemSubmissions } from "../leetcodeService";
import { hashSecret, encryptSecret, decryptSecret } from "../utils/encryption";
import { extensionSyncLimiter } from "../middlewares/rateLimiter";
import { resolveAuthenticatedUser } from "../middlewares/auth";
import {
  SLUG_RE,
  importSolvedProblems,
  sanitizeCode,
  sanitizeEntries,
} from "../services/leetcodeImportService";

const router = Router();

const resolveUserBySession = async (session: string): Promise<User | null> => {
  const sessionHash = hashSecret(session);
  const byHash = await prisma.user.findFirst({ where: { leetcodeSessionHash: sessionHash } });
  if (byHash) return byHash;

  const legacy = await prisma.user.findFirst({
    where: {
      OR: [{ leetcodeSession: session }, { leetcodeSession: encryptSecret(session) }],
    },
  });
  if (legacy) {
    await prisma.user.update({
      where: { id: legacy.id },
      data: { leetcodeSession: encryptSecret(session), leetcodeSessionHash: sessionHash },
    });
  }
  return legacy;
};

/**
 * POST /api/extension/sync
 *
 * v2 (extension >= 2.0): Bearer token from app pairing + the verdict the
 * extension captured from LeetCode's own judge response. No LeetCode cookie is
 * sent to the server and no extra LeetCode API round-trip is needed.
 *
 * v1 (legacy): { problemSlug, leetcodeSession } — the server looks up the
 * accepted submission with the stored session.
 */
router.post("/extension/sync", extensionSyncLimiter, async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const slug = String(body.slug ?? body.problemSlug ?? "").trim().toLowerCase();
    const session = typeof body.leetcodeSession === "string" ? body.leetcodeSession.trim() : "";
    const authHeader = req.headers.authorization;

    if (!SLUG_RE.test(slug) || (!authHeader && session.length < 20)) {
      return res.status(400).json({ error: "Missing problemSlug or session" });
    }

    let user: User | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const authUser = await resolveAuthenticatedUser(authHeader);
      if (authUser) user = await prisma.user.findUnique({ where: { id: authUser.id } });
    }
    if (!user && session.length >= 20) user = await resolveUserBySession(session);
    if (!user) {
      return res.status(401).json({ error: "No user linked to this request or LeetCode session" });
    }

    let entry = sanitizeEntries([
      {
        titleSlug: slug,
        title: body.title,
        difficulty: body.difficulty,
        timestamp: body.timestamp,
        runtime: body.runtime,
        memory: body.memory,
      },
    ])[0];

    // Legacy path: confirm against LeetCode with the session cookie.
    if (Number(body.version) !== 2) {
      const activeSession =
        session || (user.leetcodeSession ? decryptSecret(user.leetcodeSession) : "");
      if (!activeSession) {
        return res.status(400).json({ error: "No active LeetCode session found for this user" });
      }
      const data = await fetchProblemSubmissions(slug, activeSession);
      const accepted = (data?.questionSubmissionList?.submissions || []).find(
        (s: { statusDisplay?: string }) => s.statusDisplay === "Accepted",
      ) as
        | { title?: string; timestamp?: string | number; runtime?: string; memory?: string }
        | undefined;
      if (!accepted) return res.status(400).json({ error: "No accepted submission found" });
      entry = {
        ...entry,
        title: accepted.title || entry.title,
        timestamp: Number(accepted.timestamp) || entry.timestamp,
        runtime: accepted.runtime || entry.runtime,
        memory: accepted.memory || entry.memory,
      };
    }

    const result = await importSolvedProblems(user.id, [entry]);
    const problem = result.problems[0];

    // Keep the accepted code in the user's solution history (deduplicated).
    const code = sanitizeCode(body.code);
    if (problem && code) {
      const language = typeof body.lang === "string" ? body.lang.slice(0, 30) : "unknown";
      const duplicate = await prisma.solutionHistory.findFirst({
        where: { userId: user.id, problemId: problem.id, code },
        select: { id: true },
      });
      if (!duplicate) {
        await prisma.solutionHistory.create({
          data: {
            userId: user.id,
            problemId: problem.id,
            code,
            language,
            isCorrect: true,
            score: 100,
            verdict: "ACCEPTED",
            isAIGenerated: "UNKNOWN",
          },
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${problem?.title ?? slug} from extension!`,
      problem: problem ? { id: problem.id, title: problem.title, isNew: problem.isNew } : null,
    });
  } catch (err) {
    console.error("Extension Sync Error:", err);
    res.status(500).json({ error: "Extension sync failed" });
  }
});

export default router;
