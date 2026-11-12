import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { getFeatureFlags } from "../features";

const router = Router();

/**
 * GET /api/features
 * Returns active runtime feature flags for client-side gating.
 * Authenticated and cacheable for 60s.
 */
router.get("/features", requireAuth, (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "private, max-age=60");
  res.json(getFeatureFlags());
});

export default router;

