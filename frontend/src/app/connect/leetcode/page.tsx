"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { dsaApi } from "@/lib/api";
import { cacheSnapshot, type LeetCodeSnapshot } from "@/lib/extensionBridge";
import { BOOKMARKLET_MESSAGE } from "@/lib/bookmarklet";
import { BrandMark } from "@/components/ui/BrandMark";

const LEETCODE_ORIGIN = /^https:\/\/([a-z0-9-]+\.)?leetcode\.com$/;

type State =
  | { kind: "waiting" }
  | { kind: "no-opener" }
  | { kind: "importing"; count: number }
  | { kind: "done"; synced: number; total: number; username: string }
  | { kind: "error"; message: string };

/**
 * Pop-up opened by the "Sync from LeetCode" bookmarklet. Receives the
 * snapshot via postMessage from leetcode.com and imports it under the
 * signed-in tracker session.
 */
export default function ConnectLeetCodePage() {
  const [state, setState] = useState<State>({ kind: "waiting" });
  const handled = useRef(false);

  useEffect(() => {
    if (!window.opener) {
      setState({ kind: "no-opener" });
      return;
    }
    // Tell the bookmarklet we're ready (again after any login redirect).
    const announce = () => window.opener?.postMessage({ type: BOOKMARKLET_MESSAGE.ready }, "*");
    announce();
    const t = window.setInterval(announce, 1000);

    const onMessage = async (e: MessageEvent) => {
      if (!LEETCODE_ORIGIN.test(e.origin)) return;
      if (e.data?.type !== BOOKMARKLET_MESSAGE.snapshot || handled.current) return;
      handled.current = true;
      window.clearInterval(t);

      const data = e.data.data as (Partial<LeetCodeSnapshot> & { error?: string }) | undefined;
      if (!data || data.error) {
        setState({
          kind: "error",
          message:
            data?.error === "NOT_SIGNED_IN"
              ? "You're not signed in to LeetCode in this browser. Sign in there and click the bookmark again."
              : "Couldn't read your LeetCode data. Reload LeetCode and try again.",
        });
        return;
      }
      const solved = Array.isArray(data.solved) ? data.solved : [];
      const recent = Array.isArray(data.recent) ? data.recent : [];
      setState({ kind: "importing", count: solved.length });
      try {
        if (data.username && data.stats && data.calendar) {
          cacheSnapshot({ username: data.username, stats: data.stats, calendar: data.calendar });
        }
        const res = await dsaApi.importLeetcodeSnapshot({ username: data.username, solved, recent });
        setState({ kind: "done", synced: res.syncedCount, total: res.totalSolved, username: data.username ?? "" });
        window.opener?.focus();
      } catch {
        setState({ kind: "error", message: "The tracker couldn't save your data. Is the server running?" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]">
      <div className="surface w-full max-w-sm p-6">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight">Sync from LeetCode</span>
        </div>
        <div className="mt-6 space-y-2" aria-live="polite">
          {state.kind === "waiting" && (
            <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Loader2 size={15} className="animate-spin" /> Reading your LeetCode profile…
            </p>
          )}
          {state.kind === "importing" && (
            <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Loader2 size={15} className="animate-spin" /> Saving {state.count} solved problems…
            </p>
          )}
          {state.kind === "done" && (
            <>
              <p className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> Synced{state.username ? ` @${state.username}` : ""}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {state.synced > 0
                  ? `${state.synced} problems updated out of ${state.total} you've solved.`
                  : `Already up to date with all ${state.total} solved problems.`}
              </p>
              <button
                onClick={() => window.close()}
                className="mt-3 rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-sm font-medium text-[var(--on-accent)] cursor-pointer"
              >
                Close
              </button>
            </>
          )}
          {state.kind === "error" && (
            <p className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <CircleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" /> {state.message}
            </p>
          )}
          {state.kind === "no-opener" && (
            <p className="text-sm text-[var(--text-secondary)]">
              This window opens from the <strong>Sync from LeetCode</strong> bookmark. Add it from the LeetCode sync
              page, then click it while you&apos;re on leetcode.com.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
