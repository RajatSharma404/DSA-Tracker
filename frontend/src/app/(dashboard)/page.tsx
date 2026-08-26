"use client";

import { useEffect, useState } from "react";
import { dsaApi, DashboardStats, Topic } from "@/lib/api";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  BookOpen,
  LayoutGrid,
  Network,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  Skeleton,
  ActivityCardSkeleton,
  StatsCardSkeleton,
} from "@/components/ui/Skeleton";
import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { useToastNotification } from "@/components/providers/ToastProvider";
import { trackEvent } from "@/lib/analytics";
import { StreakFlame } from "@/components/ui/StreakFlame";

const ActivityHeatmap = dynamic(
  () => import("@/components/dashboard/ActivityHeatmap"),
  {
    ssr: false,
    loading: () => <ActivityCardSkeleton />,
  },
);

const LeetCodeSync = dynamic(
  () => import("@/components/dashboard/LeetCodeSync"),
  {
    ssr: false,
    loading: () => <Skeleton variant="card" className="h-28" />,
  },
);

const SkillRadar = dynamic(() => import("@/components/dashboard/SkillRadar"), {
  ssr: false,
  loading: () => <Skeleton variant="chart" />,
});

const DailyFocus = dynamic(() => import("@/components/dashboard/DailyFocus"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-36" />,
});

const BadgeShowcase = dynamic(
  () => import("@/components/dashboard/BadgeShowcase"),
  {
    ssr: false,
    loading: () => <Skeleton variant="card" className="h-44" />,
  },
);

const StatCard = dynamic(
  () => import("@/components/ui/StatCard").then((mod) => mod.StatCard),
  {
    ssr: false,
    loading: () => <StatsCardSkeleton />,
  },
);

