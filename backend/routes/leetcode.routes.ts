import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middlewares/auth";
import {
  fetchProblemSubmissions,
  fetchActiveDailyCodingChallengeQuestion,
  fetchProblemDetails,
  submitCodeToLeetCode,
  checkSubmissionResult,
  fetchSubmissionDetails,
} from "../leetcodeService";
import { decryptSecret } from "../utils/encryption";

const router = Router();

// Get LeetCode Submissions for a problem
router.get(
  "/leetcode/submissions/:problemSlug",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user?.leetcodeSession) {
        return res
          .status(400)
          .json({ error: "LeetCode session cookie not set" });
      }

      const data = await fetchProblemSubmissions(
        req.params.problemSlug as string,
        decryptSecret(user.leetcodeSession),
      );
      const submissions = data?.questionSubmissionList?.submissions || [];
      res.json(submissions);
    } catch (error) {
      console.error("Fetch Submissions Error:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  },
);

// Get LeetCode Daily Challenge
router.get(
  "/leetcode/daily-challenge",
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const data = await fetchActiveDailyCodingChallengeQuestion();
      const activeChallenge = data?.activeDailyCodingChallengeQuestion || null;
      res.json(activeChallenge);
    } catch (error) {
      console.error("Fetch Daily Challenge Error:", error);
      res.status(500).json({ error: "Failed to fetch daily challenge" });
    }
  },
);

// Get Problem Details with Code Snippets
router.get(
  "/leetcode/problem/:titleSlug",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const problemDetails = await fetchProblemDetails(
        req.params.titleSlug as string,
      );
      res.json(problemDetails);
    } catch (error) {
      console.error("Fetch Problem Details Error:", error);
      res.status(500).json({ error: "Failed to fetch problem details" });
    }
  },
);

// Submit Code to LeetCode
router.post(
  "/leetcode/submit",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { questionSlug, code, lang } = req.body;
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user?.leetcodeSession) {
        return res.status(400).json({
          error: "LeetCode session cookie not set. Please add it in settings.",
        });
      }

      const result = await submitCodeToLeetCode(
        questionSlug,
        code,
        lang,
        decryptSecret(user.leetcodeSession),
      );
      res.json(result);
    } catch (error: any) {
      console.error("Submit Code Error:", error);
      res.status(500).json({
        error: "Failed to submit code to LeetCode",
        details: error.response?.data || error.message,
      });
    }
  },
);

// Check Submission Result
router.get(
  "/leetcode/submission/:submissionId/check",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user?.leetcodeSession) {
        return res
          .status(400)
          .json({ error: "LeetCode session cookie not set" });
      }

      const result = await checkSubmissionResult(
        req.params.submissionId as string,
        decryptSecret(user.leetcodeSession),
      );
      res.json(result);
    } catch (error) {
      console.error("Check Submission Error:", error);
      res.status(500).json({ error: "Failed to check submission result" });
    }
  },
);

// Get LeetCode Submission Details (Code)
router.get(
  "/leetcode/submission/:submissionId/code",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = (await prisma.user.findUnique({
        where: { id: userId },
      })) as any;

      if (!user?.leetcodeSession) {
        return res
          .status(400)
          .json({ error: "LeetCode session cookie not set" });
      }

      const data = await fetchSubmissionDetails(
        req.params.submissionId as string,
        decryptSecret(user.leetcodeSession),
      );
      const submissionDetails = data?.submissionDetails || null;
      res.json(submissionDetails);
    } catch (error) {
      console.error("Fetch Submission Details Error:", error);
      res.status(500).json({ error: "Failed to fetch submission details" });
    }
  },
);

export default router;
