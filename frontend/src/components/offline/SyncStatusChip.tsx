"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { syncManager, SyncState } from "@/lib/offline/syncManager";

export function SyncStatusChip() {
  const [status, setStatus] = useState<SyncState>("synced");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state, count) => {
      setStatus(state);
      setPendingCount(count);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (status === "offline" || isManualSyncing) return;
    setIsManualSyncing(true);
    try {
      await syncManager.flushOutbox();
    } finally {
      setIsManualSyncing(false);
    }
  };

  if (status === "offline") {
    return (
      <div
        role="status"
        aria-label="Offline status"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 select-none"
      >
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Offline</span>
        {pendingCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-mono">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (status === "syncing" || isManualSyncing) {
    return (
      <div
        role="status"
        aria-label="Syncing offline reviews"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] select-none"
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleManualSync}
        role="status"
        aria-label={`${pendingCount} pending reviews. Click to sync now.`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer select-none"
      >
        <Clock className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
        <span>{pendingCount} pending</span>
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-label="All reviews synced"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none"
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Synced</span>
    </div>
  );
}

