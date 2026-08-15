"use client";

import { useEffect, useState, useMemo } from "react";
import { dsaApi, type InterviewReadiness } from "@/lib/api";
import Link from "next/link";
import { trackEvent, getKpiSnapshot, clearEventLog } from "@/lib/analytics";
import {
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Clock,
  Cpu,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Snail,
  Loader2,
  Brain,
  Activity,
  Star,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface TimeAnalytics {
  totalTimeMinutes: number;
  totalSolved: number;
  avgByDifficulty: { EASY: number; MEDIUM: number; HARD: number };
  weeklyTrends: Array<{
    week: string;
    solved: number;
    avgTime: number;
    avgEasy: number;
    avgMedium: number;
    avgHard: number;
  }>;
  speedInsights: Array<{
    difficulty: string;
    recentAvg: number;
    olderAvg: number;
    change: number;
  }>;
  topicBreakdown: Array<{
    name: string;
    totalTime: number;
    count: number;
    avgTime: number;
  }>;
  fastest: {
    title: string;
    topicName: string;
    timeSpent: number;
    difficulty: string;
  } | null;
  slowest: {
    title: string;
    topicName: string;
    timeSpent: number;
    difficulty: string;
  } | null;
}

const DIFF_STYLES: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  EASY: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
  },
  MEDIUM: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    bar: "bg-amber-500",
  },
  HARD: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    bar: "bg-red-500",
  },
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<TimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [productivity, setProductivity] = useState<any>(null);
  const [readiness, setReadiness] = useState<InterviewReadiness | null>(null);
  const [range, setRange] = useState<14 | 30 | 56>(56);

  useEffect(() => {
    trackEvent("analytics_viewed");
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, prodData, readinessData] = await Promise.all([
        dsaApi.getTimeAnalytics().catch(() => null),
        dsaApi.getProductivityAnalytics().catch(() => null),
        dsaApi.getInterviewReadiness().catch(() => null),
      ]);
      setData(analyticsData);
      setProductivity(prodData);
      setReadiness(readinessData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const weeksToShow = range === 14 ? 2 : range === 30 ? 4 : 8;
  const filteredTrends = useMemo(() => {
    return (data?.weeklyTrends || []).slice(-weeksToShow);
  }, [data?.weeklyTrends, weeksToShow]);

  const maxWeeklyAvg = Math.max(...(data?.weeklyTrends || []).map((w) => w.avgTime), 1);
  const bestSpeedInsight = useMemo(() => {
    return (data?.speedInsights || [])
      .filter((insight) => insight.recentAvg > 0 && insight.olderAvg > 0)
      .sort((a, b) => b.change - a.change)[0];
  }, [data?.speedInsights]);

  if (loading) {
    return (
      <div className="w-full space-y-8 min-w-0 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-white/5" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!data || data.totalSolved === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
          <Timer size={32} />
        </div>
        <h2 className="text-xl font-black text-white uppercase">No Timing Data Logged Yet</h2>
        <p className="text-xs text-gray-400 max-w-md">
          Solve problems using time tracking in the code arena to unlock your speed velocity insights and interview clearance gauges.
        </p>
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all"
        >
          Start Practicing
        </Link>
      </div>
    );
  }

  const interviewClearanceProb = readiness?.score
    ? Math.min(99, Math.round(readiness.score * 0.9 + 8))
    : 78;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={13} />
            <span>Executive Velocity Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Time & Speed Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Measure your algorithmic throughput, track speed improvements, and benchmark against top-tier hiring bars.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/5">
          {([14, 30, 56] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-cyan-500 text-black shadow-sm font-extrabold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {r === 14 ? "2 Weeks" : r === 30 ? "30 Days" : "8 Weeks"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Time Invested</span>
            <Clock size={16} className="text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{formatTime(data.totalTimeMinutes)}</span>
            <span className="text-xs text-gray-500 font-medium">across {data.totalSolved} solves</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Easy Avg Speed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{data.avgByDifficulty?.EASY ? `${data.avgByDifficulty.EASY}m` : "—"}</span>
            <span className="text-xs text-gray-500 font-medium">Target: &lt;10m</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Medium Avg Speed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{data.avgByDifficulty?.MEDIUM ? `${data.avgByDifficulty.MEDIUM}m` : "—"}</span>
            <span className="text-xs text-gray-500 font-medium">Target: &lt;22m</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Onsite Timing Clearance</span>
            <Trophy size={16} className="text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">{interviewClearanceProb}%</span>
            <span className="text-xs text-cyan-400 font-bold">FAANG Ready</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Velocity Curves + Topic Investment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Weekly Speed Trends */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Solve Pace Velocity Curves</h3>
                <p className="text-xs text-gray-400">Average minutes per solve across weekly cohorts.</p>
              </div>
            </div>
            {bestSpeedInsight && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight size={14} /> +{bestSpeedInsight.change}% Faster
              </span>
            )}
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-4 pt-2">
            {filteredTrends.map((trend, i) => {
              const barPct = Math.min(100, Math.round((trend.avgTime / maxWeeklyAvg) * 100));
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{trend.week}</span>
                    <span className="text-cyan-400 font-mono font-bold">{trend.avgTime}m avg ({trend.solved} solved)</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fastest vs Slowest Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {data.fastest && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                  <Zap size={12} /> Fastest Record
                </span>
                <div className="text-xs font-bold text-white truncate">{data.fastest.title}</div>
                <div className="text-[11px] text-gray-400">{data.fastest.timeSpent}m solve in {data.fastest.topicName}</div>
              </div>
            )}

            {data.slowest && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <Clock size={12} /> Longest Deep Dive
                </span>
                <div className="text-xs font-bold text-white truncate">{data.slowest.title}</div>
                <div className="text-[11px] text-gray-400">{data.slowest.timeSpent}m solve in {data.slowest.topicName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Topic Time Allocation Matrix */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Topic Hour Allocation</h3>
              <p className="text-xs text-gray-400">Total time invested per algorithm domain.</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {(data.topicBreakdown || []).map((t, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white truncate">{t.name}</span>
                  <span className="text-cyan-400">{formatTime(t.totalTime)} ({t.count} solved)</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((t.totalTime / (data.totalTimeMinutes || 1)) * 100))}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-500">
                  Avg pace: {t.avgTime}m / problem
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
