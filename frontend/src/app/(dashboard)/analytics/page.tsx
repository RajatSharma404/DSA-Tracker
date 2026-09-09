"use client";

import { useEffect, useState, useMemo } from "react";
import { dsaApi, type InterviewReadiness } from "@/lib/api";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
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
  Target,
  Workflow,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import Editor from "@monaco-editor/react";
import { FlowchartPanel, type FlowchartData } from "@/components/FlowchartPanel";
import { CHART_TOKENS } from "@/lib/chartTokens";
import { generateAstFlowchart } from "@/lib/astFlowchartEngine";

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

interface TopicMasteryItem {
  topic: string;
  subject: string;
  percentage: number;
  value?: number;
  solved: number;
  total: number;
  fullMark?: number;
}

interface WeeklyVelocityStats {
  weeks: Array<{
    week: string;
    solved: number;
  }>;
  average: number;
}

interface DifficultyRampItem {
  month: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const SANDBOX_STARTERS: Record<string, string> = {
  python: `# Python function snippet
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
  cpp: `// C++ function snippet
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`,
  c: `// C function snippet
int binarySearch(int arr[], int n, int target) {
    int low = 0;
    int high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`,
};

// Recharts Custom Dark Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#12121a] p-3 shadow-2xl text-xs font-mono">
        {label && (
          <p className="font-bold text-white mb-2 border-b border-white/10 pb-1">
            {label}
          </p>
        )}
        {payload.map((entry: any, index: number) => {
          const color = entry.color || entry.fill || CHART_TOKENS.accent;
          return (
            <div key={index} className="flex items-center justify-between gap-3 py-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-400 capitalize">{entry.name}:</span>
              </div>
              <span className="font-bold text-white">
                {entry.value}
                {entry.name === "Mastery" ? "%" : ""}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<TimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [productivity, setProductivity] = useState<any>(null);
  const [readiness, setReadiness] = useState<InterviewReadiness | null>(null);
  const [range, setRange] = useState<14 | 30 | 56>(56);

  // New Charts Data State
  const [topicBreakdown, setTopicBreakdown] = useState<TopicMasteryItem[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyVelocityStats>({
    weeks: [],
    average: 0,
  });
  const [difficultyByMonth, setDifficultyByMonth] = useState<DifficultyRampItem[]>([]);

  // Task B: CodeVis Sandbox State
  const [sandboxLang, setSandboxLang] = useState<"python" | "c" | "cpp">("python");
  const [sandboxCode, setSandboxCode] = useState<string>(SANDBOX_STARTERS.python);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxFlowchart, setSandboxFlowchart] = useState<FlowchartData | null>(null);

  useEffect(() => {
    trackEvent("analytics_viewed");
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        analyticsData,
        prodData,
        readinessData,
        topicData,
        weeklyData,
        diffData,
      ] = await Promise.all([
        dsaApi.getTimeAnalytics().catch(() => null),
        dsaApi.getProductivityAnalytics().catch(() => null),
        dsaApi.getInterviewReadiness().catch(() => null),
        dsaApi.getTopicBreakdown().catch(() => []),
        dsaApi.getWeeklyStats().catch(() => ({ weeks: [], average: 0 })),
        dsaApi.getDifficultyByMonth().catch(() => []),
      ]);

      setData(analyticsData);
      setProductivity(prodData);
      setReadiness(readinessData);
      setTopicBreakdown(Array.isArray(topicData) ? topicData : []);

      if (weeklyData) {
        if (Array.isArray(weeklyData)) {
          const avg =
            weeklyData.length > 0
              ? Math.round(
                  (weeklyData.reduce((acc, w) => acc + (w.solved || 0), 0) /
                    weeklyData.length) *
                    10,
                ) / 10
              : 0;
          setWeeklyStats({ weeks: weeklyData, average: avg });
        } else {
          setWeeklyStats({
            weeks: weeklyData.weeks || [],
            average: weeklyData.average || 0,
          });
        }
      }

      setDifficultyByMonth(Array.isArray(diffData) ? diffData : []);
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

  const maxWeeklyAvg = Math.max(
    ...(data?.weeklyTrends || []).map((w) => w.avgTime),
    1,
  );
  const bestSpeedInsight = useMemo(() => {
    return (data?.speedInsights || [])
      .filter((insight) => insight.recentAvg > 0 && insight.olderAvg > 0)
      .sort((a, b) => b.change - a.change)[0];
  }, [data?.speedInsights]);

  // Topic Mastery Radar Chart Fallback Data
  const radarChartData = useMemo(() => {
    if (topicBreakdown.length > 0) {
      return topicBreakdown.map((t) => ({
        subject: t.subject || t.topic,
        percentage: t.percentage ?? t.value ?? 0,
        solved: t.solved,
        total: t.total,
      }));
    }
    // Default preview topics if user has zero problem history yet
    return [
      { subject: "Arrays", percentage: 0 },
      { subject: "Strings", percentage: 0 },
      { subject: "Trees", percentage: 0 },
      { subject: "DP", percentage: 0 },
      { subject: "Graphs", percentage: 0 },
      { subject: "Binary Search", percentage: 0 },
    ];
  }, [topicBreakdown]);

  // Handle CodeVis Sandbox Language Switch
  const handleSandboxLangChange = (lang: "python" | "c" | "cpp") => {
    setSandboxLang(lang);
    setSandboxCode(SANDBOX_STARTERS[lang]);
    setSandboxFlowchart(null);
  };

  // Handle CodeVis Flowchart Generation in Sandbox
  const handleGenerateSandboxFlowchart = async () => {
    if (!sandboxCode.trim()) {
      toast.error("Please provide code to visualize.");
      return;
    }

    try {
      setSandboxLoading(true);
      let flowchartResult: FlowchartData | null = null;

      try {
        const response = await fetch(
          "https://codevis-backend.onrender.com/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lang: sandboxLang,
              code: sandboxCode,
            }),
          },
        );

        if (response.ok) {
          flowchartResult = await response.json();
        }
      } catch (networkErr) {
        console.warn(
          "Remote CodeVis API unreachable, falling back to local AST engine:",
          networkErr instanceof Error ? networkErr.message : String(networkErr)
        );
      }

      // Fall back to built-in AST Control Flow generator if remote service unavailable or failed
      if (
        !flowchartResult ||
        !flowchartResult.nodes ||
        flowchartResult.nodes.length === 0
      ) {
        flowchartResult = generateAstFlowchart(sandboxCode, sandboxLang);
      }

      if (
        flowchartResult &&
        flowchartResult.nodes &&
        flowchartResult.nodes.length > 0
      ) {
        setSandboxFlowchart(flowchartResult);
        soundEffects.playSuccess();
        toast.success("Flowchart generated successfully!");
      } else {
        toast.error("Flowchart generation failed. Check your code syntax.");
      }
    } catch (err) {
      console.warn(
        "CodeVis sandbox error:",
        err instanceof Error ? err.message : String(err)
      );
      toast.error("Flowchart generation failed. Check your code syntax.");
    } finally {
      setSandboxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-8 min-w-0 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-[var(--bg-secondary)]" />
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

  const interviewClearanceProb = readiness?.score
    ? Math.min(99, Math.round(readiness.score * 0.9 + 8))
    : 78;

  const hasNoTimingData = !data || data.totalSolved === 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 w-full min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Activity size={13} />
            <span>Executive Velocity Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Analysis & Stats Arena
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Measure your algorithmic throughput, track speed improvements, and benchmark against top-tier hiring bars.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono">
          {([14, 30, 56] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                soundEffects.playClick();
                setRange(r);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-[var(--accent-primary)] text-black shadow-sm font-extrabold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {r === 14 ? "2 Weeks" : r === 30 ? "30 Days" : "8 Weeks"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Total Time</span>
            <Clock size={16} className="text-[var(--accent-primary)]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-display">
              {data ? formatTime(data.totalTimeMinutes) : "0m"}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              across {data ? data.totalSolved : 0} solves
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Easy Avg Speed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-display">
              {data?.avgByDifficulty?.EASY
                ? `${data.avgByDifficulty.EASY}m`
                : "—"}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium font-mono">
              Target: &lt;10m
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Medium Avg Speed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-display">
              {data?.avgByDifficulty?.MEDIUM
                ? `${data.avgByDifficulty.MEDIUM}m`
                : "—"}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium font-mono">
              Target: &lt;22m
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Clearance Readiness</span>
            <Trophy size={16} className="text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400 font-display">
              {interviewClearanceProb}%
            </span>
            <span className="text-xs text-[var(--accent-primary)] font-bold font-mono">
              FAANG Ready
            </span>
          </div>
        </div>
      </div>

      {hasNoTimingData && (
        <div className="p-4 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-primary)] text-black">
              <Timer size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Live Speed Tracking Available in Code Arena
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Solve problems with timer mode active to populate your personal solve velocity curves.
              </p>
            </div>
          </div>
          <Link
            href="/topics"
            onClick={() => soundEffects.playClick()}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-black text-xs font-bold font-mono hover:opacity-90 transition-all shrink-0"
          >
            Practice in Arena
          </Link>
        </div>
      )}

      {/* Main Grid: Weekly Velocity Curves + Topic Investment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Weekly Speed Trends */}
        <div className="lg:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Solve Pace Velocity Curves
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Average minutes per solve across weekly cohorts.
                </p>
              </div>
            </div>
            {bestSpeedInsight && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                <ArrowUpRight size={14} /> +{bestSpeedInsight.change}% Faster
              </span>
            )}
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-4 pt-2">
            {filteredTrends.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-8 text-center font-mono">
                No weekly velocity trends recorded yet.
              </p>
            ) : (
              filteredTrends.map((trend, i) => {
                const barPct = Math.min(
                  100,
                  Math.round((trend.avgTime / maxWeeklyAvg) * 100),
                );
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-[var(--text-primary)]">
                        {trend.week}
                      </span>
                      <span className="text-[var(--accent-primary)] font-mono font-bold">
                        {trend.avgTime}m avg ({trend.solved} solved)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Fastest vs Slowest Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {data?.fastest && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1 font-mono">
                  <Zap size={12} /> Fastest Record
                </span>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate font-display">
                  {data.fastest.title}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {data.fastest.timeSpent}m solve in {data.fastest.topicName}
                </div>
              </div>
            )}

            {data?.slowest && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1 font-mono">
                  <Clock size={12} /> Longest Deep Dive
                </span>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate font-display">
                  {data.slowest.title}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {data.slowest.timeSpent}m solve in {data.slowest.topicName}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Topic Time Allocation Matrix */}
        <div className="lg:col-span-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                Topic Hour Allocation
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Total time invested per algorithm domain.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {(data?.topicBreakdown || []).length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-8 text-center font-mono">
                No topic hours logged yet.
              </p>
            ) : (
              (data?.topicBreakdown || []).map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-[var(--text-primary)] truncate">
                      {t.name}
                    </span>
                    <span className="text-[var(--accent-primary)]">
                      {formatTime(t.totalTime)} ({t.count} solved)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-primary)] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (t.totalTime / (data?.totalTimeMinutes || 1)) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">
                    Avg pace: {t.avgTime}m / problem
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          TASK A: 3 NEW RECHARTS CHARTS
          ──────────────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Layers size={13} />
            <span>Interactive Visual Diagnostics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight font-display">
            Algorithmic Growth Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time multi-dimensional tracking across domain mastery, weekly completion velocity, and difficulty ramp.
          </p>
        </div>

        {/* Row 1: Radar Chart (5 cols) + Weekly Solve Velocity (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CHART 1: Topic Mastery Radar */}
          <div className="lg:col-span-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Topic Mastery Radar
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Multi-axis mastery percentage across algorithm categories.
                </p>
              </div>
            </div>

            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={radarChartData}
                >
                  <PolarGrid stroke={CHART_TOKENS.grid} strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: CHART_TOKENS.text,
                      fontSize: 10.5,
                      fontWeight: 600,
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke={CHART_TOKENS.grid}
                    tick={{ fill: CHART_TOKENS.axis, fontSize: 9 }}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Radar
                    name="Mastery"
                    dataKey="percentage"
                    stroke={CHART_TOKENS.accent}
                    fill={CHART_TOKENS.accent}
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Weekly Solve Velocity */}
          <div className="lg:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                    Weekly Solve Velocity
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    8-week problem completion rate with average pace benchmark.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                Avg: <span className="text-[var(--accent-primary)] font-black">{weeklyStats.average}</span> / wk
              </span>
            </div>

            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyStats.weeks}
                  margin={{ top: 15, right: 25, left: -15, bottom: 25 }}
                >
                  <CartesianGrid
                    stroke={CHART_TOKENS.grid}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    stroke={CHART_TOKENS.axis}
                    tick={{ fill: CHART_TOKENS.text, fontSize: 10 }}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    stroke={CHART_TOKENS.axis}
                    tick={{ fill: CHART_TOKENS.text, fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <ReferenceLine
                    y={weeklyStats.average}
                    stroke={CHART_TOKENS.referenceLine}
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Avg: ${weeklyStats.average}`,
                      fill: CHART_TOKENS.referenceLine,
                      position: "top",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    name="Problems Solved"
                    dataKey="solved"
                    stroke={CHART_TOKENS.accent}
                    strokeWidth={3}
                    dot={{
                      fill: CHART_TOKENS.accent,
                      r: 4,
                      strokeWidth: 1,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#fff",
                      stroke: CHART_TOKENS.accent,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHART 3: Difficulty Ramp (Stacked Bar Chart) */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                Difficulty Ramp
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Monthly progression across Easy, Medium, and Hard problem tiers.
              </p>
            </div>
          </div>

          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={difficultyByMonth}
                margin={{ top: 15, right: 25, left: -15, bottom: 10 }}
              >
                <CartesianGrid
                  stroke={CHART_TOKENS.grid}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke={CHART_TOKENS.axis}
                  tick={{ fill: CHART_TOKENS.text, fontSize: 11 }}
                />
                <YAxis
                  stroke={CHART_TOKENS.axis}
                  tick={{ fill: CHART_TOKENS.text, fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="easy"
                  name="Easy"
                  stackId="diffStack"
                  fill={CHART_TOKENS.easy}
                />
                <Bar
                  dataKey="medium"
                  name="Medium"
                  stackId="diffStack"
                  fill={CHART_TOKENS.medium}
                />
                <Bar
                  dataKey="hard"
                  name="Hard"
                  stackId="diffStack"
                  fill={CHART_TOKENS.hard}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          TASK B: CODEVIS SANDBOX SECTION
          ──────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-display">
              <span>🔀 Visualize Any Code</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Paste any snippet to see its control flow
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            {(["python", "c", "cpp"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleSandboxLangChange(lang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  sandboxLang === lang
                    ? "bg-white text-black shadow-md"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang === "python" ? "Python" : lang === "cpp" ? "C++" : "C"}
              </button>
            ))}
          </div>
        </div>

        {/* Monaco Editor (200px height) */}
        <div className="h-[200px] rounded-2xl overflow-hidden border border-white/10">
          <Editor
            height="100%"
            theme="vs-dark"
            language={
              sandboxLang === "cpp"
                ? "cpp"
                : sandboxLang === "c"
                  ? "c"
                  : "python"
            }
            value={sandboxCode}
            onChange={(val) => setSandboxCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              roundedSelection: true,
              lineNumbers: "on",
              automaticLayout: true,
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-[11px] text-gray-500 font-mono">
            Standalone sandbox • Supports Python, C, and C++ syntax
          </span>
          <button
            type="button"
            onClick={handleGenerateSandboxFlowchart}
            disabled={sandboxLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {sandboxLoading ? (
              <>
                <Loader2 size={15} className="animate-spin text-black" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Workflow size={15} />
                <span>Generate Flowchart</span>
              </>
            )}
          </button>
        </div>

        {/* Flowchart Output Area */}
        {sandboxFlowchart && (
          <div className="h-[480px] rounded-2xl overflow-hidden border border-white/10 mt-4 animate-in fade-in duration-300">
            <FlowchartPanel
              data={sandboxFlowchart}
              onClose={() => setSandboxFlowchart(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
