"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Trophy, Medal, CalendarDays, Puzzle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLeetCodeSnapshot,
  getExtensionStatus,
  readCachedSnapshot,
  type ExtensionStatus,
  type LeetCodeSnapshot,
} from "@/lib/extensionBridge";
import { dsaApi } from "@/lib/api";

type Cached = NonNullable<ReturnType<typeof readCachedSnapshot>>;

const DAY = 86_400_000;
const WEEKS = 53;

/** Builds a 53×7 grid (oldest week first) from LeetCode's unix-seconds calendar. */
export function buildCalendarGrid(calendar: Record<string, number>, today = new Date()) {
  const byDay = new Map<string, number>();
  for (const [ts, count] of Object.entries(calendar)) {
    const d = new Date(Number(ts) * 1000);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + Number(count || 0));
  }
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end.getTime() - (WEEKS * 7 - 1 - (6 - end.getUTCDay())) * DAY);
  const cells: Array<{ date: string; count: number; future: boolean }> = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start.getTime() + i * DAY);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: byDay.get(key) || 0, future: d > end });
  }
  const max = Math.max(1, ...cells.map((c) => c.count));
  return { cells, max, total: cells.reduce((s, c) => s + c.count, 0) };
}

const level = (count: number, max: number) =>
  count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4));

export function LeetCodeLivePanel() {
  const [status, setStatus] = useState<ExtensionStatus | null>(null);
  const [data, setData] = useState<Cached | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(readCachedSnapshot());
    getExtensionStatus().then(setStatus);
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const snap: LeetCodeSnapshot = await fetchLeetCodeSnapshot();
      setData({ at: Date.now(), username: snap.username, stats: snap.stats, calendar: snap.calendar });
      const result = await dsaApi.importLeetcodeSnapshot(snap);
      toast.success(
        result.syncedCount > 0
          ? `Imported ${result.syncedCount} solves from LeetCode`
          : "LeetCode stats refreshed — progress already in sync",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reach LeetCode");
    } finally {
      setLoading(false);
    }
  };

  const grid = useMemo(() => (data ? buildCalendarGrid(data.calendar) : null), [data]);
  const ac = (d: string) => data?.stats.acByDifficulty.find((x) => x.difficulty === d)?.count ?? 0;
  const ready = status?.state === "READY" && !status.outdated;

  return (
    <section className="surface p-5 sm:p-6" aria-labelledby="lc-live-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">LeetCode live</p>
          <h2 id="lc-live-title" className="font-display text-xl font-bold mt-1">
            {data ? `@${data.username}` : "Your LeetCode, mirrored"}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Read straight from your signed-in LeetCode session by the extension. Nothing is stored on our servers
            except your solved list.
          </p>
        </div>
        {ready ? (
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-bold text-black [--color-white:#000] disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Reading LeetCode…" : data ? "Refresh" : "Connect"}
          </button>
        ) : (
          <Link
            href="/extension"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] px-3.5 py-2 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            <Puzzle size={14} />
            {status?.outdated
              ? "Update extension"
              : status?.state === "INSTALLED_NOT_READY"
                ? "Sign in to LeetCode"
                : "Install extension"}
          </Link>
        )}
      </header>

      {!data ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-medium)] p-8 text-center text-sm text-[var(--text-muted)]">
          {ready ? "Press Connect to pull your contest rating, rank and full submission calendar." : "Install the v2 extension and sign in to LeetCode to unlock this panel."}
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Trophy, label: "Contest rating", value: data.stats.contest ? Math.round(data.stats.contest.rating).toLocaleString() : "—", sub: data.stats.contest ? `Top ${data.stats.contest.topPercentage}%` : "No contests yet" },
              { icon: Medal, label: "Global rank", value: data.stats.ranking ? `#${data.stats.ranking.toLocaleString()}` : "—", sub: "LeetCode ranking" },
              { icon: CalendarDays, label: "Active days", value: data.stats.totalActiveDays ?? "—", sub: data.stats.streak ? `${data.stats.streak}-day max streak` : "this year" },
              { icon: Puzzle, label: "Solved", value: ac("All"), sub: `${ac("Easy")} E · ${ac("Medium")} M · ${ac("Hard")} H` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3.5">
                <div className="flex items-center gap-1.5 eyebrow !text-[10px]">
                  <s.icon size={12} /> {s.label}
                </div>
                <div className="mt-1.5 font-display text-2xl font-bold">{s.value}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{s.sub}</div>
              </div>
            ))}
          </div>

          {grid && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold">{grid.total.toLocaleString()} submissions in the last year</span>
                <span className="text-[var(--text-muted)]">
                  synced {new Date(data.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="overflow-x-auto pb-1">
                <div
                  className="grid grid-flow-col gap-[3px] w-max"
                  style={{ gridTemplateRows: "repeat(7, 11px)", gridAutoColumns: "11px" }}
                  role="img"
                  aria-label={`${grid.total} LeetCode submissions in the last year`}
                >
                  {grid.cells.map((c) => {
                    const l = level(c.count, grid.max);
                    return (
                      <div
                        key={c.date}
                        title={c.future ? undefined : `${c.count} submission${c.count === 1 ? "" : "s"} · ${c.date}`}
                        className="rounded-[3px]"
                        style={{
                          background: c.future
                            ? "transparent"
                            : l === 0
                              ? "var(--bg-tertiary)"
                              : `color-mix(in srgb, var(--accent-primary) ${20 + l * 20}%, var(--bg-tertiary))`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
