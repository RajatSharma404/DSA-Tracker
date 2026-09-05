"use client";

import React, { useEffect } from "react";
import {
  configureMobileStatusBar,
  initMobileAppListeners,
  isNativePlatform,
} from "@/lib/mobile";

export function MobileProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if (!isNativePlatform()) return;

    // Configure status bar color and style for native mobile shell
    configureMobileStatusBar(true);

    // Setup native back button listeners
    const cleanup = initMobileAppListeners();

    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
}
