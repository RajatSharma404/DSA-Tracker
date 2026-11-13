"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider({ children }: { children?: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
      window.location.reload();
    }
  }, [waitingWorker]);

  useEffect(() => {
    // Register Service Worker in production only
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Check if there is an update already waiting
            if (reg.waiting) {
              setWaitingWorker(reg.waiting);
              setShowUpdatePrompt(true);
            }

            // Detect new service worker installing
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (!newWorker) return;

              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New update is ready and waiting for user reload confirmation
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            });
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      });
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleTriggerInstall = async () => {
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
        }
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("dsa-install-pwa", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("dsa-install-pwa", handleTriggerInstall);
    };
  }, [deferredPrompt]);

  return (
    <>
      {children}

      {/* Non-intrusive Update Available Prompt */}
      {showUpdatePrompt && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Application update available"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 max-w-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)]">
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Update Available
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              A newer version of DSA Tracker is ready.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={applyUpdate}
              className="rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-bold text-black hover:opacity-95 transition-opacity cursor-pointer"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setShowUpdatePrompt(false)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Dismiss update notification"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
