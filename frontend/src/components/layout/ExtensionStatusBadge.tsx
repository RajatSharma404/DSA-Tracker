"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExtensionStatus, type ExtensionStatus } from "@/lib/extensionBridge";

interface ExtensionStatusBadgeProps {
  compact?: boolean;
}

const ago = (ts: number) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

/** One quiet line telling you whether LeetCode sync is working. */
export function ExtensionStatusBadge({ compact = false }: ExtensionStatusBadgeProps) {
  const [s, setS] = useState<ExtensionStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () => getExtensionStatus().then((v) => alive && setS(v));
    refresh();
    const t = window.setInterval(refresh, 30000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  if (!s) return null;

  const state =
    s.state === "NOT_INSTALLED"
      ? { dot: "bg-[var(--text-muted)]", label: "Connect LeetCode", hint: "Install the extension to sync solves automatically" }
      : s.outdated
        ? { dot: "bg-amber-500", label: "Update extension", hint: "Reload the extension to get sync v2" }
        : !s.signedIn
          ? { dot: "bg-amber-500", label: "Sign in to LeetCode", hint: "The extension can't see a LeetCode session" }
          : !s.paired
            ? { dot: "bg-amber-500", label: "Pairing…", hint: "Pairs automatically while you're signed in here" }
            : s.pendingSyncs > 0
              ? { dot: "bg-amber-500", label: `${s.pendingSyncs} waiting to sync`, hint: "Will retry automatically" }
              : {
                  dot: "bg-emerald-500",
                  label: s.lastSync ? `Synced ${ago(s.lastSync.at)}` : "LeetCode connected",
                  hint: s.lastSync ? `Last: ${s.lastSync.title}` : "Accepted submissions sync automatically",
                };

  return (
    <Link
      href="/extension"
      title={state.hint}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors ${
        compact ? "" : "border border-[var(--border-subtle)]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} aria-hidden />
      {state.label}
    </Link>
  );
}
