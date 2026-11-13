"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FeatureFlags,
  FeatureName,
  DEFAULT_FEATURE_FLAGS,
} from "@/types/features";
import { dsaApi } from "@/lib/api";

const FeaturesContext = createContext<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

export function FeaturesProvider({
  initialFlags = DEFAULT_FEATURE_FLAGS,
  children,
}: {
  initialFlags?: FeatureFlags;
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);

  useEffect(() => {
    let mounted = true;
    dsaApi
      .getFeatureFlags()
      .then((loaded) => {
        if (mounted && loaded) {
          setFlags(loaded);
        }
      })
      .catch(() => {
        // Fall back to safe defaults (parked features OFF)
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FeaturesContext.Provider value={flags}>{children}</FeaturesContext.Provider>
  );
}

/**
 * Hook to access all runtime feature flags.
 */
export function useFeatures(): FeatureFlags {
  return useContext(FeaturesContext) || DEFAULT_FEATURE_FLAGS;
}

/**
 * Hook to check if a specific feature is enabled.
 */
export function useFeature(name: FeatureName): boolean {
  const flags = useFeatures();
  return Boolean(flags[name]);
}

