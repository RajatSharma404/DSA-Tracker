"use client";

import React, { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import Link from "next/link";
import {
  Brain,
  Loader2,
  RefreshCw,
  Target,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface DayPlan {
  day: string;
  focus: string;
  problems: string[];
}

interface Recommendation {
  weakTopics: string[];
  suggestedProblems: Array<{
    title: string;
    reason: string;
    difficulty: string;
    topic: string;
  }>;
  weeklyPlan: DayPlan[];
  tips: string[];
}

export default function RecommendationsPage() {
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-300">
        <div className="relative">
          <Brain size={48} className="text-purple-400 animate-pulse" />
          <Loader2
            size={20}
            className="absolute -right-1 -bottom-1 text-blue-400 animate-spin"
          />
        </div>
        <h2 className="text-xl font-bold text-white">
          AI is analyzing your progress...
        </h2>
        <p className="text-gray-400 text-sm text-center max-w-md">
          Generating personalized recommendations based on your solve history,
          weak areas, and learning patterns.
        </p>
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
