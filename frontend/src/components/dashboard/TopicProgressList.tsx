"use client";

import Link from "next/link";
import type { Topic } from "@/lib/api";
import { Panel } from "@/components/ui/Panel";

/**
 * Where you are in the curriculum: topics you've started first (closest to
 * done at the top), then the next untouched ones in roadmap order.
 */
export function TopicProgressList({ topics }: { topics: Topic[] }) {
  const curriculum = topics.filter((t) => t.totalProblems > 0 && !/auto-synced/i.test(t.name));
  const started = curriculum
    .filter((t) => t.solvedProblems > 0 && t.solvedProblems < t.totalProblems)
    .sort((a, b) => b.progressPercentage - a.progressPercentage);
  const upNext = curriculum.filter((t) => t.solvedProblems === 0);
  const done = curriculum.filter((t) => t.solvedProblems >= t.totalProblems).length;
  const rows = [...started, ...upNext].slice(0, 7);

  return (
    <Panel
      title="Topics"
      description={`${done} of ${curriculum.length} complete`}
      action={
        <Link href="/roadmap" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Roadmap
        </Link>
      }
      flush
    >
      <ul className="border-t border-[var(--border-subtle)]">
        {rows.map((t) => (
          <li key={t.id}>
            <Link
              href={`/topics?topic=${encodeURIComponent(t.id)}`}
              className="block px-5 py-3 transition-colors hover:bg-[var(--bg-hover)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-[var(--text-primary)]">{t.name}</span>
                <span className="shrink-0 font-mono text-xs text-[var(--text-muted)] tabular">
                  {t.solvedProblems}/{t.totalProblems}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-[width] duration-700"
                  style={{ width: `${Math.max(t.progressPercentage, t.solvedProblems ? 3 : 0)}%` }}
                />
              </div>
            </Link>
          </li>
        ))}
        {rows.length === 0 && <li className="px-5 py-6 text-sm text-[var(--text-muted)]">Every topic complete.</li>}
      </ul>
    </Panel>
  );
}
