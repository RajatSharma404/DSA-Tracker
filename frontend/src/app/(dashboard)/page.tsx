"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { dsaApi, DashboardStats, Topic } from "@/lib/api";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  ActivityCardSkeleton,

} from "@/components/ui/Skeleton";
import { useToastNotification } from "@/components/providers/ToastProvider";
import { trackEvent } from "@/lib/analytics";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { TodayPlan } from "@/components/dashboard/TodayPlan";
import { TopicProgressList } from "@/components/dashboard/TopicProgressList";
import { Panel } from "@/components/ui/Panel";

const ActivityHeatmap = dynamic(
  () => import("@/components/dashboard/ActivityHeatmap"),
  {
    ssr: false,
    loading: () => <ActivityCardSkeleton />,
  },
);

const WeeklyPlanCard = dynamic(() => import("@/components/dashboard/WeeklyPlanCard"), {
  ssr: false,
  loading: () => <div className="surface h-48 shimmer" />,
});

const MistakePatternsCard = dynamic(() => import("@/components/dashboard/MistakePatternsCard"), {
  ssr: false,
  loading: () => <div className="surface h-48 shimmer" />,
});

import { queryCache } from "@/lib/queryCache";

export default function Dashboard() {
  const router = useRouter();
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
  const [slowServerWakeup, setSlowServerWakeup] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let ticker: NodeJS.Timeout;
    let wakeTimer: NodeJS.Timeout;

    if (loading) {
      const startTime = Date.now();
      ticker = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      wakeTimer = setTimeout(() => {
        setSlowServerWakeup(true);
      }, 4000);
    } else {
      setSlowServerWakeup(false);
      setElapsedSeconds(0);
    }

    return () => {
      clearInterval(ticker);
      clearTimeout(wakeTimer);
    };
  }, [loading]);

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
    const statusCode = err?.response?.status;
    if (statusCode === 401) {
      return "Session expired or unauthenticated. Please sign in again.";
    }
    const message =
      err?.response?.data?.error ||
      err?.response?.data?.details ||
      err?.message ||
      "Unknown API error";
    return statusCode ? `${statusCode}: ${String(message)}` : String(message);
  };

  const loadDashboardData = useCallback(async (shouldAutoSync: boolean) => {
    try {
      const [statsResult, activityResult, topicsResult] =
        await Promise.allSettled([
          dsaApi.getDashboardStats(),
          dsaApi.getActivityData(),
          dsaApi.getTopics(),
        ]);

      if (statsResult.status === "fulfilled") {
        const statsData = statsResult.value;
        setStats(statsData);
        setDashboardError(null);
        trackEvent("dashboard_viewed", {
          solvedProblems: statsData.solvedProblems,
          progressPercentage: statsData.progressPercentage,
          dueReviews: statsData.revisions?.length || 0,
        });
      } else {
        throw statsResult.reason;
      }

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

      if (shouldAutoSync) {
        // Run sync in the background so initial dashboard render is fast.
        void dsaApi
          .syncLeetcode()
          .then(async () => {
            const [nextStatsRes, nextActivityRes, nextTopicsRes] =
              await Promise.allSettled([
                dsaApi.getDashboardStats(),
                dsaApi.getActivityData(),
                dsaApi.getTopics(),
              ]);

            if (nextStatsRes.status === "fulfilled") {
              setStats(nextStatsRes.value);
            }
            if (nextActivityRes.status === "fulfilled") {
              setActivityData(nextActivityRes.value);
            }
            if (nextTopicsRes.status === "fulfilled") {
              setTopicsSnapshot(nextTopicsRes.value);
            }
          })
          .catch((syncError) => {
            console.warn("LeetCode auto-sync skipped", syncError);
          });
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      const err = error as any;
      const is401 = err?.response?.status === 401;
      const errorMsg = formatApiError(error);
      setDashboardError(errorMsg);
      setStats(null);
      setActivityData([]);
      if (is401) {
        errorToast("Session expired. Redirecting to login...");
        router.replace("/login");
      } else {
        errorToast("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [errorToast, router]);

  // Auto-retry polling every 3s up to 30s during cold starts
  useEffect(() => {
    if (!slowServerWakeup || !loading || elapsedSeconds > 30) return;

    const retryTimer = setTimeout(() => {
      if (status === "authenticated" && loading) {
        loadDashboardData(false);
      }
    }, 3000);

    return () => clearTimeout(retryTimer);
  }, [slowServerWakeup, loading, elapsedSeconds, status, loadDashboardData]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    // Retain warm cache so page transitions and revisits render in 0ms (Stale-While-Revalidate)
    const hasWarmCache = !!stats || !!queryCache.get<DashboardStats>("dashboard_stats");
    if (!hasWarmCache) {
      setLoading(true);
      setStats(null);
    }

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
  }, [status, session?.user?.email, loadDashboardData, router, stats]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {slowServerWakeup && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>⚡ Connecting to backend server... ({elapsedSeconds}s)</span>
            </div>
            <span className="text-[10px] text-amber-300/70">Auto-retrying every 3s (up to 30s)</span>
          </div>
        )}
        <div className="h-10 w-72 rounded-xl border border-[var(--border-subtle)] shimmer" />
        <div className="h-32 rounded-2xl border border-[var(--border-subtle)] shimmer" />
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 h-80 rounded-2xl border border-[var(--border-subtle)] shimmer" />
          <div className="md:col-span-4 space-y-4">
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
            <div className="h-28 rounded-3xl border border-[var(--border-subtle)] shimmer" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`stat-skeleton-${index}`} className="h-28 rounded-2xl border border-[var(--border-subtle)] shimmer" />
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      {slowServerWakeup && stats && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-secondary)] shadow-[var(--shadow-md)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Waking the server… ({elapsedSeconds}s)
        </div>
      )}

      <DashboardHero
        name={session?.user?.name}
        stats={stats}
        solvedLast7d={solvedLast7d}
        projectedDaysToFinish={projectedDaysToFinish}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayPlan revisions={stats.revisions} />
        </div>
        <TopicProgressList topics={topicsSnapshot} />
      </div>

      <Panel
        title="Activity"
        description={`${solvedLast30d} solved in the last 30 days`}
        action={
          <Link href="/analytics" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Analytics
          </Link>
        }
      >
        <ActivityHeatmap data={activityData} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyPlanCard />
        <MistakePatternsCard />
      </div>
    </div>
  );
}
