"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dsaApi, type RoadmapDetail as Detail, type RoadmapProblem } from "@/lib/api";
import { getFollowedRoadmap, setFollowedRoadmap } from "@/lib/followedRoadmap";
import { DifficultyTag } from "@/components/dashboard/TodayPlan";

export function RoadmapDetail({ slug, onBack }: { slug: string; onBack: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [opening, setOpening] = useState<string | null>(null);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    setData(null);
    dsaApi
      .getRoadmap(slug)
      .then(setData)
      .catch(() => setError(true));
    setFollowed(getFollowedRoadmap() === slug);
  }, [slug]);

  const total = data?.problemCount ?? 0;
  const solved = data?.solved ?? 0;
  const nextUp = useMemo(() => data?.sections.flatMap((s) => s.problems).find((p) => !p.solved) ?? null, [data]);

  const openProblem = async (p: RoadmapProblem) => {
    if (p.problemId) {
      router.push(`/problems/${p.problemId}`);
      return;
    }
    setOpening(p.slug);
    try {
      const { problemId } = await dsaApi.openRoadmapProblem(p.slug);
      router.push(`/problems/${problemId}`);
    } catch {
      toast.error("Couldn't open that problem");
      setOpening(null);
    }
  };

  const toggleFollow = () => {
    const next = !followed;
    setFollowedRoadmap(next ? slug : null);
    setFollowed(next);
    toast.success(next ? `Following ${data?.name}. Its next problem shows up in Today.` : "Stopped following");
  };

  if (error) return <div className="surface p-6 text-sm text-[var(--text-muted)]">Couldn&apos;t load this roadmap.</div>;
  if (!data) return <div className="surface h-96 shimmer" />;

  const pct = Math.round((solved / Math.max(1, total)) * 100);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
        <ArrowLeft size={14} /> All roadmaps
      </button>

      <section className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{data.name}</h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              {data.author} ·{" "}
              <a href={data.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-[var(--text-primary)] hover:underline">
                original list
              </a>{" "}
              · ~{data.estimatedWeeks} weeks
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{data.description}</p>
          </div>
          <div className="flex gap-2">
            {nextUp && (
              <button
                onClick={() => openProblem(nextUp)}
                className="rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-sm font-medium text-[var(--on-accent)] hover:opacity-90 cursor-pointer"
              >
                {solved ? "Continue" : "Start"}: {nextUp.title}
              </button>
            )}
            <button
              onClick={toggleFollow}
              aria-pressed={followed}
              className={`rounded-lg border px-3.5 py-2 text-sm cursor-pointer ${
                followed
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                  : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {followed ? "Following" : "Follow"}
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-tertiary)]">
            <div className="h-full rounded-full bg-[var(--accent-primary)] transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-[var(--text-secondary)] tabular">
            {solved} / {total} · {pct}%
          </span>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{data.sections.length} sections</span>
        <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} className="accent-[var(--accent-primary)]" />
          Hide solved
        </label>
      </div>

      <div className="space-y-3">
        {data.sections.map((section) => {
          const rows = hideSolved ? section.problems.filter((p) => !p.solved) : section.problems;
          const done = section.problems.filter((p) => p.solved).length;
          const isCollapsed = collapsed.has(section.name);
          if (hideSolved && rows.length === 0) return null;
          return (
            <section key={section.name} className="surface overflow-hidden">
              <button
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(section.name)) next.delete(section.name);
                    else next.add(section.name);
                    return next;
                  })
                }
                aria-expanded={!isCollapsed}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                <ChevronDown size={15} className={`text-[var(--text-muted)] transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{section.name}</span>
                <span className="text-xs text-[var(--text-muted)] tabular">
                  {done}/{section.problems.length}
                </span>
              </button>
              {!isCollapsed && (
                <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
                  {rows.map((p) => (
                    <li key={p.slug} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--bg-hover)]">
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                          p.solved ? "border-emerald-500 bg-emerald-500 text-white [--color-white:#fff]" : "border-[var(--border-strong)]"
                        }`}
                        aria-label={p.solved ? "Solved" : "Not solved"}
                      >
                        {p.solved && <Check size={10} strokeWidth={3} />}
                      </span>
                      <button
                        onClick={() => openProblem(p)}
                        className={`min-w-0 flex-1 truncate text-left text-sm cursor-pointer hover:underline underline-offset-2 ${
                          p.solved ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {p.title}
                      </button>
                      {opening === p.slug && <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />}
                      <DifficultyTag value={p.difficulty} />
                      <a
                        href={`https://leetcode.com/problems/${p.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on LeetCode"
                        className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-muted)] opacity-0 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] group-hover:opacity-100 focus:opacity-100"
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
