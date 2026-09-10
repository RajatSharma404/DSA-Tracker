import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { DSA_TEMPLATES } from "../templates";

const router = Router();

// Get all pattern templates
router.get(
  "/vault/templates",
  requireAuth,
  async (_req: Request, res: Response) => {
    res.json(DSA_TEMPLATES);
  },
);

export default router;
