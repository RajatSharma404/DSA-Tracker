"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import Link from "next/link";
import {
  Brain,
  RefreshCw,
  Target,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  BookOpen,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Layers,
  Compass,
  Cpu,
  Sliders,
  Send,
  Building2,
} from "lucide-react";
import { getDifficultyStyle } from "@/lib/design-tokens";
import { toast } from "sonner";

interface NextAction {
  mode: "REVISION" | "WEAKNESS" | "BUILD_MOMENTUM" | "BALANCED";
  title: string;
  topic: string;
  reason: string;
  cta: string;
  difficulty: string;
  estimatedMinutes: number;
}

interface DayPlan {
  day: string;
  focus: string;
  problems: string[];
}

interface Recommendation {
  weakTopics: string[];
  strongTopics?: string[];
  weakTopicBreakdown?: Array<{
    name: string;
    solved: number;
    total: number;
    completionPct: number;
  }>;
  strongTopicBreakdown?: Array<{
    name: string;
    solved: number;
    total: number;
    completionPct: number;
  }>;
  realTime?: {
    generatedAt: string;
    totalSolved: number;
    solvedLast7d: number;
    solvedLast30d: number;
  };
  suggestedProblems: Array<{
    title: string;
    reason: string;
    difficulty: string;
    topic: string;
  }>;
  weeklyPlan: DayPlan[];
  tips: string[];
  nextAction?: NextAction;
}

const getDiffBadgeClass = (d: string) => {
  const upper = (d || "MEDIUM").toUpperCase();
  if (upper.includes("EASY")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (upper.includes("HARD")) return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
};

export default function RecommendationsPage() {
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"problems" | "blueprint" | "weakness">("problems");
  const [goalSolved, setGoalSolved] = useState(75);
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    const savedGoal = window.localStorage.getItem("dsa-goal-solved");
    const savedDate = window.localStorage.getItem("dsa-goal-date");
    if (savedGoal) setGoalSolved(Number(savedGoal) || 75);
    if (savedDate) setTargetDate(savedDate);
    fetchRecommendations();
  }, []);

  const saveGoalPlan = (val: number, dateStr: string) => {
    setGoalSolved(val);
    setTargetDate(dateStr);
    window.localStorage.setItem("dsa-goal-solved", String(val));
    window.localStorage.setItem("dsa-goal-date", dateStr);
    toast.success("Goal plan updated!");
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dsaApi.getRecommendations();
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load AI recommendations");
      toast.error("Could not generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const currentSolved = data?.realTime?.totalSolved || 0;
  const remainingForGoal = Math.max(0, goalSolved - currentSolved);

  if (loading) {
    return (
      <div className="w-full space-y-8 min-w-0 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-4xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Brain size={48} className="text-purple-400" />
        <h2 className="text-xl font-bold text-white">Couldn&apos;t generate AI recommendations</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition-all cursor-pointer"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu size={13} />
            <span>Neural Algorithmic Mentor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            AI Recommendations
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Personalized learning paths dynamically generated by analyzing your accuracy, speed, and topic retention.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-300 transition-all border border-white/5 hover:border-white/15 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Regenerate Insights
        </button>
      </div>

      {/* Hero AI Command Center */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/20 bg-linear-to-r from-[#140b22] via-[#0e0d18] to-[#070914] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Priority Next Action */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Sparkles size={14} />
              <span>Recommended Priority Mission</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {data.nextAction?.title || "Target Weakest Topic: " + (data.weakTopics[0] || "Arrays")}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
                {data.nextAction?.reason || "Strengthening your foundational invariant recognition will unlock higher velocity in medium and hard problems."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {data.nextAction?.cta || "Practice Recommended Topic"}
                <ArrowRight size={14} />
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400">
                <Clock size={14} className="text-purple-400" />
                <span>Est: {data.nextAction?.estimatedMinutes || 30} mins</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-md space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Velocity Snapshot</span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 font-bold">Last 7 Days</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {data.realTime?.solvedLast7d ?? 0}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 font-bold">Total Solved</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">
                  {data.realTime?.totalSolved ?? 0}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
              <Flame size={13} className="text-orange-400" />
              <span>Pace is aligned with FAANG onsite preparation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab("problems")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "problems"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-inner"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Target size={14} className="text-purple-400" />
          Suggested Problem Sets ({data.suggestedProblems.length})
        </button>

        <button
          onClick={() => setActiveTab("blueprint")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "blueprint"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-inner"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar size={14} className="text-blue-400" />
          7-Day Study Blueprint
        </button>

        <button
          onClick={() => setActiveTab("weakness")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "weakness"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <AlertTriangle size={14} className="text-amber-400" />
          Topic Weakness Breakdown
        </button>
      </div>

      {/* Tab 1: Suggested Problems */}
      {activeTab === "problems" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.suggestedProblems.map((prob, i) => {
            return (
              <div
                key={i}
                className="p-6 rounded-3xl border border-white/5 bg-[#0a0a0f] hover:border-purple-500/30 hover:bg-[#0e0d16] transition-all flex flex-col justify-between space-y-4 shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold">{prob.topic}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDiffBadgeClass(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {prob.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                    <Sparkles size={12} /> High Yield
                  </span>
                  <Link
                    href={`/search?q=${encodeURIComponent(prob.title)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 group-hover:bg-purple-500/20 text-xs font-bold text-white group-hover:text-purple-300 transition-all border border-white/5 group-hover:border-purple-500/30"
                  >
                    Solve Now
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 7-Day Study Blueprint */}
      {activeTab === "blueprint" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {data.weeklyPlan.map((day, i) => (
              <div
                key={i}
                className="p-4 rounded-3xl border border-white/5 bg-[#0a0a0f] flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider">
                    {day.day}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight mt-2">{day.focus}</h4>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  {day.problems.map((p, pIdx) => (
                    <div key={pIdx} className="text-[10px] text-gray-400 truncate">
                      • {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Goal Calculator */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Target Problem Goal Calculator</h3>
                <p className="text-xs text-gray-400">Set your interview readiness target milestone.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Target Solved Total</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={goalSolved}
                  onChange={(e) => saveGoalPlan(Number(e.target.value) || 50, targetDate)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Remaining to Goal</span>
                <div className="text-xl font-black text-cyan-400">{remainingForGoal} problems</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Pace Requirement</span>
                <div className="text-xl font-black text-white">~2 problems / day</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Topic Weakness Breakdown */}
      {activeTab === "weakness" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl border border-red-500/15 bg-[#0a0a0f] space-y-4">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> High Priority Weak Topics
            </h3>
            <div className="space-y-3">
              {(data.weakTopicBreakdown || []).map((t, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <span>{t.name}</span>
                    <span className="text-red-400">{t.solved} / {t.total} solved ({t.completionPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${t.completionPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-emerald-500/15 bg-[#0a0a0f] space-y-4">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={18} /> Strong & Mastered Topics
            </h3>
            <div className="space-y-3">
              {(data.strongTopicBreakdown || []).map((t, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <span>{t.name}</span>
                    <span className="text-emerald-400">{t.solved} / {t.total} solved ({t.completionPct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${t.completionPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pro Mentorship Advice Cards */}
      <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] p-6 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen size={16} className="text-cyan-400" />
          High-Yield Algorithmic Mental Models
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {(data.tips || [
            "Before coding, state the loop invariant out loud to prevent off-by-one errors.",
            "If searching in sorted or monotonic space, immediately consider Binary Search on Answer.",
            "For cyclic graphs or topological dependencies, reach for Kahn's algorithm or 3-color DFS.",
          ]).map((tip, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed">
              💡 {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
