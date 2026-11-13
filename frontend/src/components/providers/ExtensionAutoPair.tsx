"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getExtensionStatus, pairExtension } from "@/lib/extensionBridge";
import { dsaApi } from "@/lib/api";

const READY_EVENT = "DSA_TRACKER_EXTENSION_READY";
const ATTEMPT_KEY = "dsa_ext_autopair_attempt";
const RETRY_AFTER_MS = 10 * 60 * 1000;

/**
 * Pairs the browser extension automatically. When the extension reports it is
 * not paired (fresh install, unpaired, or token revoked), mint a revocable
 * `dsat_` device token and hand it over. Paired extensions are left alone, so
 * this never creates a device per page load.
 */
export function ExtensionAutoPair() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    const run = async () => {
      const ext = await getExtensionStatus();
      if (cancelled || ext.state === "NOT_INSTALLED" || ext.outdated || ext.paired) return;
      try {
        const last = Number(sessionStorage.getItem(ATTEMPT_KEY) || 0);
        if (Date.now() - last < RETRY_AFTER_MS) return;
        sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
      } catch {
        // storage optional
      }
      try {
        const { token } = (await dsaApi.createExtensionDevice("Chrome extension (auto-paired)")) as { token?: string };
        if (!cancelled && token) await pairExtension(token);
      } catch {
        // Manual pairing from the Extension page still works.
      }
    };

    run();
    document.addEventListener(READY_EVENT, run);
    return () => {
      cancelled = true;
      document.removeEventListener(READY_EVENT, run);
    };
  }, [status]);

  return null;
}
