"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, BookOpen, Layers, CheckCircle } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : false,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          {isOnline ? (
            <CheckCircle className="h-8 w-8 text-emerald-400" aria-hidden="true" />
          ) : (
            <WifiOff className="h-8 w-8 text-amber-400" aria-hidden="true" />
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {isOnline ? "Back Online" : "You Are Offline"}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {isOnline
            ? "Your internet connection has been restored. You can return to the dashboard or continue studying."
            : "No internet connection detected. You can still practice with your offline review queue and flashcards — your progress will sync automatically when you reconnect."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/review"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-black hover:opacity-95 transition-opacity"
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>Practice Cached Reviews</span>
          </Link>

          <Link
            href="/flashcards"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Open Flashcards</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Retry connection check"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Check connection & retry</span>
          </button>
        </div>
      </div>
    </div>
  );
}

