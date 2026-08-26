"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { offlineQueue } from "@/lib/offlineQueue";
import { soundEffects } from "@/lib/soundEffects";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setPendingCount(offlineQueue.getPendingCount());

      const handleOnline = () => {
        setIsOnline(true);
        soundEffects.playSuccess();
      };

      const handleOffline = () => {
        setIsOnline(false);
        soundEffects.playError();
      };

      const handleQueueChange = (e: Event) => {
        const custom = e as CustomEvent<{ count: number }>;
        setPendingCount(custom.detail?.count ?? 0);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("dsa-offline-queue-changed", handleQueueChange);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("dsa-offline-queue-changed", handleQueueChange);
      };
    }
  }, []);

  const handleManualSync = async () => {
    soundEffects.playClick();
    setIsReconnecting(true);
    await offlineQueue.replayQueue();
    setIsReconnecting(false);
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-xs shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center gap-2">
        <WifiOff size={14} className="text-amber-400 animate-pulse" />
        <span className="font-bold">
          {!isOnline ? "Offline Mode" : "Syncing"}
        </span>
        <span className="text-[var(--text-muted)] text-[10px]">
          &bull; {pendingCount} change{pendingCount === 1 ? "" : "s"} cached locally
        </span>
      </div>

      <button
        onClick={handleManualSync}
        disabled={isReconnecting}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw
          size={11}
          className={isReconnecting ? "animate-spin" : ""}
        />
        <span>{isReconnecting ? "Syncing..." : "Sync Now"}</span>
      </button>
    </div>
  );
}
