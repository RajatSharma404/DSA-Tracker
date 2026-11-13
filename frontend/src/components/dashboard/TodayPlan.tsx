"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, RotateCcw, Target, CalendarDays, Check } from "lucide-react";
import { dsaApi, type DashboardStats } from "@/lib/api";
import { Panel } from "@/components/ui/Panel";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | string;

interface DailyProblem {
  source: "REVISION" | "WEAKNESS";
  reason: string;
  message?: string;
  problem?: { id: string; title: string; difficulty: Difficulty; topicName: string };
  plan?: { items?: Array<{ id: string; title: string; source: string; difficulty?: Difficulty; topicName?: string }> };
}

interface DailyLc {
  link: string;
  question: { title: string; difficulty: string; topicTags?: Array<{ name: string }> };
}

type Item = {
  key: string;
  kind: "review" | "focus" | "plan" | "daily";
  title: string;
  meta: string;
  difficulty?: Difficulty;
  href: string;
  external?: boolean;
};

const KIND = {
  review: { icon: RotateCcw, label: "Review" },
  focus: { icon: Target, label: "Today's focus" },
  plan: { icon: Target, label: "Practice" },
  daily: { icon: CalendarDays, label: "LeetCode daily" },
} as const;

export function DifficultyTag({ value }: { value?: Difficulty }) {
  if (!value) return null;
  const v = String(value).toUpperCase();
  const tone =
    v === "EASY" ? "text-emerald-500" : v === "HARD" ? "text-rose-500" : "text-amber-500";
  return <span className={`text-xs font-medium ${tone}`}>{v[0] + v.slice(1).toLowerCase()}</span>;
}

/**
 * One ordered answer to "what should I do now?": due reviews first (they
 * protect what you already know), then today's focus problem, then the rest
 * of the plan, then LeetCode's daily.
 */
export function TodayPlan({ revisions }: { revisions: DashboardStats["revisions"] }) {
  const [daily, setDaily] = useState<DailyProblem | null>(null);
  const [lc, setLc] = useState<DailyLc | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([dsaApi.getDailyProblem(), dsaApi.getLeetcodeDailyChallenge()]).then(([d, l]) => {
      if (d.status === "fulfilled") setDaily(d.value);
      if (l.status === "fulfilled") setLc(l.value);
      setLoaded(true);
    });
  }, []);

  const items = useMemo<Item[]>(() => {
    const seen = new Set<string>();
    const out: Item[] = [];
    const push = (i: Item, id?: string) => {
      if (id && seen.has(id)) return;
      if (id) seen.add(id);
      out.push(i);
    };
    for (const r of revisions ?? []) {
      push(
        { key: `r-${r.id}`, kind: "review", title: r.title, meta: `${r.topicName} · solved ${r.daysSince}d ago`, href: `/problems/${r.id}` },
        r.id,
      );
    }
    if (daily?.problem) {
      push(
        {
          key: `f-${daily.problem.id}`,
          kind: "focus",
          title: daily.problem.title,
          meta: daily.problem.topicName,
          difficulty: daily.problem.difficulty,
          href: `/problems/${daily.problem.id}`,
        },
        daily.problem.id,
      );
    }
    for (const p of daily?.plan?.items ?? []) {
      push(
        { key: `p-${p.id}`, kind: "plan", title: p.title, meta: p.topicName || "From today's plan", difficulty: p.difficulty, href: `/problems/${p.id}` },
        p.id,
      );
    }
    if (lc?.question) {
      push({
        key: "lc-daily",
        kind: "daily",
        title: lc.question.title,
        meta: lc.question.topicTags?.slice(0, 2).map((t) => t.name).join(", ") || "Problem of the day",
        difficulty: lc.question.difficulty,
        href: `https://leetcode.com${lc.link}`,
        external: true,
      });
    }
    return out.slice(0, 7);
  }, [revisions, daily, lc]);

  const dueCount = revisions?.length ?? 0;

  return (
    <Panel
      title="Today"
      description={
        dueCount > 0
          ? `${dueCount} review${dueCount === 1 ? "" : "s"} due, then new practice.`
          : "Nothing due for review. Here's what to practise."
      }
      action={
        <Link href="/review" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Review queue
        </Link>
      }
      flush
    >
      {!loaded && items.length === 0 ? (
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-8 text-sm text-[var(--text-muted)]">
          <Check size={16} className="text-emerald-500" /> You&apos;re all caught up for today.
        </div>
      ) : (
        <ol className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
          {items.map((item, idx) => {
            const K = KIND[item.kind];
            const body = (
              <>
                <span className="w-5 shrink-0 text-right font-mono text-xs text-[var(--text-muted)] tabular">{idx + 1}</span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border-subtle)] ${
                    item.kind === "review" ? "text-amber-500" : item.kind === "daily" ? "text-[var(--text-secondary)]" : "text-[var(--accent-primary)]"
                  }`}
                  aria-hidden
                >
                  <K.icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                    <DifficultyTag value={item.difficulty} />
                  </span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">
                    {K.label} · {item.meta}
                  </span>
                </span>
                {item.external ? (
                  <ArrowUpRight size={16} className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                ) : (
                  <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform group-hover:translate-x-0.5" />
                )}
              </>
            );
            const cls =
              "group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg-hover)] focus-visible:bg-[var(--bg-hover)] outline-none";
            return (
              <li key={item.key}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {body}
                  </a>
                ) : (
                  <Link href={item.href} className={cls}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
