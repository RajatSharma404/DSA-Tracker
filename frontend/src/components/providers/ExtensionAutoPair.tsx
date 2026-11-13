"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { pairExtension } from "@/lib/extensionBridge";

const READY_EVENT = "DSA_TRACKER_EXTENSION_READY";
const REPAIR_INTERVAL_MS = 6 * 60 * 60 * 1000; // tokens live 7d; refresh well before

/**
 * Keeps the browser extension paired with the signed-in account. Runs on
 * mount, whenever the extension announces itself (e.g. after an update), and
 * every few hours, so syncs started on leetcode.com never hit an expired token.
 */
export function ExtensionAutoPair() {
  useEffect(() => {
    let cancelled = false;
    const pair = async () => {
      const session = (await getSession().catch(() => null)) as { accessToken?: string } | null;
      if (!cancelled && session?.accessToken) await pairExtension(session.accessToken);
    };

    pair();
    document.addEventListener(READY_EVENT, pair);
    const timer = window.setInterval(pair, REPAIR_INTERVAL_MS);
    return () => {
      cancelled = true;
      document.removeEventListener(READY_EVENT, pair);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
