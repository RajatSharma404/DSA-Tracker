"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Download, Puzzle } from "lucide-react";
import {
  getExtensionHealth,
  ExtensionHealthState,
} from "@/lib/extensionBridge";

const STORE_URL =
  process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim() ||
  "https://chromewebstore.google.com";

interface ExtensionStatusBadgeProps {
  compact?: boolean;
}

export function ExtensionStatusBadge({ compact = false }: ExtensionStatusBadgeProps) {
  const [state, setState] = useState<ExtensionHealthState>("NOT_INSTALLED");

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const health = await getExtensionHealth();
      if (!mounted) return;
      setState(health.state);
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleBadgeClick = (tab: "extension" | "cookie" = "extension") => {
    window.dispatchEvent(
      new CustomEvent("dsa-open-sync-guide", { detail: { tab } }),
    );
  };

  if (state === "READY") {
    return (
      <button
        onClick={() => handleBadgeClick("extension")}
        title="DSA Chrome Extension is active & auto-syncing solutions (Click for details)"
        className={`flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all cursor-pointer ${
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden sm:inline">Extension</span>
        <span>Active</span>
      </button>
    );
  }

  if (state === "INSTALLED_NOT_READY") {
    return (
      <button
        onClick={() => handleBadgeClick("extension")}
        title="Extension is installed. Click to view instructions to sync LeetCode"
        className={`flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all font-bold cursor-pointer ${
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        <AlertTriangle size={compact ? 12 : 14} className="text-amber-400" />
        <span>Sync LeetCode</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => handleBadgeClick("extension")}
      title="Download and configure the DSA Tracker browser extension (Click for instructions)"
      className={`flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-all font-bold cursor-pointer ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      <Puzzle size={compact ? 12 : 14} className="text-[var(--accent-primary)]" />
      <span className="hidden sm:inline">Get</span>
      <span>Extension</span>
    </button>
  );
}
