import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { getUserCityProgressInfo } from "../services/cityProgressService";

const router = Router();

// === CITY PROGRESS ROUTE ===
router.get(
  "/city/progress",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const cityInfo = await getUserCityProgressInfo(req.user!.id);
      res.json(cityInfo);
    } catch (error) {
      console.error("Failed to get city progress:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
