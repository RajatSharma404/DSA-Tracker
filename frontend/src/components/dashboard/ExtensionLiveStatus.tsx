"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, CircleDashed, DownloadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getExtensionStatus, canSnapshot, type ExtensionStatus } from "@/lib/extensionBridge";
import { dsaApi } from "@/lib/api";

const ago = (ts: number) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

/** Live checklist of the extension pipeline + one-click full-history import. */
export function ExtensionLiveStatus() {
  const [status, setStatus] = useState<ExtensionStatus | null>(null);
  const [importing, setImporting] = useState(false);

  const refresh = useCallback(() => getExtensionStatus().then(setStatus), []);
  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 10_000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const importAll = async () => {
    setImporting(true);
    try {
      const r = await dsaApi.smartSyncLeetcode();
      toast.success(
        r.syncedCount > 0 ? `Imported ${r.syncedCount} problems from LeetCode` : "Everything is already in sync",
      );
      refresh();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err instanceof Error ? err.message : "Import failed");
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const installed = status && status.state !== "NOT_INSTALLED";
  const steps: Array<{ ok: boolean | null; label: string; detail: string }> = [
    {
      ok: status ? Boolean(installed && !status.outdated) : null,
      label: status?.kind === "userscript" ? "Userscript installed" : "Extension installed",
      detail: !installed
        ? "Follow the install steps below"
        : status?.outdated
          ? `v${status.version ?? "1.x"} found. Reload the extension to get v2`
          : `v${status?.version}`,
    },
    {
      ok: status ? status.signedIn : null,
      label: "Signed in to LeetCode",
      detail: status?.signedIn ? "Session detected in this browser" : "Sign in at leetcode.com in this browser",
    },
    {
      ok: status ? status.paired : null,
      label: "Paired with your account",
      detail: status?.paired
        ? status.pendingSyncs
          ? `${status.pendingSyncs} sync(s) queued, retrying automatically`
          : status.lastSync
            ? `Last sync: ${status.lastSync.title}, ${ago(status.lastSync.at)}`
            : "Accepted submissions on LeetCode will sync automatically"
        : "Happens automatically while you're signed in here",
    },
  ];

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="ext-live-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="ext-live-title" className="text-[15px] font-semibold tracking-tight">Status</h2>
        </div>
        <button
          onClick={importAll}
          disabled={importing || !status || !canSnapshot(status)}
          className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--accent-gradient)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title={status && !canSnapshot(status) ? (status.kind === "userscript" ? "Use the Sync bookmark to import history" : "Install the extension and sign in to LeetCode first") : undefined}
        >
          {importing ? <Loader2 size={15} className="animate-spin" /> : <DownloadCloud size={15} />}
          {importing ? "Importing full history…" : "Import full LeetCode history"}
        </button>
      </div>
      <ol className="mt-4 grid gap-2.5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.label} className="flex gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3.5">
            {s.ok === null ? (
              <CircleDashed size={18} className="shrink-0 text-[var(--text-muted)] animate-spin [animation-duration:3s]" />
            ) : s.ok ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            ) : (
              <CircleAlert size={18} className="shrink-0 text-amber-400" />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                <span className="text-[var(--text-muted)] mr-1">{i + 1}.</span>
                {s.label}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
