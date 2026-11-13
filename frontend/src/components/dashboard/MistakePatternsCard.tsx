"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Microscope } from "lucide-react";
import { dsaApi } from "@/lib/api";
import { Panel } from "@/components/ui/Panel";

interface MistakePattern {
  pattern: string;
  frequency: "common" | "occasional";
  affectedTopics: string[];
  exampleProblemIds: string[];
  recommendation: string;
}

const MIN_SUBMISSIONS = 5;

/** Recurring mistakes across your non-accepted submissions. */
export default function MistakePatternsCard() {
  const [patterns, setPatterns] = useState<MistakePattern[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await dsaApi.getMistakePatterns();
      setPatterns(res?.patterns ?? []);
      setMessage(res?.message ?? null);
    } catch {
      setMessage("Couldn't analyse your submissions right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="surface h-56 shimmer" />;

  return (
    <Panel
      title="Mistake patterns"
      description="Recurring slips across your wrong answers, grouped so you can fix the habit once."
      action={
        patterns.length > 0 ? (
          <button
            onClick={() => {
              setRefreshing(true);
              load();
            }}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        ) : null
      }
      flush
    >
      {patterns.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border-t border-[var(--border-subtle)] px-5 py-6">
          <Microscope size={18} className="text-[var(--text-muted)]" />
          <p className="max-w-sm text-sm text-[var(--text-secondary)]">
            {message?.toLowerCase().includes("need at least")
              ? `Patterns appear after ${MIN_SUBMISSIONS} or more submissions. Every wrong answer you submit here is analysed for repeat mistakes, like off-by-one bounds or missed empty inputs.`
              : message || "No recurring mistakes found. Nice."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
          {patterns.slice(0, 4).map((p) => (
            <li key={p.pattern} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">{p.pattern}</span>
                <span
                  className={`shrink-0 text-xs ${p.frequency === "common" ? "text-amber-500" : "text-[var(--text-muted)]"}`}
                >
                  {p.frequency === "common" ? "Frequent" : "Occasional"}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{p.recommendation}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                {p.affectedTopics.slice(0, 3).join(" · ")}
                {p.exampleProblemIds.slice(0, 3).map((id, i) => (
                  <Link key={id} href={`/problems/${id}`} className="underline-offset-2 hover:text-[var(--text-primary)] hover:underline">
                    Example {i + 1}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
