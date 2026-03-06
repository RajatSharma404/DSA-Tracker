"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
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
} from "lucide-react";

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

const DIFF_STYLES: Record<
  string,
  { bg: string; text: string; border: string; bar: string }
> = {
  EASY: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    bar: "bg-green-500",
  },
  MEDIUM: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    bar: "bg-yellow-500",
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

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [analytics, prod] = await Promise.all([
        dsaApi.getTimeAnalytics(),
        dsaApi.getProductivityAnalytics().catch(() => null),
      ]);
      setData(analytics);
      setProductivity(prod);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
          <span className="text-sm font-bold text-gray-500">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  if (!data || data.totalSolved === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Timer size={48} className="text-gray-800" />
        <h2 className="text-xl font-black text-gray-500 uppercase">
          No Data Yet
        </h2>
        <p className="text-sm text-gray-600 max-w-md text-center">
          Complete some problems with time tracking to see your speed analytics
          here.
        </p>
      </div>
    );
  }

  const maxWeeklyAvg = Math.max(...data.weeklyTrends.map((w) => w.avgTime), 1);
  const maxTopicTime = Math.max(
    ...data.topicBreakdown.map((t) => t.totalTime),
    1,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/20">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Time Analytics
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Speed · Trends · Insights
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-indigo-400" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
              Total Time
            </span>
          </div>
          <p className="text-2xl font-black text-white">
            {formatTime(data.totalTimeMinutes)}
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            {data.totalSolved} problems solved
          </p>
        </div>

        {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => {
          const style = DIFF_STYLES[diff];
          const avg = data.avgByDifficulty[diff];
          return (
            <div
              key={diff}
              className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} className={style.text} />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  Avg {diff}
                </span>
              </div>
              <p className="text-2xl font-black text-white">
                {avg > 0 ? `${avg}m` : "—"}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase ${style.bg} ${style.text} border ${style.border}`}
              >
                {diff}
              </span>
            </div>
          );
        })}
      </div>

      {/* Speed Insights */}
      <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} className="text-amber-400" />
          <span className="text-xs font-black text-white uppercase tracking-tight">
            Speed Comparison
          </span>
          <span className="text-[9px] text-gray-600 font-medium ml-2">
            Last 2 weeks vs previous 2 weeks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.speedInsights.map((insight) => {
            const style = DIFF_STYLES[insight.difficulty];
            const isImproved = insight.change > 0;
            const isSlower = insight.change < 0;
            const hasData = insight.recentAvg > 0 && insight.olderAvg > 0;

            return (
              <div
                key={insight.difficulty}
                className={`p-5 rounded-2xl border ${style.border} ${style.bg}`}
              >
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}
                >
                  {insight.difficulty}
                </span>

                {hasData ? (
                  <>
                    <div className="flex items-end gap-2 mt-3 mb-1">
                      <span className="text-2xl font-black text-white">
                        {Math.abs(insight.change)}%
                      </span>
                      {isImproved ? (
                        <span className="flex items-center gap-0.5 text-green-400 text-[10px] font-black mb-1">
                          <TrendingUp size={12} /> FASTER
                        </span>
                      ) : isSlower ? (
                        <span className="flex items-center gap-0.5 text-red-400 text-[10px] font-black mb-1">
                          <TrendingDown size={12} /> SLOWER
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-gray-400 text-[10px] font-black mb-1">
                          <Minus size={12} /> SAME
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span>
                        {insight.olderAvg}m → {insight.recentAvg}m
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-gray-600 mt-3 italic">
                    {insight.recentAvg > 0
                      ? `Avg: ${insight.recentAvg}m (no prior data)`
                      : "Not enough data"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-blue-400" />
          <span className="text-xs font-black text-white uppercase tracking-tight">
            Weekly Solve Time Trend
          </span>
          <span className="text-[9px] text-gray-600 font-medium ml-2">
            Last 8 weeks · Avg minutes per problem
          </span>
        </div>

        {/* Custom Bar Chart */}
        <div className="flex items-end gap-3 h-48">
          {data.weeklyTrends.map((w, i) => {
            const barHeight =
              maxWeeklyAvg > 0 ? (w.avgTime / maxWeeklyAvg) * 100 : 0;
            const hasSolves = w.solved > 0;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                {/* Tooltip */}
                <div className="hidden group-hover:block text-center animate-in fade-in duration-200">
                  <span className="text-[10px] font-black text-white">
                    {w.avgTime > 0 ? `${w.avgTime}m` : "—"}
                  </span>
                  <span className="block text-[8px] text-gray-600">
                    {w.solved} solved
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end flex-1">
                  <div
                    className={`w-full max-w-10 rounded-t-lg transition-all duration-500 ${
                      hasSolves
                        ? "bg-linear-to-t from-indigo-600 to-blue-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                        : "bg-white/5"
                    }`}
                    style={{
                      height: hasSolves ? `${Math.max(barHeight, 8)}%` : "4%",
                    }}
                  />
                </div>
                {/* Label */}
                <span className="text-[9px] font-bold text-gray-600">
                  {w.week}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
          {data.weeklyTrends.filter((w) => w.solved > 0).length > 0 && (
            <>
              <div className="text-[10px] text-gray-500">
                <span className="font-bold text-gray-400">Best week:</span>{" "}
                {(() => {
                  const best = data.weeklyTrends
                    .filter((w) => w.solved > 0)
                    .sort((a, b) => a.avgTime - b.avgTime)[0];
                  return best ? `${best.week} (${best.avgTime}m avg)` : "—";
                })()}
              </div>
              <div className="text-[10px] text-gray-500">
                <span className="font-bold text-gray-400">Most active:</span>{" "}
                {(() => {
                  const most = [...data.weeklyTrends].sort(
                    (a, b) => b.solved - a.solved,
                  )[0];
                  return most ? `${most.week} (${most.solved} problems)` : "—";
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Grid: Topic Breakdown + Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Breakdown */}
        <div className="lg:col-span-2 p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Brain size={16} className="text-purple-400" />
            <span className="text-xs font-black text-white uppercase tracking-tight">
              Time by Topic
            </span>
          </div>
          <div className="space-y-3">
            {data.topicBreakdown.slice(0, 10).map((t, i) => {
              const pct = (t.totalTime / maxTopicTime) * 100;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-300 truncate max-w-50">
                      {t.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-gray-600">
                        {t.count} solved
                      </span>
                      <span className="text-[10px] font-black text-white">
                        {formatTime(t.totalTime)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topicBreakdown.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8 italic">
                No topic data yet
              </p>
            )}
          </div>
        </div>

        {/* Records */}
        <div className="space-y-4">
          {/* Fastest */}
          {data.fastest && (
            <div className="p-5 bg-[#0a0a0f] border border-green-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={14} className="text-green-400" />
                <span className="text-[9px] font-black text-green-400/70 uppercase tracking-widest">
                  Speed Record
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1 wrap-break-word">
                {data.fastest.title}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${DIFF_STYLES[data.fastest.difficulty]?.bg} ${DIFF_STYLES[data.fastest.difficulty]?.text} border ${DIFF_STYLES[data.fastest.difficulty]?.border}`}
                >
                  {data.fastest.difficulty}
                </span>
                <span className="text-[10px] text-gray-500">
                  {data.fastest.topicName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <ArrowUpRight size={14} className="text-green-400" />
                <span className="text-lg font-black text-green-400">
                  {data.fastest.timeSpent}m
                </span>
              </div>
            </div>
          )}

          {/* Slowest */}
          {data.slowest && (
            <div className="p-5 bg-[#0a0a0f] border border-red-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Snail size={14} className="text-red-400" />
                <span className="text-[9px] font-black text-red-400/70 uppercase tracking-widest">
                  Toughest Battle
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1 wrap-break-word">
                {data.slowest.title}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${DIFF_STYLES[data.slowest.difficulty]?.bg} ${DIFF_STYLES[data.slowest.difficulty]?.text} border ${DIFF_STYLES[data.slowest.difficulty]?.border}`}
                >
                  {data.slowest.difficulty}
                </span>
                <span className="text-[10px] text-gray-500">
                  {data.slowest.topicName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <ArrowDownRight size={14} className="text-red-400" />
                <span className="text-lg font-black text-red-400">
                  {data.slowest.timeSpent}m
                </span>
              </div>
            </div>
          )}

          {/* Avg per problem overall */}
          <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Timer size={14} className="text-gray-400" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                Overall Average
              </span>
            </div>
            <p className="text-2xl font-black text-white">
              {data.totalSolved > 0
                ? `${Math.round(data.totalTimeMinutes / data.totalSolved)}m`
                : "—"}
            </p>
            <p className="text-[10px] text-gray-600 mt-1">per problem</p>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      {productivity && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <span className="text-xs font-black text-white uppercase tracking-tight">
              Productivity Insights
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Time of Day */}
            {productivity.productivityByHour &&
              productivity.productivityByHour.length > 0 && (
                <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                    Solve Activity by Hour
                  </h3>
                  <div className="flex items-end gap-1 h-32">
                    {productivity.productivityByHour.map(
                      (h: any, i: number) => {
                        const maxCount = Math.max(
                          ...productivity.productivityByHour.map(
                            (x: any) => x._count || 0,
                          ),
                          1,
                        );
                        const pct = ((h._count || 0) / maxCount) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-1 group"
                          >
                            <div className="hidden group-hover:block text-[8px] text-white font-bold">
                              {h._count}
                            </div>
                            <div className="w-full flex flex-col justify-end flex-1">
                              <div
                                className="w-full rounded-t bg-linear-to-t from-cyan-600 to-cyan-400 transition-all"
                                style={{ height: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                            {i % 4 === 0 && (
                              <span className="text-[7px] text-gray-600">
                                {h.hour || i}h
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

            {/* Difficulty Distribution */}
            {productivity.difficultyDistribution &&
  Array.isArray(productivity.difficultyDistribution) &&
  productivity.difficultyDistribution.length > 0 &&  (
              <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                  Difficulty Distribution
                </h3>
                <div className="space-y-4">
                  {productivity.difficultyDistribution.map((d: any) => {
                    const total = productivity.difficultyDistribution.reduce(
                      (s: number, x: any) => s + (x._count || 0),
                      0,
                    );
                    const pct = total > 0 ? ((d._count || 0) / total) * 100 : 0;
                    const style = DIFF_STYLES[d.difficulty] || DIFF_STYLES.EASY;
                    return (
                      <div key={d.difficulty}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black ${style.text}`}>
                            {d.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {d._count} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${style.bar} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Score Trends */}
          {productivity.scoreTrends && productivity.scoreTrends.length > 0 && (
            <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-yellow-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-tight">
                  Score Trends (Recent Solutions)
                </h3>
              </div>
              <div className="flex items-end gap-2 h-40">
                {productivity.scoreTrends.map((s: any, i: number) => {
                  const score = s.score || 0;
                  const color =
                    score >= 80
                      ? "from-green-600 to-green-400"
                      : score >= 50
                        ? "from-yellow-600 to-yellow-400"
                        : "from-red-600 to-red-400";
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 group max-w-12"
                    >
                      <div className="hidden group-hover:block text-[10px] text-white font-bold">
                        {score}
                      </div>
                      <div className="w-full flex flex-col justify-end flex-1">
                        <div
                          className={`w-full rounded-t bg-linear-to-t ${color} transition-all`}
                          style={{ height: `${Math.max(score, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Latest {productivity.scoreTrends.length} submissions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
