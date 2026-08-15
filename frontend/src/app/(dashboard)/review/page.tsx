"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getDifficultyStyle } from "@/lib/design-tokens";

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

const QUALITY_OPTIONS: Array<{
  q: number;
  label: string;
  next: string;
  color: string;
}> = [
  {
    q: 1,
    label: "Forgot",
    next: "Resets to 2d",
    color: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
  },
  {
    q: 3,
    label: "Hard",
    next: "Short interval",
    color: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
  },
  {
    q: 4,
    label: "Good",
    next: "Moves ahead",
    color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  },
  {
    q: 5,
    label: "Easy",
    next: "Longest jump",
    color: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
  },
];

export default function ReviewQueuePage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("review_queue_viewed");
    loadReviewQueue();
  }, []);

  const firstDueProblemId =
    data?.due?.find((item) => !completedIds.has(item.problemId))?.problemId ||
    null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!firstDueProblemId || reviewingId) return;
      if (event.target instanceof HTMLInputElement) return;
      if (event.target instanceof HTMLTextAreaElement) return;

      const keyMap: Record<string, number> = {
        "1": 1,
        "2": 3,
        "3": 4,
        "4": 5,
      };
      const quality = keyMap[event.key];
      if (!quality) return;

      event.preventDefault();
      void handleReview(firstDueProblemId, quality);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [firstDueProblemId, reviewingId]);

  const loadReviewQueue = async () => {
    try {
      setLoading(true);
      const result = await dsaApi.getReviewQueue();
      setData(result);
    } catch (err) {
      console.error("Failed to load review queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (problemId: string, quality: number) => {
    trackEvent("review_quality_selected", { problemId, quality });
    setReviewingId(problemId);
    try {
      const result = await dsaApi.completeReview(problemId, quality);
      trackEvent("review_completed", {
        problemId,
        quality,
        nextReviewIn: result.nextReviewIn || null,
      });
      setCompletedIds((prev) => new Set([...prev, problemId]));
      setReviewNotice(
        result.nextReviewIn
          ? `Review saved. Next review in ${result.nextReviewIn}.`
          : "Review saved and rescheduled.",
      );
      await loadReviewQueue();
    } catch (err) {
      console.error("Failed to complete review:", err);
    } finally {
      setReviewingId(null);
    }
  };

  const getDifficultyColor = (d: string) => {
    const style = getDifficultyStyle(d as "EASY" | "MEDIUM" | "HARD");
    return `${style.text} ${style.bg} ${style.border}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse w-full min-w-0">
        <div className="h-10 w-72 rounded-xl bg-white/8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-white/6" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white/6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="text-purple-400" size={28} />
            Review Queue
          </h1>
          <p className="text-gray-400 mt-2">
            Spaced repetition keeps your knowledge locked in. Review problems
            before you forget them.
          </p>
        </div>
        <button
          onClick={loadReviewQueue}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-cyan-400" size={18} />
          <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
            Adaptive Spaced Repetition
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          Your recall quality controls the next interval. Hard recalls shorten
          the gap, strong recalls stretch it, and the queue re-ranks the next
          session automatically.
        </p>
        {reviewNotice && (
          <p className="mt-3 text-xs font-medium text-cyan-200">
            {reviewNotice}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-400" size={20} />
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
              Due Now
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {data?.stats.totalDue || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Problems need your attention
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-400" size={20} />
            <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              Upcoming
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {data?.stats.totalUpcoming || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Scheduled for later</p>
        </div>
        <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
              Reviewed Today
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            {completedIds.size}
          </div>
          <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
        </div>
      </div>

      {/* Due Reviews */}
      {data?.due && data.due.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-red-400" size={20} />
            Due for Review ({data.due.length})
          </h2>
          <div className="space-y-3">
            {data.due
              .filter((item) => !completedIds.has(item.problemId))
              .map((item) => (
                <div
                  key={item.problemId}
                  className="p-5 rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                      <div>
                        <Link
                          href={`/problems/${item.problemId}`}
                          className="font-bold text-white hover:text-purple-400 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {item.topicName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}
                          >
                            {item.difficulty}
                          </span>
                          {item.daysOverdue && item.daysOverdue > 0 && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                              {item.daysOverdue}d overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review Quality Buttons */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] text-gray-600">
                        How well do you remember?
                      </span>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {QUALITY_OPTIONS.map((btn) => (
                          <button
                            key={btn.q}
                            onClick={() => handleReview(item.problemId, btn.q)}
                            disabled={reviewingId === item.problemId}
                            className={`min-h-10 px-4 py-2 rounded-lg text-xs font-bold transition-all ${btn.color} disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60`}
                            aria-label={`${btn.label}. ${btn.next}`}
                            title={btn.next}
                          >
                            {reviewingId === item.problemId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              btn.label
                            )}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-600">
                        Forgot resets to 2 days. Good/Easy increases spacing.
                      </span>
                      <span className="text-[10px] text-gray-600">
                        Keyboard: 1 Forgot, 2 Hard, 3 Good, 4 Easy.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Completed Reviews */}
      {completedIds.size > 0 && (
        <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10">
          <h3 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Completed Reviews ({completedIds.size})
          </h3>
          <p className="text-xs text-gray-400">
            Great job! These problems have been rescheduled based on your recall
            quality.
          </p>
        </div>
      )}

      {/* Empty state for due */}
      {data?.due.length === 0 && (
        <div className="p-12 rounded-2xl bg-[#0d0d0d] border border-white/5 text-center">
          <CheckCircle2 className="text-green-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400 text-sm">
            No problems due for review right now. Keep solving new problems!
          </p>
        </div>
      )}

      {/* Upcoming Reviews */}
      {data?.upcoming && data.upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-blue-400" size={20} />
            Coming Up
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.upcoming.map((item) => (
              <Link
                key={item.problemId}
                href={`/problems/${item.problemId}`}
                className="p-4 rounded-xl bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="font-medium text-gray-300 group-hover:text-white transition-colors text-sm">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-600">
                      {item.topicName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}
                    >
                      {item.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  {new Date(item.nextReviewDate).toLocaleDateString()}
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