import { queryCache } from "@/lib/queryCache";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { error: errorToast } = useToastNotification();
  
  // Instant synchronous cache read for 0ms page transitions
  const cachedStats = queryCache.get<DashboardStats>("dashboard_stats");
  const cachedActivity = queryCache.get<Array<{ date: string; count: number }>>("activity_data");
  const cachedTopics = queryCache.get<Topic[]>("topics");

  const [stats, setStats] = useState<DashboardStats | null>(cachedStats || null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Array<{ date: string; count: number }>>(cachedActivity || []);
  const [topicsSnapshot, setTopicsSnapshot] = useState<Topic[]>(cachedTopics || []);
  const [loading, setLoading] = useState(!cachedStats);

  const recentSolvedCount = (days: number) => {
    if (activityData.length === 0) return 0;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    return activityData
      .filter((item) => new Date(item.date) >= cutoff)
      .reduce((sum, item) => sum + item.count, 0);
  };

  const solvedLast7d = recentSolvedCount(7);
  const solvedLast30d = recentSolvedCount(30);
  const weeklyPace = solvedLast7d / 7;
  const projected30d = Math.round(weeklyPace * 30);
  const remainingToFinish = stats
    ? Math.max(0, stats.totalProblems - stats.solvedProblems)
    : 0;
  const projectedDaysToFinish =
    weeklyPace > 0
      ? Math.max(1, Math.ceil(remainingToFinish / weeklyPace))
      : null;
  const nextMilestonePct = !stats
    ? null
    : stats.progressPercentage < 50
      ? 50
      : stats.progressPercentage < 75
        ? 75
        : 100;
  const problemsToNextMilestone =
    stats && nextMilestonePct !== null
      ? Math.max(
        0,
        Math.ceil((stats.totalProblems * nextMilestonePct) / 100) -
        stats.solvedProblems,
      )
      : 0;
  const projectedDaysToNextMilestone =
    weeklyPace > 0 && nextMilestonePct !== null
      ? Math.max(1, Math.ceil(problemsToNextMilestone / weeklyPace))
      : null;

  const formatApiError = (error: unknown) => {
    const err = error as any;
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.details ||
      err?.message ||
      "Unknown API error";
    const statusCode = err?.response?.status;
    return statusCode ? `${statusCode}: ${String(message)}` : String(message);
  };

  const loadDashboardData = async (shouldAutoSync: boolean) => {
    try {
      const statsData = await dsaApi.getDashboardStats();
      setStats(statsData);
      trackEvent("dashboard_viewed", {
        solvedProblems: statsData.solvedProblems,
        progressPercentage: statsData.progressPercentage,
        dueReviews: statsData.revisions?.length || 0,
      });

      setLoading(false);

      void Promise.allSettled([
        dsaApi.getActivityData(),
        dsaApi.getTopics(),
      ]).then(([activityResult, topicsResult]) => {
        if (activityResult.status === "fulfilled") {
          setActivityData(activityResult.value);
        } else {
          console.warn("Activity data unavailable", activityResult.reason);
          setActivityData([]);
        }

        if (topicsResult.status === "fulfilled") {
          setTopicsSnapshot(topicsResult.value);
        } else {
          console.warn("Topic snapshot unavailable", topicsResult.reason);
          setTopicsSnapshot([]);
        }
      });

      setDashboardError(null);

      if (shouldAutoSync) {
        // Run sync in the background so initial dashboard render is fast.
        void dsaApi
          .syncLeetcode()
          .then(async () => {
            const nextStats = await dsaApi.getDashboardStats();
            setStats(nextStats);

            try {
              const nextActivity = await dsaApi.getActivityData();
              setActivityData(nextActivity);
            } catch (nextActivityError) {
              console.warn(
                "Activity refresh unavailable after sync",
                nextActivityError,
              );
            }

            try {
              const nextTopics = await dsaApi.getTopics();
              setTopicsSnapshot(nextTopics);
            } catch (nextTopicsError) {
              console.warn(
                "Topic snapshot unavailable after sync",
                nextTopicsError,
              );
            }
          })
          .catch((syncError) => {
            console.warn("LeetCode auto-sync skipped", syncError);
          });
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      const errorMsg = formatApiError(error);
      setDashboardError(errorMsg);
      setStats(null);
      setActivityData([]);
      errorToast("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setStats(null);

    const userEmail = session?.user?.email || "unknown-user";
    const syncStorageKey = `leetcode-last-sync:${userEmail}`;
    const lastSyncRaw = window.localStorage.getItem(syncStorageKey);
    const lastSyncMs = lastSyncRaw ? Number(lastSyncRaw) : 0;
    const shouldAutoSync =
      !lastSyncMs || Date.now() - lastSyncMs > 2 * 60 * 1000;

    loadDashboardData(shouldAutoSync).finally(() => {
      if (shouldAutoSync) {
        window.localStorage.setItem(syncStorageKey, Date.now().toString());
      }
    });
  }, [status, session?.user?.email]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="h-10 w-72 rounded-xl border border-[var(--border-subtle)] shimmer" />
        <div className="h-32 rounded-[2.5rem] border border-[var(--border-subtle)] shimmer" />
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 h-80 rounded-[2.5rem] border border-[var(--border-subtle)] shimmer" />
          <div className="md:col-span-4 space-y-4">
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl border border-[var(--border-subtle)] shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-[var(--text-muted)] text-lg">Failed to load dashboard data.</p>
        <p className="text-[var(--text-muted)] text-sm">
          Make sure the backend is running and <code>BACKEND_URL</code> (or
          <code>NEXT_PUBLIC_API_URL</code>) is set correctly.
        </p>
        {dashboardError ? (
          <p className="text-red-400/80 text-xs max-w-2xl wrap-break-word">
            API Error: {dashboardError}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              const canSync = status === "authenticated";
              loadDashboardData(canSync);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none"
          >
            Retry Dashboard
            <ArrowRight size={12} />
          </button>
          <Link
            href="/review"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Open Review Queue
          </Link>
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Open Topics
          </Link>
        </div>
      </div>
    );

  const dueNowCount = stats.revisions?.length || 0;
  const weakTopicCount = stats.weakTopics?.length || 0;
  const sessionFocus =
    dueNowCount > 0
      ? "Clear due reviews first"
      : weakTopicCount > 0
        ? "Target weakest topic"
        : "Build momentum with one quick solve";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-display">
          Dashboard
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Welcome back to DSA Pro. Keep crushing those algorithmic milestones.
        </p>
      </div>

      {/* Daily Focus — Problem of the Day */}
      <DailyFocus />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-[2.25rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_40%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">
                <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                <span>Next Best Problem &bull; AI Recommendation</span>
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-[var(--text-primary)] font-display">
                {stats.nextAction?.title || "Target Weakest Area: " + (stats.weakTopics[0]?.name || "Arrays & Pointers")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)] leading-relaxed">
                {stats.nextAction?.reason ||
                  (stats.weakTopics[0] 
                    ? `Your average solve time for ${stats.weakTopics[0].name} is ${stats.weakTopics[0].avgTimeSpent} mins. Practicing this problem will reinforce core loop invariants.`
                    : "The tracker recommends reinforcing key patterns based on your recent activity.")}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-right shrink-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                Focus Mode
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-[var(--accent-primary)] font-mono">
                {stats.nextAction?.mode?.replaceAll("_", " ") || "WEAKNESS TARGET"}
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Topic
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {stats.nextAction?.topic || "Warm-up"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Difficulty
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {stats.nextAction?.difficulty || "EASY"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Estimate
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {stats.nextAction?.estimatedMinutes || 20} min
              </p>
            </div>
          </div>

          <div className="relative mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Today Blueprint
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-400">
                Due {dueNowCount}
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                Weak {weakTopicCount}
              </span>
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                Pace {solvedLast7d}/7d
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">{sessionFocus}</p>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-3">
            <Link
              href={
                stats.nextAction?.mode === "REVISION"
                  ? "/review"
                  : stats.revisions[0]
                    ? `/problems/${stats.revisions[0].id}`
                    : "/search"
              }
              onClick={() =>
                trackEvent("dashboard_primary_cta_clicked", {
                  mode: stats.nextAction?.mode || "BALANCED",
                  cta: "Solve Problem Now",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[var(--accent-glow)]/40 cursor-pointer font-mono"
            >
              <span>Solve Problem Now</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] font-mono"
            >
              Why this pick
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 grid gap-4 sm:grid-cols-2">
          <div
            className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-3xl shadow-lg"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Next Review
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {stats.revisions[0]?.title || "No review due right now"}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              {stats.revisions[0]
                ? `${stats.revisions[0].topicName} - ${stats.revisions[0].daysSince} days since solve`
                : "Spaced repetition will surface stale problems here."}
            </p>
          </div>

          <div
            className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-3xl shadow-lg"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Weakest Topic
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
              {stats.weakTopics[0]?.name || "None detected"}
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              {stats.weakTopics[0]
                ? `${stats.weakTopics[0].avgTimeSpent} min avg solve time`
                : "Weak-topic coaching will appear once the tracker has enough data."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Recent Pace
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--text-primary)] font-display">
            {solvedLast7d} in 7d
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {solvedLast30d} solved in the last 30 days
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            30-Day Projection
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--text-primary)] font-display">
            {projected30d} solves
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Based on your current weekly pace
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Finish Forecast
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--text-primary)] font-display">
            {projectedDaysToFinish ? `${projectedDaysToFinish}d` : "—"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            Estimated time to clear the roadmap at current pace
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Next Milestone
          </p>
          <p className="mt-2 text-2xl font-black text-[var(--text-primary)] font-display">
            {nextMilestonePct ? `${nextMilestonePct}%` : "—"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {projectedDaysToNextMilestone
              ? `${projectedDaysToNextMilestone}d to reach this milestone`
              : "Keep solving to unlock a forecast"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden h-full shadow-xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase font-display">
                  Consistency Map
                </h2>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                  Your daily grind history
                </p>
              </div>
            </div>
            <ActivityHeatmap data={activityData} />

            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-2">
                    <Network size={14} className="text-[var(--accent-primary)]" />
                    Roadmap Progress Mini-Map
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                    Current position and next unlock target
                  </p>
                </div>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:underline rounded-md"
                >
                  Open Visual Roadmap
                  <ArrowRight size={12} />
                </Link>
              </div>

              {topicsSnapshot.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Total Topics
                      </p>
                      <p className="text-lg font-black text-[var(--text-primary)] mt-1 font-display">
                        {topicsSnapshot.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                        Completed
                      </p>
                      <p className="text-lg font-black text-emerald-400 mt-1 font-display">
                        {
                          topicsSnapshot.filter(
                            (topic) => topic.progressPercentage >= 100,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                        In Progress
                      </p>
                      <p className="text-lg font-black text-blue-400 mt-1 font-display">
                        {
                          topicsSnapshot.filter(
                            (topic) =>
                              topic.progressPercentage > 0 &&
                              topic.progressPercentage < 100,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        Next Unlock
                      </p>
                      <p className="text-xs font-black text-amber-400 mt-1 truncate">
                        {topicsSnapshot.find(
                          (topic) => topic.progressPercentage < 100,
                        )?.name || "Roadmap Complete"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 shadow-inner">
                    <div className="grid grid-cols-10 gap-2">
                      {topicsSnapshot.slice(0, 30).map((topic, idx) => {
                        const progress = topic.progressPercentage;
                        const tone =
                          progress >= 100
                            ? "bg-emerald-400/90 border-emerald-300/90 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                            : progress > 0
                              ? "bg-blue-400/80 border-blue-300/80 shadow-[0_0_6px_rgba(96,165,250,0.4)]"
                              : "bg-[var(--bg-tertiary)] border-[var(--border-subtle)] opacity-70";

                        return (
                          <div
                            key={topic.id}
                            style={{ animationDelay: `${idx * 16}ms` }}
                            data-tooltip={`${topic.name}: ${progress}%`}
                            className={`h-5 rounded-md border ${tone} cell-pop transition-all hover:scale-115 hover:z-20 cursor-default`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                      <span>Locked</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
                          Up Next Topic Queue
                        </h4>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                          Next 5
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {topicsSnapshot
                          .filter((topic) => topic.progressPercentage < 100)
                          .slice(0, 5)
                          .map((topic) => (
                            <div
                              key={`queue-${topic.id}`}
                              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-[11px] font-bold text-[var(--text-secondary)] truncate">
                                  {topic.name}
                                </p>
                                <span className="text-[10px] font-black text-[var(--accent-primary)] shrink-0">
                                  {topic.progressPercentage}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
                                  style={{
                                    width: `${topic.progressPercentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] mb-3">
                        Roadmap Distribution
                      </h4>

                      {(() => {
                        const total = topicsSnapshot.length || 1;
                        const completed = topicsSnapshot.filter(
                          (topic) => topic.progressPercentage >= 100,
                        ).length;
                        const active = topicsSnapshot.filter(
                          (topic) =>
                            topic.progressPercentage > 0 &&
                            topic.progressPercentage < 100,
                        ).length;
                        const locked = Math.max(0, total - completed - active);

                        const completedPct = Math.round(
                          (completed / total) * 100,
                        );
                        const activePct = Math.round((active / total) * 100);
                        const lockedPct = Math.max(
                          0,
                          100 - completedPct - activePct,
                        );

                        return (
                          <>
                            <div className="h-3 rounded-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex">
                              <div
                                className="bg-[var(--bg-tertiary)]"
                                style={{ width: `${lockedPct}%` }}
                              />
                              <div
                                className="bg-blue-400/80"
                                style={{ width: `${activePct}%` }}
                              />
                              <div
                                className="bg-emerald-400/80"
                                style={{ width: `${completedPct}%` }}
                              />
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest">
                              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 text-[var(--text-muted)]">
                                Locked {lockedPct}%
                              </div>
                              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-400">
                                Active {activePct}%
                              </div>
                              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-400">
                                Done {completedPct}%
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Roadmap snapshot unavailable right now
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-4 flex flex-col gap-6">
          <LeetCodeSync
            onSyncComplete={() => {
              if (status === "authenticated") {
                setLoading(true);
                loadDashboardData(false);
              }
            }}
          />
          <BadgeShowcase />
          <SkillRadar />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${stats.progressPercentage}%`}
          description={`${stats.solvedProblems} of ${stats.totalProblems} solved`}
          icon={Target}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} Days`}
          description={`Longest: ${stats.longestStreak} Days`}
          icon={() => <StreakFlame streakDays={stats.currentStreak} size={26} />}
        />
        <StatCard
          title="Problems Solved"
          value={stats.solvedProblems}
          icon={CheckCircle2}
        />
        <StatCard title="Active Topics" value="In Progress" icon={BookOpen} />
      </div>

      {/* Progress Bar overall */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">Roadmap Completion</h3>
          <span className="text-sm font-black font-mono text-[var(--accent-primary)] drop-shadow-[0_0_6px_var(--accent-glow)]">
            {stats.progressPercentage}%
          </span>
        </div>
        <div className="w-full h-3.5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_var(--accent-glow)] relative"
            style={{
              width: `${stats.progressPercentage}%`,
              background: "var(--accent-gradient)",
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revision Reminders Panel */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -ml-12 -mt-12 group-hover:bg-blue-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase mb-6 flex items-center gap-3 font-display">
            <Target size={20} className="text-blue-400" />
            Active Revision
          </h3>
          <div className="space-y-4">
            {stats.revisions?.length > 0 ? (
              stats.revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-3xl border border-[var(--border-subtle)] flex justify-between items-center transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)]">
                        {rev.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                        {rev.topicName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                    STALE {rev.daysSince}D
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">
                Curriculum fully synchronized
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics Panel */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 left-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full -ml-12 -mt-12 group-hover:bg-rose-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase mb-6 flex items-center gap-3 font-display">
            <Flame size={20} className="text-rose-400" />
            Weakness Analysis
          </h3>
          <div className="space-y-4">
            {stats.weakTopics?.length > 0 ? (
              stats.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-3xl border border-[var(--border-subtle)] flex justify-between items-center transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      {topic.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20">
                    {topic.avgTimeSpent}M AVG PLUNGE
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">
                Analyzing performance metrics...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/topics"
          className="bg-[var(--accent-primary)] text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:opacity-90 transition-opacity shadow-md"
        >
          Continue Journey
        </Link>
      </div>
    </div>
  );
}
