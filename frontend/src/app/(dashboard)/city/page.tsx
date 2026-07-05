"use client";

import React, { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import { CityScene } from "@/components/3d/CityScene";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Brain,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface LevelProgress {
  id: string;
  name: string;
  isCompleted: boolean;
  progress: {
    easy: { solved: number; required: number; total: number };
    medium: { solved: number; required: number; total: number };
    hard: { solved: number; required: number; total: number };
  };
}

export default function CityPage() {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState(0);
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [reducedEffects, setReducedEffects] = useState(false);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const data = await dsaApi.getCityProgress();
        setFloors(data.floors);
        setLevels(data.levels);
      } catch (error) {
        toast.error("Failed to load city progress");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCity();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };

    const evaluate = () => {
      const deviceMemory = navigatorWithMemory.deviceMemory ?? 8;
      const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
      setReducedEffects(
        media.matches || deviceMemory <= 4 || hardwareConcurrency <= 4,
      );
    };

    evaluate();
    media.addEventListener("change", evaluate);

    return () => media.removeEventListener("change", evaluate);
  }, []);

  // Generate mock leaderboard users for the DSA City Leaderboard
  const leaderboardUsers = [
    { id: "u1", username: "Rajat", completedLevels: Math.max(floors, 12), lastActivityDate: new Date().toISOString() },
    { id: "u2", username: "Alex", completedLevels: 24, lastActivityDate: "2026-07-01T10:00:00Z" },
    { id: "u3", username: "Sarah", completedLevels: 32, lastActivityDate: "2026-07-04T14:30:00Z" },
    { id: "u4", username: "John", completedLevels: 5, lastActivityDate: "2026-06-28T09:15:00Z" },
    { id: "u5", username: "Emma", completedLevels: 16, lastActivityDate: "2026-07-03T11:20:00Z" },
    { id: "u6", username: "David", completedLevels: 8, lastActivityDate: "2026-07-02T16:45:00Z" },
    { id: "u7", username: "Lisa", completedLevels: 2, lastActivityDate: "2026-06-15T08:00:00Z" },
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-h-250">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-sky-400">
            DSA City
          </h1>
          <p className="text-slate-400 mt-1">
            Build your city by mastering topics. Complete 5 questions (2 Easy, 2
            Medium, 1 Hard) per topic to build a floor!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* 3D Scene Container */}
          <div className="lg:w-3/5 h-100 lg:h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <CityScene
              users={leaderboardUsers}
              reducedEffects={reducedEffects}
            />
          </div>

          {/* Levels Sidebar */}
          <div className="lg:w-2/5 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Topic Levels
              </h2>
              <div className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-medium border border-indigo-500/30">
                {floors} Floors Built
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {levels.map((level, idx) => {
                const { easy, medium, hard } = level.progress;
                const totalSolved = easy.solved + medium.solved + hard.solved;
                const isUnlocked = idx === 0 || levels[idx - 1]?.isCompleted;
                const reqSolved =
                  Math.min(easy.solved, easy.required) +
                  Math.min(medium.solved, medium.required) +
                  Math.min(hard.solved, hard.required);
                const totalReq =
                  easy.required + medium.required + hard.required; // 5

                const percent = Math.round((reqSolved / totalReq) * 100);

                return (
                  <div
                    key={level.id}
                    className={`p-4 rounded-xl border transition-all ${level.isCompleted
                      ? "bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50"
                      : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-200 text-lg flex items-center gap-2">
                          <span className="text-slate-500 text-sm">
                            Lvl {idx + 1}
                          </span>
                          {level.name}
                        </h3>
                      </div>
                      {level.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${level.isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-400">
                        Solved {totalSolved}/{totalReq} questions for this floor
                      </p>

                      {/* Requirements */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div
                          className={`p-2 rounded-lg border ${easy.solved >= easy.required ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}
                        >
                          <div className="font-medium mb-1">Easy</div>
                          {Math.min(easy.solved, easy.required)}/{easy.required}
                        </div>
                        <div
                          className={`p-2 rounded-lg border ${medium.solved >= medium.required ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}
                        >
                          <div className="font-medium mb-1">Medium</div>
                          {Math.min(medium.solved, medium.required)}/
                          {medium.required}
                        </div>
                        <div
                          className={`p-2 rounded-lg border ${hard.solved >= hard.required ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}
                        >
                          <div className="font-medium mb-1">Hard</div>
                          {Math.min(hard.solved, hard.required)}/{hard.required}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isUnlocked ? (
                        <Link
                          href={`/city/${encodeURIComponent(level.id)}`}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Solve
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-700"
                        >
                          <Lock className="w-4 h-4" />
                          Solve
                        </button>
                      )}
                    </div>
                    {!isUnlocked && (
                      <p className="mt-3 text-xs text-amber-300/80 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Complete the previous floor to unlock this level.
                      </p>
                    )}
                  </div>
                );
              })}

              {levels.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  No levels found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
