"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Zap,
  Calendar,
  Brain,
  Loader2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Activity,
  Bookmark,
  Check,
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface ReviewItem {
  progressId: string;
  problemId: string;
  title: string;
  difficulty: string;
  topicName: string;
  link: string | null;
  nextReviewDate: string;
  interval: number;
  easinessFactor?: number;
  daysOverdue?: number;
}

interface ReviewData {
  due: ReviewItem[];
  upcoming: ReviewItem[];
  stats: { totalDue: number; totalUpcoming: number };
}

const QUALITY_OPTIONS = [
  {
    q: 1,
    key: "1",
    label: "Forgot",
    next: "Resets to 1d",
    color:
      "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40",
  },
  {
    q: 3,
    key: "2",
    label: "Hard",
    next: "Short step",
    color:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
  },
  {
    q: 4,
    key: "3",
    label: "Good",
    next: "Expands 2.5x",
    color:
      "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40",
  },
  {
    q: 5,
    key: "4",
    label: "Easy",
    next: "Max leap",
    color:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40",
  },
];

const getDiffBadgeClass = (d: string) => {
  const upper = (d || "MEDIUM").toUpperCase();
  if (upper === "EASY")
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (upper === "HARD")
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
};

export default function ReviewQueuePage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"due" | "upcoming" | "all">("due");
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("review_queue_viewed");
    loadReviewQueue();
  }, []);

  async function loadReviewQueue() {
    setLoading(true);
    try {
      const res = await dsaApi.getReviewQueue();
      setData(res);
    } catch (err) {
      console.error("Failed to load review queue", err);
      toast.error("Failed to refresh review queue");
    } finally {
      setLoading(false);
    }
  }

  const dueProblems = useMemo(() => {
    return (data?.due || []).filter(
      (item) => !completedIds.has(item.problemId),
    );
  }, [data?.due, completedIds]);

  const upcomingProblems = useMemo(() => {
    return data?.upcoming || [];
  }, [data?.upcoming]);

  const firstDueProblem = dueProblems[0] || null;

  // Keyboard shortcut listener [1-4]
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!firstDueProblem || reviewingId) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      const keyMap: Record<string, number> = {
        "1": 1,
        "2": 3,
        "3": 4,
        "4": 5,
      };
      const quality = keyMap[event.key];
      if (!quality) return;

      event.preventDefault();
      handleReview(firstDueProblem.problemId, quality, firstDueProblem.title);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [firstDueProblem, reviewingId]);

  const handleReview = async (
    problemId: string,
    quality: number,
    title?: string,
  ) => {
    soundEffects.playSuccess();
    setReviewingId(problemId);
    try {
      const res = await dsaApi.completeReview(problemId, quality);
      setCompletedIds((prev) => new Set([...prev, problemId]));
      const qualityLabel =
        QUALITY_OPTIONS.find((q) => q.q === quality)?.label || "Reviewed";
      const nextDays = res.interval ?? 1;
      setReviewNotice(
        `Rated "${title || "Problem"}" as ${qualityLabel} (Next in: ${
          res.nextReviewIn || `${nextDays}d`
        })`,
      );
      toast.success(
        `SM-2 Updated: Next review ${res.nextReviewIn || `in ${nextDays} days`}`,
      );

      trackEvent("review_quality_selected", {
        problemId,
        quality,
        nextIntervalDays: nextDays,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to record review score");
    } finally {
      setReviewingId(null);
    }
  };

  const totalDueCount = dueProblems.length;
  const reviewedTodayCount = completedIds.size;
  const totalUpcomingCount = upcomingProblems.length;
  const retentionHealthPct =
    totalDueCount === 0
      ? 98
      : Math.max(65, Math.round(98 - totalDueCount * 4));

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse w-full min-w-0">
        <div className="h-10 w-72 rounded-2xl bg-[var(--bg-secondary)]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-[var(--bg-secondary)]"
            />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-[var(--bg-secondary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Brain size={13} />
            <span>SuperMemo-2 (SM-2) Neural Scheduler</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Spaced Repetition Queue
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Combat the Ebbinghaus forgetting curve. Review algorithmic invariants precisely when your memory decays.
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            loadReviewQueue();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-2xl text-xs font-bold text-[var(--text-secondary)] transition-all border border-[var(--border-subtle)] cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Hero SM-2 Leitner Hub */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Retention Stats (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-inner">
                <Zap size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                  Algorithmic Retention Engine
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Adaptive decay modeling based on recall difficulty.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Due Now
                </span>
                <div className="text-2xl font-black text-rose-400 mt-1 font-display">
                  {totalDueCount}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Reviewed
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-display">
                  {reviewedTodayCount}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Retention
                </span>
                <div className="text-2xl font-black text-cyan-400 mt-1 font-display">
                  {retentionHealthPct}%
                </div>
              </div>
            </div>

            {reviewNotice && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                <span className="truncate">{reviewNotice}</span>
              </div>
            )}
          </div>

          {/* Right: Leitner 5-Stage Interval Curve (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 sm:p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-display">
                <Layers size={14} className="text-cyan-400" /> Leitner Memory Stages
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                SuperMemo-2 Intervals
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 font-mono">
              {[
                {
                  stage: "Stage 1",
                  time: "1-2 Days",
                  color: "bg-rose-500",
                  label: "Learning",
                },
                {
                  stage: "Stage 2",
                  time: "3-6 Days",
                  color: "bg-orange-500",
                  label: "Reinforcing",
                },
                {
                  stage: "Stage 3",
                  time: "7-14 Days",
                  color: "bg-amber-500",
                  label: "Consolidating",
                },
                {
                  stage: "Stage 4",
                  time: "15-30 Days",
                  color: "bg-blue-500",
                  label: "Long Term",
                },
                {
                  stage: "Stage 5",
                  time: "30d+ Mastered",
                  color: "bg-emerald-500",
                  label: "Permanent",
                },
              ].map((box, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-1"
                >
                  <div
                    className={`w-2 h-2 rounded-full mx-auto ${box.color}`}
                  />
                  <div className="text-[10px] font-bold text-[var(--text-primary)] truncate">
                    {box.stage}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)]">
                    {box.time}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] pt-1 leading-tight">
              ⚡ <strong>Pro Tip:</strong> Press keys{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">
                1
              </kbd>
              ,{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">
                2
              </kbd>
              ,{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">
                3
              </kbd>
              ,{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">
                4
              </kbd>{" "}
              to rapidly grade the top due problem.
            </p>
          </div>
        </div>
      </div>

      {/* Deck Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab("due");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 font-mono ${
            activeTab === "due"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-inner"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <AlertTriangle size={14} className="text-rose-400" />
          <span>Due for Review ({totalDueCount})</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setActiveTab("upcoming");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 font-mono ${
            activeTab === "upcoming"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-inner"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <Calendar size={14} className="text-blue-400" />
          <span>Upcoming Schedule ({totalUpcomingCount})</span>
        </button>
      </div>

      {/* Tab 1: Due Now Deck */}
      {activeTab === "due" && (
        <div className="space-y-4">
          {dueProblems.length === 0 ? (
            <div className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  All Caught Up!
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                  Zero problems are due for revision right now. Your retention curve is locked in. Solve new problems to expand your repertoire!
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/topics"
                  onClick={() => soundEffects.playClick()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                >
                  <span>Explore Topics</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/recommendations"
                  onClick={() => soundEffects.playClick()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-xs transition-all border border-[var(--border-subtle)]"
                >
                  <Sparkles size={14} className="text-purple-400" />
                  <span>AI Recommendations</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dueProblems.map((item, index) => {
                const isTop = index === 0;
                const isReviewing = reviewingId === item.problemId;
                return (
                  <div
                    key={item.problemId}
                    className={`p-5 rounded-3xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isTop
                        ? "bg-[var(--bg-card)] border-purple-500/40 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500/20"
                        : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                    }`}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-mono">
                        {isTop && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            Next Up [1-4]
                          </span>
                        )}
                        <span className="text-xs text-[var(--text-muted)] font-semibold">
                          {item.topicName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDiffBadgeClass(
                            item.difficulty,
                          )}`}
                        >
                          {item.difficulty}
                        </span>
                        {item.daysOverdue && item.daysOverdue > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            {item.daysOverdue}d overdue
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/problems/${item.problemId}`}
                        onClick={() => soundEffects.playClick()}
                        className="text-base font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors inline-flex items-center gap-2 group font-display"
                      >
                        <span className="truncate">{item.title}</span>
                        <ChevronRight
                          size={16}
                          className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform"
                        />
                      </Link>
                    </div>

                    {/* Self-Rating Chips */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono">
                      <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1 hidden sm:inline">
                        Recall:
                      </span>
                      {QUALITY_OPTIONS.map((q) => (
                        <button
                          key={q.q}
                          onClick={() =>
                            handleReview(item.problemId, q.q, item.title)
                          }
                          disabled={isReviewing}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${q.color} disabled:opacity-50`}
                        >
                          {isReviewing && reviewingId === item.problemId ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <span className="font-mono text-[10px] opacity-75">
                              [{q.key}]
                            </span>
                          )}
                          <span>{q.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upcoming Schedule */}
      {activeTab === "upcoming" && (
        <div className="space-y-3">
          {upcomingProblems.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center text-[var(--text-muted)] text-xs font-mono">
              No upcoming revisions scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingProblems.map((item) => {
                const reviewDate = new Date(
                  item.nextReviewDate,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={item.problemId}
                    className="p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] transition-all flex flex-col justify-between space-y-3 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[var(--text-muted)] font-semibold">
                          {item.topicName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDiffBadgeClass(
                            item.difficulty,
                          )}`}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <Link
                        href={`/problems/${item.problemId}`}
                        onClick={() => soundEffects.playClick()}
                        className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors block line-clamp-1 font-display"
                      >
                        {item.title}
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Clock size={13} className="text-blue-400" />
                        Next: {reviewDate}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--accent-primary)]">
                        {item.interval}d interval
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
