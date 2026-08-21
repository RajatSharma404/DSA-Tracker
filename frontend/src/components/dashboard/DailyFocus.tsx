"use client";

import React, { useState, useEffect } from "react";
import { dsaApi } from "@/lib/api";
import {
  Crosshair,
  ExternalLink,
  RotateCcw,
  Zap,
  Brain,
  ArrowRight,
  Loader2,
  Trophy,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface DailyProblem {
  source: "REVISION" | "WEAKNESS";
  reason: string;
  problem: {
    id: string;
    title: string;
    difficulty: string;
    link: string | null;
    topicName: string;
    topicId: string;
  };
  plan?: {
    mode: string;
    mix: {
      weakness: number;
      medium: number;
      strong: number;
      revision: number;
    };
    items: Array<{
      source: string;
      id: string;
      title: string;
      difficulty: string;
      topicName: string;
      topicId: string;
      link: string | null;
    }>;
  };
}

const DIFFICULTY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  EASY: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  MEDIUM: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  HARD: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
};

const SOURCE_CONFIG = {
  REVISION: {
    gradient: "from-blue-600/20 via-cyan-600/10 to-transparent",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500/20",
    icon: <RotateCcw size={16} />,
    label: "REVISION DUE",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
  },
  WEAKNESS: {
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/20",
    icon: <Crosshair size={16} />,
    label: "WEAKNESS TARGET",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
  },
};

interface DailyLc {
  link: string;
  question: {
    title: string;
    difficulty: string;
    topicTags?: Array<{ name: string }>;
  };
}

export default function DailyFocus() {
  const [daily, setDaily] = useState<DailyProblem | null>(null);
  const [dailyLc, setDailyLc] = useState<DailyLc | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    async function loadFocus() {
      try {
        const [dailyData, lcData] = await Promise.allSettled([
          dsaApi.getDailyProblem(),
          dsaApi.getLeetcodeDailyChallenge(),
        ]);

        if (dailyData.status === "fulfilled") {
          if (dailyData.value.message === "ALL_PROBLEMS_SOLVED") {
            setAllDone(true);
          } else {
            setDaily(dailyData.value);
          }
        }

        if (lcData.status === "fulfilled") {
          setDailyLc(lcData.value);
        }
      } catch (err) {
        console.error("Failed to load daily focus", err);
      } finally {
        setLoading(false);
      }
    }
    loadFocus();
  }, []);

  if (loading) {
    return (
      <div className="h-44 w-full rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={24} />
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center text-center py-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight font-display">
            All Problems Conquered
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm">
            You&apos;ve solved every problem in your roadmap. Keep reviewing to
            maintain your edge!
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const config = daily ? SOURCE_CONFIG[daily.source] : SOURCE_CONFIG.REVISION;
  const planItems = daily?.plan?.items?.slice(0, 3) || [];

  return (
    <div
      className={`p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden ${config.glow} group transition-all duration-500 hover:border-[var(--border-medium)] shadow-xl`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Floating sparkle */}
      <div className="absolute top-6 right-6 text-[var(--accent-primary)]/10">
        <Sparkles size={80} />
      </div>

      <div className="relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${config.accentBg} ${config.accent} border ${config.accentBorder}`}
            >
              {config.icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2 font-display">
                Today&apos;s Focus
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                {dateStr}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Regular Daily Card */}
          {daily && (
            <div className="p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${DIFFICULTY_STYLES[daily.problem.difficulty]?.bg || DIFFICULTY_STYLES.MEDIUM.bg} ${DIFFICULTY_STYLES[daily.problem.difficulty]?.text || DIFFICULTY_STYLES.MEDIUM.text} border ${DIFFICULTY_STYLES[daily.problem.difficulty]?.border || DIFFICULTY_STYLES.MEDIUM.border}`}
                    >
                      {daily.problem.difficulty}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {daily.problem.topicName}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 ${config.accentBg} ${config.accent} border ${config.accentBorder} rounded-full`}
                  >
                    {config.icon}
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {config.label}
                    </span>
                  </div>
                </div>
                <h4 className="text-base font-black text-[var(--text-primary)] mb-2 break-words">
                  {daily.problem.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
                  <Brain size={11} className="inline mr-1 -mt-0.5 text-[var(--accent-primary)]" />
                  {daily.reason}
                </p>
                {planItems.length > 1 && (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3 mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                      Session Plan
                    </p>
                    <div className="space-y-1.5">
                      {planItems.map((item, index) => (
                        <p
                          key={`${item.id}-${index}`}
                          className="text-[11px] text-[var(--text-secondary)] truncate"
                        >
                          <span className="text-[var(--text-muted)] mr-1">
                            {index + 1}.
                          </span>
                          {item.title}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {daily.problem.link && (
                  <a
                    href={daily.problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("today_plan_item_opened", {
                        source: daily.source,
                        type: "regular-daily",
                        problemId: daily.problem.id,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    Solve Now
                    <ExternalLink size={12} />
                  </a>
                )}
                <Link
                  href="/topics"
                  onClick={() =>
                    trackEvent("today_plan_item_opened", {
                      source: daily.source,
                      type: "view-topic",
                      topicId: daily.problem.topicId,
                    })
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-subtle)]"
                >
                  View
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* LeetCode Daily Challenge Card */}
          {dailyLc && dailyLc.question && (
            <div className="p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${DIFFICULTY_STYLES[dailyLc.question.difficulty.toUpperCase()]?.bg || DIFFICULTY_STYLES.MEDIUM.bg} ${DIFFICULTY_STYLES[dailyLc.question.difficulty.toUpperCase()]?.text || DIFFICULTY_STYLES.MEDIUM.text} border ${DIFFICULTY_STYLES[dailyLc.question.difficulty.toUpperCase()]?.border || DIFFICULTY_STYLES.MEDIUM.border}`}
                    >
                      {dailyLc.question.difficulty}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {dailyLc.question.topicTags?.[0]?.name || "LeetCode"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full`}
                  >
                    <Zap size={10} />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      Global Daily
                    </span>
                  </div>
                </div>
                <h4 className="text-base font-black text-[var(--text-primary)] mb-2 break-words">
                  {dailyLc.question.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://leetcode.com/static/images/LeetCode_logo_rvs.png"
                    className="inline w-3 h-3 mr-1.5 grayscale opacity-70"
                    alt=""
                  />
                  LeetCode&apos;s official problem of the day. Keep your streak
                  alive!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://leetcode.com${dailyLc.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("today_plan_item_opened", {
                      source: "WEAKNESS",
                      type: "leetcode-daily",
                      title: dailyLc.question?.title,
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ffa116] text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#ffb84d] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ffa116]/20"
                >
                  Attempt Challenge
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
