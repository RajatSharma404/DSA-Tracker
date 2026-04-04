"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";

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

export default function RecommendationsPage() {
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalSolved, setGoalSolved] = useState(50);
  const [goalDate, setGoalDate] = useState("");

  useEffect(() => {
    const savedGoalSolved = window.localStorage.getItem("dsa-goal-solved");
    const savedGoalDate = window.localStorage.getItem("dsa-goal-date");
    if (savedGoalSolved) {
      setGoalSolved(Number(savedGoalSolved) || 50);
    }
    if (savedGoalDate) {
      setGoalDate(savedGoalDate);
    }
  }, []);

  const saveGoalPlan = () => {
    window.localStorage.setItem("dsa-goal-solved", String(goalSolved));
    window.localStorage.setItem("dsa-goal-date", goalDate);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dsaApi.getRecommendations();
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getDifficultyColor = (d: string) => {
    const lower = d.toLowerCase();
    if (lower.includes("easy"))
      return "text-green-400 bg-green-500/10 border-green-500/20";
    if (lower.includes("medium"))
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-72 rounded-full bg-white/5" />
            <div className="h-4 w-96 max-w-full rounded-full bg-white/5" />
          </div>
          <div className="h-10 w-40 rounded-xl bg-white/5" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-48 rounded-3xl border border-white/5 bg-white/5" />
          <div className="h-48 rounded-3xl border border-white/5 bg-white/5" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-2xl border border-white/5 bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Brain size={48} className="text-gray-600" />
        <h2 className="text-xl font-bold text-white">
          Couldn&apos;t generate recommendations
        </h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/30 transition-colors"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain size={28} className="text-purple-400" />
            AI Recommendations
          </h1>
          <p className="text-gray-400 mt-2">
            Personalized study plan based on your progress and patterns.
          </p>
          {data.realTime?.generatedAt && (
            <p className="text-[10px] text-gray-500 mt-1">
              Real-time snapshot:{" "}
              {new Date(data.realTime.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/30 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {data.nextAction && (
        <div className="relative overflow-hidden rounded-4xl border border-cyan-500/15 bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-[#0d0d0d] p-6">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                <Target size={12} />
                Next Best Action
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                {data.nextAction.title}
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                {data.nextAction.reason}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-85 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Mode
                </p>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-cyan-300">
                  {data.nextAction.mode.replaceAll("_", " ")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Topic
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {data.nextAction.topic}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Estimate
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {data.nextAction.estimatedMinutes} min
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-[#0d0d0d] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Goal Planner</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5">
            Set a target solved count and a deadline. The planner will show the
            pace you need from here.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Target solved
              </span>
              <input
                type="number"
                min={1}
                value={goalSolved}
                onChange={(e) => setGoalSolved(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Target date
              </span>
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-blue-400"
              />
            </label>
          </div>
          <button
            onClick={saveGoalPlan}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
          >
            Save goal
          </button>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#0d0d0d] p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Plan Preview
          </h3>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <p>Current solved: {data.realTime?.totalSolved || 0}</p>
            <p>
              Remaining to goal:{" "}
              {Math.max(0, goalSolved - (data.realTime?.totalSolved || 0))}
            </p>
            {goalDate ? (
              <p>Deadline: {new Date(goalDate).toLocaleDateString()}</p>
            ) : (
              <p>No deadline saved yet.</p>
            )}
            <p>
              Recommended focus: one review problem, one weakness problem, one
              timed interview block.
            </p>
          </div>
        </div>
      </div>

      {/* Weak Topics */}
      {data.weakTopics && data.weakTopics.length > 0 && (
        <div className="p-6 rounded-2xl bg-linear-to-br from-red-500/5 to-orange-500/5 border border-red-500/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Target size={18} className="text-red-400" />
            Areas to Focus
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.weakTopics.map((topic, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
          {data.weakTopicBreakdown && data.weakTopicBreakdown.length > 0 && (
            <div className="grid md:grid-cols-2 gap-2 mt-4">
              {data.weakTopicBreakdown.map((topic) => (
                <div
                  key={topic.name}
                  className="p-3 rounded-xl border border-red-500/20 bg-black/20"
                >
                  <p className="text-xs font-bold text-white">{topic.name}</p>
                  <p className="text-[11px] text-red-300 mt-1">
                    {topic.solved}/{topic.total} solved (
                    {Math.round(topic.completionPct)}%)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strong Topics */}
      {data.strongTopics && data.strongTopics.length > 0 && (
        <div className="p-6 rounded-2xl bg-linear-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-400" />
            Strong Points
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.strongTopics.map((topic, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
          {data.strongTopicBreakdown &&
            data.strongTopicBreakdown.length > 0 && (
              <div className="grid md:grid-cols-2 gap-2 mt-4">
                {data.strongTopicBreakdown.map((topic) => (
                  <div
                    key={topic.name}
                    className="p-3 rounded-xl border border-green-500/20 bg-black/20"
                  >
                    <p className="text-xs font-bold text-white">{topic.name}</p>
                    <p className="text-[11px] text-green-300 mt-1">
                      {topic.solved}/{topic.total} solved (
                      {Math.round(topic.completionPct)}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {data.realTime && (
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-white/10 bg-[#0d0d0d]">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Total Solved
            </p>
            <p className="text-2xl font-black text-white mt-1">
              {data.realTime.totalSolved}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-[#0d0d0d]">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Solved Last 7 Days
            </p>
            <p className="text-2xl font-black text-blue-300 mt-1">
              {data.realTime.solvedLast7d}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-[#0d0d0d]">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Solved Last 30 Days
            </p>
            <p className="text-2xl font-black text-purple-300 mt-1">
              {data.realTime.solvedLast30d}
            </p>
          </div>
        </div>
      )}

      {/* Suggested Problems */}
      {data.suggestedProblems && data.suggestedProblems.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Zap size={18} className="text-yellow-400" />
            Recommended Problems
          </h2>
          <div className="grid gap-3">
            {data.suggestedProblems.map((problem, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white text-sm">
                        {problem.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                      <span className="text-xs text-gray-600">
                        {problem.topic}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{problem.reason}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan */}
      {data.weeklyPlan && data.weeklyPlan.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-blue-400" />
            Your Weekly Plan
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {data.weeklyPlan.map((day, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#0d0d0d] border border-white/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    {day.day}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {day.focus}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {day.problems.map((p, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <div className="w-1 h-1 rounded-full bg-purple-400" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <div className="p-6 rounded-2xl bg-linear-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-purple-400" />
            Study Tips
          </h2>
          <div className="space-y-3">
            {data.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <TrendingUp
                  size={14}
                  className="text-purple-400 mt-0.5 shrink-0"
                />
                <p className="text-sm text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
