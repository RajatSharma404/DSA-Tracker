"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
} from "lucide-react";
import { dsaApi } from "@/lib/api";
import { toast } from "sonner";

interface PlanTask {
  problemId: string;
  title: string;
  estimatedMinutes: number;
  reason: string;
  difficulty: string;
  type: "REVIEW" | "NEW_TOPIC" | "WEAK_AREA";
}

interface PlanDay {
  dayIndex: number;
  dayName: string;
  focusTopic: string;
  targetMinutes: number;
  tasks: PlanTask[];
}

interface StudyPlanResponse {
  days: PlanDay[];
}

export default function WeeklyPlanCard() {
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = async () => {
    try {
      const res = await dsaApi.getStudyPlan();
      if (res?.plan?.days) {
        setPlan(res.plan);
      }
    } catch {
      // Degrade gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await dsaApi.generateStudyPlan(10);
      if (res?.plan?.days) {
        setPlan(res.plan);
        toast.success(
          res.isFallback
            ? "Weekly plan generated via deterministic bin-packing!"
            : "AI Weekly plan successfully created!"
        );
      }
    } catch {
      toast.error("Failed to generate weekly plan");
    } finally {
      setGenerating(false);
    }
  };

  // Determine current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayIndex = new Date().getDay(); // 0-6
  // Map JS Sunday(0)->7, Monday(1)->1, ..., Saturday(6)->6
  const mappedDay = currentDayIndex === 0 ? 7 : currentDayIndex;

  const todayPlan = plan?.days?.find((d) => d.dayIndex === mappedDay) || plan?.days?.[0];

  const getDifficultyBadge = (d: string) => {
    switch (d?.toUpperCase()) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getTypeBadge = (t: string) => {
    switch (t) {
      case "REVIEW":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "WEAK_AREA":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl border border-white/5 bg-[var(--bg-secondary)] animate-pulse h-48" />
    );
  }

  return (
    <div className="p-6 rounded-3xl border border-white/5 bg-[var(--bg-secondary)] relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                AI Weekly Study Plan
              </h2>
              {todayPlan && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  {todayPlan.dayName} Focus: {todayPlan.focusTopic}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Personalized spaced-repetition and weak-topic queue
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : plan ? "Regenerate Plan" : "Generate Plan"}
        </button>
      </div>

      {/* Plan Content */}
      {!plan || !todayPlan ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3">
          <Sparkles size={28} className="mx-auto text-indigo-400 opacity-60" />
          <p className="text-sm text-gray-300 font-medium">
            No active weekly plan found.
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Generate an AI-optimized schedule balancing your upcoming reviews and weakest mastery topics.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Create My 7-Day Plan
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Today&apos;s Recommended Practice</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock size={12} className="text-gray-500" />
              Target: ~{todayPlan.targetMinutes} mins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {todayPlan.tasks.map((task) => (
              <div
                key={task.problemId}
                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white truncate">
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getDifficultyBadge(
                        task.difficulty
                      )}`}
                    >
                      {task.difficulty}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getTypeBadge(
                        task.type
                      )}`}
                    >
                      {task.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {task.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-[11px] font-mono text-gray-500">
                    ~{task.estimatedMinutes}m
                  </span>
                  <Link
                    href={`/problems/${task.problemId}`}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 transition-all"
                    title="Solve Problem"
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

