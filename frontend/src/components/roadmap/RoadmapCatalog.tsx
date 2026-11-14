"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { dsaApi, type RoadmapKind, type RoadmapSummary } from "@/lib/api";
import { getFollowedRoadmap, FOLLOW_EVENT } from "@/lib/followedRoadmap";

const FILTERS: Array<{ id: "all" | RoadmapKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "community", label: "Community" },
  { id: "official", label: "LeetCode official" },
  { id: "company", label: "Company" },
];

export function DifficultyBar({ e, m, h }: { e: number; m: number; h: number }) {
  const total = Math.max(1, e + m + h);
  return (
    <div className="flex h-1 gap-px overflow-hidden rounded-full" aria-label={`${e} easy, ${m} medium, ${h} hard`}>
      <span className="bg-emerald-500/70" style={{ width: `${(e / total) * 100}%` }} />
      <span className="bg-amber-500/70" style={{ width: `${(m / total) * 100}%` }} />
      <span className="bg-rose-500/70" style={{ width: `${(h / total) * 100}%` }} />
    </div>
  );
}

export function RoadmapCatalog({ onOpen }: { onOpen: (slug: string) => void }) {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<string | null>(null);

  useEffect(() => {
    dsaApi
      .getRoadmaps()
      .then(setRoadmaps)
      .catch(() => setError(true));
    setFollowed(getFollowedRoadmap());
    const onFollow = () => setFollowed(getFollowedRoadmap());
    window.addEventListener(FOLLOW_EVENT, onFollow);
    return () => window.removeEventListener(FOLLOW_EVENT, onFollow);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (roadmaps ?? [])
      .filter((r) => filter === "all" || r.kind === filter)
      .filter((r) => !q || `${r.name} ${r.author} ${r.description}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.slug === followed) - Number(a.slug === followed));
  }, [roadmaps, filter, query, followed]);

  if (error) return <div className="surface p-6 text-sm text-[var(--text-muted)]">Couldn&apos;t load roadmaps.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="flex gap-1 rounded-lg bg-[var(--bg-tertiary)] p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1 text-[13px] transition-colors cursor-pointer ${
                filter === f.id
                  ? "bg-[var(--bg-card)] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex w-full items-center gap-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-1.5 sm:w-64">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roadmaps"
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>
      </div>

      {!roadmaps ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface h-44 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => {
            const pct = Math.round((r.solved / Math.max(1, r.problemCount)) * 100);
            return (
              <button
                key={r.slug}
                onClick={() => onOpen(r.slug)}
                className="surface surface-interactive flex flex-col p-4 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{r.name}</div>
                    <div className="truncate text-xs text-[var(--text-muted)]">
                      {r.author} · ~{r.estimatedWeeks} weeks
                    </div>
                  </div>
                  {r.slug === followed && (
                    <span className="shrink-0 rounded-md bg-[var(--accent-primary)]/12 px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent-primary)]">
                      Following
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{r.description}</p>
                <div className="mt-auto space-y-2 pt-4">
                  <DifficultyBar e={r.byDifficulty.EASY} m={r.byDifficulty.MEDIUM} h={r.byDifficulty.HARD} />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{r.problemCount} problems</span>
                    <span className={`tabular ${r.solved ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                      {r.solved ? `${r.solved} solved · ${pct}%` : "Not started"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {visible.length === 0 && <p className="text-sm text-[var(--text-muted)]">No roadmaps match.</p>}
        </div>
      )}
    </div>
  );
}
