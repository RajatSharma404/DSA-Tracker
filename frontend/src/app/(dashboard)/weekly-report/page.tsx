"use client";

import { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import {
  FileText,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  AlertTriangle,
  Star,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Award,
  Copy,
  Check,
  Share2,
  Layers,
  Brain,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface WeeklyReport {
  period: { start: string; end: string };
  summary: string;
  thisWeek: {
    solved: number;
    timeMinutes: number;
    diffBreakdown: { EASY: number; MEDIUM: number; HARD: number };
    topicsTouched: string[];
  };
  lastWeek: { solved: number };
  solvedChange: number;
  streak: { current: number; longest: number };
  overall: { totalSolved: number; totalProblems: number };
  weakTopics: Array<{
    name: string;
    total: number;
    solved: number;
    pct: number;
  }>;
  strongTopics: Array<{
    name: string;
    total: number;
    solved: number;
    pct: number;
  }>;
  topicProgress: Array<{
    name: string;
    total: number;
    solved: number;
    pct: number;
  }>;
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default function WeeklyReportPage() {
  const [data, setData] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dsaApi
      .getWeeklyReport()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load weekly report");
        setLoading(false);
      });
  }, []);

  const handleCopyReport = () => {
    if (!data) return;
    const text = `📊 DSA Weekly Report (${startDate} - ${endDate})\n• Solved: ${data.thisWeek.solved} problems (${data.solvedChange >= 0 ? "+" : ""}${data.solvedChange} vs last week)\n• Time Invested: ${formatMinutes(data.thisWeek.timeMinutes)}\n• Current Streak: ${data.streak.current} days\n• Overall Progress: ${overallPct}% mastered\n#DSA #LeetCode #CodingPrep`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Weekly summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="w-full space-y-8 min-w-0 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-white/5" />
        <div className="h-52 rounded-[2.5rem] bg-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const startDate = new Date(data.period.start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(data.period.end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const overallPct =
    data.overall.totalProblems > 0
      ? Math.round((data.overall.totalSolved / data.overall.totalProblems) * 100)
      : 0;

  const diffTotal =
    data.thisWeek.diffBreakdown.EASY +
    data.thisWeek.diffBreakdown.MEDIUM +
    data.thisWeek.diffBreakdown.HARD || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText size={13} />
            <span>Executive Performance Summary</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Weekly Progress Report
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Period: {startDate} — {endDate}
          </p>
        </div>

        <button
          onClick={handleCopyReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-200 transition-all border border-white/5 hover:border-white/15 cursor-pointer self-start sm:self-auto"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? "Copied to Clipboard!" : "Copy Report Card"}</span>
        </button>
      </div>

      {/* Hero Performance Briefing Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-500/20 bg-linear-to-r from-[#0a141f] via-[#0b0e18] to-[#070914] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles size={14} />
              <span>AI Executive Summary</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
              {data.summary || "Steady momentum this week! Your consistency is reinforcing core algorithmic patterns."}
            </h2>
            <p className="text-xs text-gray-400">
              Keep pushing through medium difficulty invariants to maximize your interview clearance odds.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-md text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-400">Global Mastery</span>
            <div className="text-3xl font-black text-cyan-400 mt-1">{overallPct}%</div>
            <span className="text-[11px] text-gray-500">{data.overall.totalSolved} / {data.overall.totalProblems} Solved</span>
          </div>
        </div>
      </div>

      {/* Key Metric Velocity Delta Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Problems Solved</span>
            <Target size={16} className="text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{data.thisWeek.solved}</span>
            <span className={`text-xs font-bold flex items-center ${
              data.solvedChange >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {data.solvedChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(data.solvedChange)} vs last week
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Time Invested</span>
            <Clock size={16} className="text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{formatMinutes(data.thisWeek.timeMinutes)}</span>
            <span className="text-xs text-gray-500 font-medium">this week</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Current Streak</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-400">{data.streak.current}</span>
            <span className="text-xs text-gray-500 font-medium">days (Best: {data.streak.longest}d)</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Topics Touched</span>
            <Layers size={16} className="text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">{data.thisWeek.topicsTouched.length}</span>
            <span className="text-xs text-gray-500 font-medium">domains</span>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown & Topic Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Difficulty Distribution (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-cyan-400" />
              Difficulty Distribution
            </h3>
            <span className="text-xs text-gray-500 font-bold">{data.thisWeek.solved} Total Solves</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-400">Easy</span>
              <div className="text-2xl font-black text-white mt-1">{data.thisWeek.diffBreakdown.EASY}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-amber-400">Medium</span>
              <div className="text-2xl font-black text-white mt-1">{data.thisWeek.diffBreakdown.MEDIUM}</div>
            </div>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-red-400">Hard</span>
              <div className="text-2xl font-black text-white mt-1">{data.thisWeek.diffBreakdown.HARD}</div>
            </div>
          </div>

          {/* Ratio Bar */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${(data.thisWeek.diffBreakdown.EASY / diffTotal) * 100}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${(data.thisWeek.diffBreakdown.MEDIUM / diffTotal) * 100}%` }} />
            <div className="bg-red-500 h-full" style={{ width: `${(data.thisWeek.diffBreakdown.HARD / diffTotal) * 100}%` }} />
          </div>
        </div>

        {/* Strengths & Growth Areas (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Brain size={18} className="text-purple-400" />
            Strategic Growth Roadmap
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Weakest Focus Areas for Next Week
              </span>
              <div className="flex flex-wrap gap-2">
                {data.weakTopics.length > 0 ? (
                  data.weakTopics.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 text-xs font-bold">
                      {t.name} ({t.pct}%)
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">All topic masteries well balanced!</span>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Mastered Top Strengths
              </span>
              <div className="flex flex-wrap gap-2">
                {data.strongTopics.length > 0 ? (
                  data.strongTopics.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                      {t.name} ({t.pct}%)
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Keep solving to solidify mastery tiers!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
