import { Request, Response, NextFunction } from "express";
import { isFeatureEnabled, FeatureName } from "../features";

/**
 * Middleware that guards a route or router based on feature flags.
 * Returns 404 with code FEATURE_DISABLED when the feature is turned off.
 */
export function requireFeature(feature: FeatureName) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        error: {
          code: "FEATURE_DISABLED",
          message: "This feature is currently disabled.",
        },
      });
    }
    next();
  };
}

