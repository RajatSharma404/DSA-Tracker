import { z } from "zod";

export interface FeatureFlags {
  pvp: boolean;
  arena: boolean;
  interviews: boolean;
  algotracer: boolean;
}

export type FeatureName = keyof FeatureFlags;

const booleanStringSchema = (defaultValue: boolean, envVarName: string) =>
  z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (val === undefined || val === "") {
        return defaultValue;
      }
      const lower = val.trim().toLowerCase();
      if (lower === "true" || lower === "1") return true;
      if (lower === "false" || lower === "0") return false;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid environment variable for ${envVarName}: must be 'true' or 'false', received '${val}'`,
      });
      return z.NEVER;
    });

const featureFlagsSchema = z.object({
  FEATURE_PVP: booleanStringSchema(false, "FEATURE_PVP"),
  FEATURE_ARENA: booleanStringSchema(false, "FEATURE_ARENA"),
  FEATURE_INTERVIEWS: booleanStringSchema(false, "FEATURE_INTERVIEWS"),
  FEATURE_ALGOTRACER: booleanStringSchema(true, "FEATURE_ALGOTRACER"),
});

export function parseFeatureFlags(
  env: Record<string, string | undefined> = process.env,
): FeatureFlags {
  const result = featureFlagsSchema.safeParse(env);
  if (!result.success) {
    const errorMsg = result.error.errors.map((e) => e.message).join("\n");
    throw new Error(
      `[FeatureFlags Startup Error] Invalid feature flag configuration:\n${errorMsg}`,
    );
  }

  return {
    pvp: result.data.FEATURE_PVP,
    arena: result.data.FEATURE_ARENA,
    interviews: result.data.FEATURE_INTERVIEWS,
    algotracer: result.data.FEATURE_ALGOTRACER,
  };
}

let activeFlags: FeatureFlags = parseFeatureFlags();

/**
 * Reloads flags from environment (useful in tests or runtime reconfig).
 */
export function reloadFeatureFlags(
  env: Record<string, string | undefined> = process.env,
): FeatureFlags {
  activeFlags = parseFeatureFlags(env);
  return activeFlags;
}

/**
 * Returns the current runtime feature flags.
 */
export function getFeatureFlags(): FeatureFlags {
  return activeFlags;
}

/**
 * Checks whether a specific feature is enabled.
 */
export function isFeatureEnabled(feature: FeatureName): boolean {
  return activeFlags[feature] === true;
}

