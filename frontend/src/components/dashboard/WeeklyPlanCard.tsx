"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import { dsaApi } from "@/lib/api";
import { Panel } from "@/components/ui/Panel";
import { DifficultyTag } from "@/components/dashboard/TodayPlan";

interface PlanTask {
  problemId: string;
  title: string;
  estimatedMinutes: number;
  reason: string;
  difficulty: string;
  type: "REVIEW" | "NEW_TOPIC" | "WEAK_AREA";
}

interface PlanDay {
  dayIndex: number; // 1 = Monday … 7 = Sunday
  dayName: string;
  focusTopic: string;
  targetMinutes: number;
  tasks: PlanTask[];
}

interface StudyPlanResponse {
  days: PlanDay[];
}

const TYPE_LABEL: Record<PlanTask["type"], string> = {
  REVIEW: "Review",
  NEW_TOPIC: "New topic",
  WEAK_AREA: "Weak area",
};

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
};

export default function WeeklyPlanCard() {
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<number>(todayIndex());

  useEffect(() => {
    dsaApi
      .getStudyPlan()
      .then((res) => res?.plan?.days && setPlan(res.plan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await dsaApi.generateStudyPlan(10);
      if (res?.plan?.days) {
        setPlan(res.plan);
        setSelected(todayIndex());
        toast.success("Your week is planned");
      }
    } catch {
      toast.error("Couldn't build a plan right now");
    } finally {
      setGenerating(false);
    }
  };

  const days = [...(plan?.days ?? [])].sort((a, b) => a.dayIndex - b.dayIndex);
  const day = days.find((d) => d.dayIndex === selected) ?? days[0];
  const today = todayIndex();
  const weekMinutes = days.reduce((s, d) => s + d.targetMinutes, 0);

  if (loading) return <div className="surface h-56 shimmer" />;

  return (
    <Panel
      title="This week"
      description={
        plan
          ? `About ${Math.round(weekMinutes / 60)}h of practice, balanced across reviews and weak areas.`
          : "A day-by-day plan built from your reviews and weakest topics."
      }
      action={
        plan ? (
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={generating ? "animate-spin" : ""} />
            Rebuild
          </button>
        ) : null
      }
      flush
    >
      {!plan || !day ? (
        <div className="flex flex-col items-start gap-3 border-t border-[var(--border-subtle)] px-5 py-6">
          <CalendarRange size={18} className="text-[var(--text-muted)]" />
          <p className="max-w-sm text-sm text-[var(--text-secondary)]">
            Plan seven days at roughly ten hours a week. You can rebuild it any time.
          </p>
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-sm font-medium text-[var(--on-accent)] hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {generating ? "Planning…" : "Plan my week"}
          </button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Days of the week" className="grid grid-cols-7 border-y border-[var(--border-subtle)]">
            {days.map((d) => {
              const active = d.dayIndex === day.dayIndex;
              const past = d.dayIndex < today;
              return (
                <button
                  key={d.dayIndex}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(d.dayIndex)}
                  className={`relative px-1 py-2.5 text-center transition-colors cursor-pointer ${
                    active ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)]"
                  } ${past ? "opacity-50" : ""}`}
                >
                  <div className={`text-xs ${d.dayIndex === today ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {d.dayName.slice(0, 3)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--text-muted)] tabular">{d.targetMinutes}m</div>
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--accent-primary)]" />}
                </button>
              );
            })}
          </div>
          <div className="px-5 pt-3 pb-1 text-xs text-[var(--text-muted)]">
            {day.dayIndex === today ? "Today" : day.dayName} · focus on{" "}
            <span className="text-[var(--text-secondary)]">{day.focusTopic}</span>
          </div>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {day.tasks.map((t) => (
              <li key={t.problemId}>
                <Link
                  href={`/problems/${t.problemId}`}
                  className="group flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--text-primary)]">{t.title}</span>
                      <DifficultyTag value={t.difficulty} />
                    </span>
                    <span className="block truncate text-xs text-[var(--text-muted)]">
                      {TYPE_LABEL[t.type] ?? t.type} · ~{t.estimatedMinutes} min
                    </span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                </Link>
              </li>
            ))}
            {day.tasks.length === 0 && <li className="px-5 py-4 text-sm text-[var(--text-muted)]">Rest day.</li>}
          </ul>
        </>
      )}
    </Panel>
  );
}
