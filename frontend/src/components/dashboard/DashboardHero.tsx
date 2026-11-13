"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Flame, RotateCcw, TrendingUp, Telescope } from "lucide-react";
import type { DashboardStats } from "@/lib/api";

interface DashboardHeroProps {
  name?: string | null;
  stats: DashboardStats;
  solvedLast7d: number;
  projectedDaysToFinish: number | null;
}

const greeting = (h: number) =>
  h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

function ProgressRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative w-[104px] h-[104px] sm:w-[132px] sm:h-[132px] shrink-0" role="img" aria-label={`${clamped}% of the roadmap complete`}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#hero-ring)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped / 100) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl sm:text-3xl font-bold leading-none">{clamped}%</div>
          <div className="eyebrow !text-[9px] mt-1">roadmap</div>
        </div>
      </div>
    </div>
  );
}

export function DashboardHero({ name, stats, solvedLast7d, projectedDaysToFinish }: DashboardHeroProps) {
  const firstName = name?.split(" ")[0];
  const due = stats.revisions?.length ?? 0;
  const tiles = [
    {
      icon: Flame,
      label: "Streak",
      value: `${stats.currentStreak}d`,
      sub: `best ${stats.longestStreak}d`,
      tone: "text-orange-400",
    },
    {
      icon: CheckCircle2,
      label: "Solved",
      value: stats.solvedProblems,
      sub: `of ${stats.totalProblems}`,
      tone: "text-emerald-400",
    },
    {
      icon: RotateCcw,
      label: "Due reviews",
      value: due,
      sub: due ? "keep memory fresh" : "all caught up",
      tone: due ? "text-amber-400" : "text-[var(--text-muted)]",
    },
    {
      icon: TrendingUp,
      label: "This week",
      value: solvedLast7d,
      sub: projectedDaysToFinish ? `finish in ~${projectedDaysToFinish}d` : "start a streak",
      tone: "text-sky-400",
    },
  ];

  return (
    <section className="surface spotlight overflow-hidden p-5 sm:p-7" aria-label="Today at a glance"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--accent-primary)]/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 min-w-0 flex-1">
          <ProgressRing value={stats.progressPercentage} />
          <div className="min-w-0">
            <p className="eyebrow">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              {greeting(new Date().getHours())}
              {firstName ? <>, <span className="text-gradient">{firstName}</span></> : null}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-md">
              {due > 0
                ? `${due} review${due === 1 ? " is" : "s are"} due. Clearing them first keeps what you've learned from fading.`
                : stats.solvedProblems === 0
                  ? "Solve your first problem today and the roadmap starts lighting up."
                  : "No reviews due. A good day to push into new territory."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={due > 0 ? "/review" : "/roadmap"}
                className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--accent-gradient)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-sm)] hover:brightness-110 transition"
              >
                {due > 0 ? `Start ${due} review${due === 1 ? "" : "s"}` : "Continue roadmap"}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-medium)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Telescope size={15} /> Memory forecast
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-[460px] lg:grid-cols-2 xl:w-[520px]">
          {tiles.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/70 p-3.5"
            >
              <div className="flex items-center gap-1.5 eyebrow !text-[10px]">
                <t.icon size={12} className={t.tone} /> {t.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold">{t.value}</div>
              <div className="text-[11px] text-[var(--text-muted)] truncate">{t.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
