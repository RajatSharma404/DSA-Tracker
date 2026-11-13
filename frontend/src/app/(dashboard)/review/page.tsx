"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";
import WhyDidIForgetModal from "@/components/dashboard/WhyDidIForgetModal";
import { SyncStatusChip } from "@/components/offline/SyncStatusChip";
import {
  saveReviewQueueSnapshot,
  getCachedReviewQueue,
  enqueuePendingReview,
} from "@/lib/offline/db";
import { syncManager } from "@/lib/offline/syncManager";

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
  const [recallAvg, setRecallAvg] = useState<number | null>(null);
  useEffect(() => {
    dsaApi
      .getRetentionReport()
      .then((r) => setRecallAvg(r.total ? r.averageRecall : null))
      .catch(() => setRecallAvg(null));
  }, []);
  const [forgotModal, setForgotModal] = useState<{ problemId: string; title: string } | null>(null);

  useEffect(() => {
    trackEvent("review_queue_viewed");
    loadReviewQueue();
  }, []);

  async function loadReviewQueue() {
    setLoading(true);
    try {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        const res = await dsaApi.getReviewQueue();
        setData(res);
        if (res?.due) {
          await saveReviewQueueSnapshot(
            res.due.map((item: ReviewItem) => ({
              problemId: item.problemId,
              title: item.title,
              difficulty: item.difficulty,
              topicName: item.topicName,
              link: item.link || undefined,
              nextReviewDate: item.nextReviewDate,
              interval: item.interval,
              dueAt: item.nextReviewDate,
            })),
          );
        }
      } else {
        const cached = await getCachedReviewQueue();
        setData({
          due: cached.map((c) => ({
            progressId: c.problemId,
            problemId: c.problemId,
            title: c.title,
            difficulty: c.difficulty,
            topicName: c.topicName,
            link: c.link || null,
            nextReviewDate: c.nextReviewDate || new Date().toISOString(),
            interval: c.interval || 1,
          })),
          upcoming: [],
          stats: { totalDue: cached.length, totalUpcoming: 0 },
        });
      }
    } catch (err) {
      console.warn("Failed to load online review queue, checking offline cache:", err);
      const cached = await getCachedReviewQueue();
      if (cached.length > 0) {
        setData({
          due: cached.map((c) => ({
            progressId: c.problemId,
            problemId: c.problemId,
            title: c.title,
            difficulty: c.difficulty,
            topicName: c.topicName,
            link: c.link || null,
            nextReviewDate: c.nextReviewDate || new Date().toISOString(),
            interval: c.interval || 1,
          })),
          upcoming: [],
          stats: { totalDue: cached.length, totalUpcoming: 0 },
        });
      } else {
        toast.error("Failed to refresh review queue");
      }
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

    // Map quality (1, 3, 4, 5) to FSRS rating (1: Again, 2: Hard, 3: Good, 4: Easy)
    const fsrsRating = quality <= 2 ? 1 : quality === 3 ? 2 : quality === 4 ? 3 : 4;
    const clientEventId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const reviewedAt = new Date().toISOString();

    // 1. Optimistic UI advance and outbox enqueue immediately
    setCompletedIds((prev) => new Set([...prev, problemId]));
    const qualityLabel =
      QUALITY_OPTIONS.find((q) => q.q === quality)?.label || "Reviewed";
    setReviewNotice(`Rated "${title || "Problem"}" as ${qualityLabel}`);
    toast.success(`Rated "${title || "Problem"}" as ${qualityLabel}`);

    trackEvent("review_quality_selected", {
      problemId,
      quality,
      fsrsRating,
    });

    if (quality === 1) {
      setForgotModal({ problemId, title: title || "Problem" });
    }

    try {
      // 2. Enqueue into IndexedDB outbox
      await enqueuePendingReview({
        clientEventId,
        problemId,
        rating: fsrsRating,
        reviewedAt,
      });

      // 3. Trigger background sync if online
      if (typeof navigator !== "undefined" && navigator.onLine) {
        syncManager.flushOutbox().catch((err) => {
          console.warn("[Review] Background flush error:", err);
        });
      }
    } catch (err) {
      console.error("Failed to enqueue review in outbox:", err);
    } finally {
      setReviewingId(null);
    }
  };

  const totalDueCount = dueProblems.length;
  const reviewedTodayCount = completedIds.size;
  const totalUpcomingCount = upcomingProblems.length;
  // Real average recall from the FSRS memory model (Insights → Memory forecast).
  const recall = recallAvg;

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
          <h1 className="page-title text-3xl leading-tight text-[var(--text-primary)]">Review</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">Problems due for review today, most at risk of being forgotten first.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <SyncStatusChip />
          <button
            onClick={() => {
              soundEffects.playClick();
              loadReviewQueue();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-2xl text-xs font-bold text-[var(--text-secondary)] transition-all border border-[var(--border-subtle)] cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="surface grid grid-cols-2 sm:grid-cols-4 sm:divide-x divide-[var(--border-subtle)]">
        {[
          { label: "Due now", value: totalDueCount, sub: totalDueCount ? "Oldest first" : "All caught up" },
          { label: "Reviewed today", value: reviewedTodayCount, sub: "This session" },
          { label: "Coming up", value: totalUpcomingCount, sub: "Scheduled later" },
          {
            label: "Average recall",
            value: recall === null ? "—" : `${Math.round(recall * 100)}%`,
            sub: "Across everything solved",
            href: "/insights",
          },
        ].map((s) => (
          <div key={s.label} className="px-5 py-4">
            <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular text-[var(--text-primary)]">{s.value}</div>
            {s.href ? (
              <Link href={s.href} className="text-xs text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline">
                See forecast
              </Link>
            ) : (
              <div className="text-xs text-[var(--text-muted)]">{s.sub}</div>
            )}
          </div>
        ))}
      </div>
      <p className="-mt-4 text-xs text-[var(--text-muted)]">
        Grade the top card with{" "}
        {[1, 2, 3, 4].map((k) => (
          <kbd key={k} className="mx-0.5 rounded border border-[var(--border-subtle)] px-1.5 font-mono text-[10px]">
            {k}
          </kbd>
        ))}{" "}
        (forgot → easy). The scheduler spaces the next review by how well you recalled it.
      </p>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-6 border-b border-[var(--border-subtle)]">
        {([
          ["due", `Due (${totalDueCount})`],
          ["upcoming", `Upcoming (${totalUpcomingCount})`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab(id);
            }}
            className={`-mb-px border-b-2 pb-2.5 text-sm transition-colors cursor-pointer ${
              activeTab === id
                ? "border-[var(--accent-primary)] text-[var(--text-primary)] font-medium"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Due Now Deck */}
      {activeTab === "due" && (
        <div className="space-y-4">
          {dueProblems.length === 0 ? (
            <div className="surface flex flex-col items-start gap-3 p-6">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Nothing due right now</h3>
                <p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">
                  Problems you solve are scheduled here when they&apos;re about to slip. Until then, new practice is the best use of your time.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <Link href="/topics" className="rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-sm font-medium text-[var(--on-accent)] hover:opacity-90">
                  Browse topics
                </Link>
                <Link href="/recommendations" className="rounded-lg border border-[var(--border-medium)] px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                  Recommendations
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

      {forgotModal && (
        <WhyDidIForgetModal
          problemId={forgotModal.problemId}
          problemTitle={forgotModal.title}
          isOpen={Boolean(forgotModal)}
          onClose={() => setForgotModal(null)}
        />
      )}
    </div>
  );
}
