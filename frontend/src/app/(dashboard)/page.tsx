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
} from "lucide-react";
import Link from "next/link";

const ActivityHeatmap = dynamic(
  () => import("@/components/dashboard/ActivityHeatmap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const LeetCodeSync = dynamic(
  () => import("@/components/dashboard/LeetCodeSync"),
  {
    ssr: false,
    loading: () => (
      <div className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const SkillRadar = dynamic(() => import("@/components/dashboard/SkillRadar"), {
  ssr: false,
  loading: () => (
    <div className="h-52 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
  ),
});

const DailyFocus = dynamic(() => import("@/components/dashboard/DailyFocus"), {
  ssr: false,
  loading: () => (
    <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
  ),
});

const BadgeShowcase = dynamic(
  () => import("@/components/dashboard/BadgeShowcase"),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const StatCard = dynamic(
  () => import("@/components/ui/StatCard").then((mod) => mod.StatCard),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<
    Array<{ date: string; count: number }>
  >([]);
  const [topicsSnapshot, setTopicsSnapshot] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

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

      try {
        const actData = await dsaApi.getActivityData();
        setActivityData(actData);
      } catch (activityError) {
        // Keep dashboard usable if activity endpoint is rate limited.
        console.warn("Activity data unavailable", activityError);
        setActivityData([]);
      }

      try {
        const topicsData = await dsaApi.getTopics();
        setTopicsSnapshot(topicsData);
      } catch (topicsError) {
        console.warn("Topic snapshot unavailable", topicsError);
        setTopicsSnapshot([]);
      }

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
      setDashboardError(formatApiError(error));
      setStats(null);
      setActivityData([]);
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
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 rounded-xl bg-white/8" />
        <div className="h-28 rounded-[2.5rem] bg-white/6" />
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 h-72 rounded-[2.5rem] bg-white/6" />
          <div className="md:col-span-4 space-y-4">
            <div className="h-28 rounded-3xl bg-white/6" />
            <div className="h-28 rounded-3xl bg-white/6" />
            <div className="h-28 rounded-3xl bg-white/6" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white/6" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-gray-400 text-lg">Failed to load dashboard data.</p>
        <p className="text-gray-600 text-sm">
          Make sure the backend is running and <code>BACKEND_URL</code> (or
          <code>NEXT_PUBLIC_API_URL</code>) is set correctly in Render.
        </p>
        <p className="text-gray-600 text-xs max-w-2xl">
          Render can also return temporary 429 during traffic spikes. Refresh in
          a few seconds if this persists.
        </p>
        {dashboardError ? (
          <p className="text-red-400/80 text-xs max-w-2xl wrap-break-word">
            API Error: {dashboardError}
          </p>
        ) : null}
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back to DSA Pro. Keep crushing those problems.
        </p>
      </div>

      {/* Daily Focus — Problem of the Day */}
      <DailyFocus />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden h-full">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">
                  Consistency Map
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Your daily grind history
                </p>
              </div>
            </div>
            <ActivityHeatmap data={activityData} />

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Network size={14} className="text-cyan-400" />
                    Roadmap Progress Mini-Map
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Current position and next unlock target
                  </p>
                </div>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-colors"
                >
                  Open Visual Roadmap
                  <ArrowRight size={12} />
                </Link>
              </div>

              {topicsSnapshot.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        Total Topics
                      </p>
                      <p className="text-lg font-black text-white mt-1">
                        {topicsSnapshot.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-300/80">
                        Completed
                      </p>
                      <p className="text-lg font-black text-green-300 mt-1">
                        {
                          topicsSnapshot.filter(
                            (topic) => topic.progressPercentage >= 100,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-300/80">
                        In Progress
                      </p>
                      <p className="text-lg font-black text-blue-300 mt-1">
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
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-300/80">
                        Next Unlock
                      </p>
                      <p className="text-xs font-black text-amber-300 mt-1 truncate">
                        {topicsSnapshot.find(
                          (topic) => topic.progressPercentage < 100,
                        )?.name || "Roadmap Complete"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#0a0a0f] p-4">
                    <div className="grid grid-cols-10 gap-2">
                      {topicsSnapshot.slice(0, 30).map((topic) => {
                        const progress = topic.progressPercentage;
                        const tone =
                          progress >= 100
                            ? "bg-green-400/80 border-green-300/80"
                            : progress > 0
                              ? "bg-blue-400/70 border-blue-300/70"
                              : "bg-[#1a1a1a] border-white/10";

                        return (
                          <div
                            key={topic.id}
                            title={`${topic.name}: ${progress}%`}
                            className={`h-5 rounded-sm border ${tone} transition-transform hover:scale-110`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                      <span>Locked</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0f] p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                          Up Next Topic Queue
                        </h4>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
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
                              className="rounded-xl border border-white/5 bg-white/3 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-[11px] font-bold text-gray-200 truncate">
                                  {topic.name}
                                </p>
                                <span className="text-[10px] font-black text-blue-300 shrink-0">
                                  {topic.progressPercentage}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-400/80 transition-all duration-500"
                                  style={{
                                    width: `${topic.progressPercentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0f] p-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-3">
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
                            <div className="h-3 rounded-full overflow-hidden border border-white/5 bg-[#131313] flex">
                              <div
                                className="bg-[#1a1a1a]"
                                style={{ width: `${lockedPct}%` }}
                              />
                              <div
                                className="bg-blue-400/80"
                                style={{ width: `${activePct}%` }}
                              />
                              <div
                                className="bg-green-400/80"
                                style={{ width: `${completedPct}%` }}
                              />
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest">
                              <div className="rounded-xl border border-white/5 bg-white/3 p-2.5 text-gray-400">
                                Locked {lockedPct}%
                              </div>
                              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-300">
                                Active {activePct}%
                              </div>
                              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-2.5 text-green-300">
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
                <div className="rounded-2xl border border-white/5 bg-white/3 p-5 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
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
          icon={Flame}
        />
        <StatCard
          title="Problems Solved"
          value={stats.solvedProblems}
          icon={CheckCircle2}
        />
        <StatCard title="Active Topics" value="In Progress" icon={BookOpen} />
      </div>

      {/* Progress Bar overall */}
      <div className="card-3d-hover p-6 rounded-2xl bg-[#111] border border-[#222]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Roadmap Completion</h3>
          <span className="text-sm font-medium">
            {stats.progressPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revision Reminders Panel */}
        <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -ml-12 -mt-12 group-hover:bg-blue-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-3">
            <Target size={20} className="text-blue-400" />
            Active Revision
          </h3>
          <div className="space-y-4">
            {stats.revisions?.length > 0 ? (
              stats.revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white/2 hover:bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div>
                      <p className="font-bold text-sm text-gray-200 group-hover/item:text-white transition-colors">
                        {rev.title}
                      </p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
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
              <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                Curriculum fully synchronized
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics Panel */}
        <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full -ml-12 -mt-12 group-hover:bg-red-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-3">
            <Flame size={20} className="text-red-400" />
            Weakness Analysis
          </h3>
          <div className="space-y-4">
            {stats.weakTopics?.length > 0 ? (
              stats.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/2 hover:bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="font-bold text-sm text-gray-200 group-hover/item:text-white transition-colors">
                      {topic.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                    {topic.avgTimeSpent}M AVG PLUNGE
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                Analyzing performance metrics...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/topics"
          className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Continue Journey
        </Link>
      </div>
    </div>
  );
}
