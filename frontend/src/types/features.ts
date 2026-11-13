export interface FeatureFlags {
  pvp: boolean;
  arena: boolean;
  interviews: boolean;
  algotracer: boolean;
}

export type FeatureName = keyof FeatureFlags;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  pvp: false,
  arena: false,
  interviews: false,
  algotracer: true,
};

