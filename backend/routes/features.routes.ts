import { Router, Request, Response } from "express";
import { getFeatureFlags } from "../features";

const router = Router();

/**
 * GET /api/features
 * Returns active runtime feature flags for client-side gating.
 * Public: flags are not secret, and the dashboard's server layout reads
 * them before any user token exists. Cacheable for 60s.
 */
router.get("/features", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json(getFeatureFlags());
});

export default router;

