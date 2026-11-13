"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/lib/api";

interface DashboardHeroProps {
  name?: string | null;
  stats: DashboardStats;
  solvedLast7d: number;
  projectedDaysToFinish: number | null;
}

const greeting = (h: number) =>
  h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="min-w-0 px-5 py-4 first:pl-0 sm:first:pl-5">
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)] tabular">{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{sub}</div>}
    </div>
  );
}

export function DashboardHero({ name, stats, solvedLast7d, projectedDaysToFinish }: DashboardHeroProps) {
  const firstName = name?.split(" ")[0];
  const due = stats.revisions?.length ?? 0;
  const now = new Date();

  const summary =
    due > 0
      ? `${due} review${due === 1 ? " is" : "s are"} due. Clearing them first keeps what you've learned from fading.`
      : stats.solvedProblems === 0
        ? "Pick any problem from Today to start your roadmap."
        : "Nothing due for review, so today is for new ground.";

  return (
    <section aria-label="Overview" className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] text-[var(--text-muted)]">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="page-title mt-1 text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
            {greeting(now.getHours())}
            {firstName ? <>, <em>{firstName}</em></> : null}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">{summary}</p>
        </div>
        <Link
          href={due > 0 ? "/review" : "/roadmap"}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-opacity hover:opacity-90 sm:self-auto"
        >
          {due > 0 ? `Start ${due} review${due === 1 ? "" : "s"}` : "Continue roadmap"}
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="surface grid grid-cols-2 divide-[var(--border-subtle)] sm:grid-cols-4 sm:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-[var(--border-subtle)] sm:[&>*:nth-child(n+3)]:border-t-0">
        <Stat
          label="Solved"
          value={
            <>
              {stats.solvedProblems}
              <span className="text-base font-normal text-[var(--text-muted)]"> / {stats.totalProblems}</span>
            </>
          }
          sub={`${stats.progressPercentage}% of the roadmap`}
        />
        <Stat label="Streak" value={`${stats.currentStreak}d`} sub={`Longest ${stats.longestStreak}d`} />
        <Stat label="Due for review" value={due} sub={due ? "Oldest first" : "All caught up"} />
        <Stat
          label="This week"
          value={solvedLast7d}
          sub={projectedDaysToFinish ? `On pace to finish in ~${projectedDaysToFinish}d` : "Solve one to set a pace"}
        />
      </div>
    </section>
  );
}
