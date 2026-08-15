"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import {
  Award,
  Lock,
  Trophy,
  Flame,
  Star,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Crown,
  CheckCircle2,
  Layers,
  Compass,
  Brain,
  Sliders,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  progress?: number;
}

interface AchievementsData {
  badges: Badge[];
  stats: {
    totalBadges: number;
    unlocked: number;
    totalSolved: number;
    currentStreak: number;
    longestStreak: number;
    completedTopics: number;
  };
}

const CATEGORY_ORDER = [
  "All",
  "Milestones",
  "Consistency",
  "Difficulty",
  "Exploration",
  "Mastery",
];

const CATEGORY_ICONS: Record<string, any> = {
  All: Trophy,
  Milestones: Target,
  Consistency: Flame,
  Difficulty: Zap,
  Exploration: Compass,
  Mastery: Brain,
};

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    dsaApi
      .getAchievements()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load achievements");
        setLoading(false);
      });
  }, []);

  // Gamified EXP & Level computation
  const totalUnlocked = data?.stats.unlocked || 0;
  const totalSolved = data?.stats.totalSolved || 0;
  const totalBadgesCount = data?.stats.totalBadges || 1;
  const completionPct = Math.round((totalUnlocked / totalBadgesCount) * 100);

  const totalExp = useMemo(() => {
    return totalUnlocked * 150 + totalSolved * 25;
  }, [totalUnlocked, totalSolved]);

  const playerLevel = Math.max(1, Math.floor(totalExp / 350) + 1);
  const expIntoCurrentLevel = totalExp % 350;
  const levelProgressPct = Math.min(100, Math.round((expIntoCurrentLevel / 350) * 100));

  const rankTitle = useMemo(() => {
    if (playerLevel >= 25) return "Grandmaster Challenger";
    if (playerLevel >= 18) return "Algorithmic Warlord";
    if (playerLevel >= 12) return "Diamond Code Architect";
    if (playerLevel >= 6) return "Platinum Problem Solver";
    return "Apprentice Gladiator";
  }, [playerLevel]);

  const filteredBadges = useMemo(() => {
    if (!data?.badges) return [];
    if (activeCategory === "All") return data.badges;
    return data.badges.filter((b) => b.category === activeCategory);
  }, [data?.badges, activeCategory]);

  if (loading) {
    return (
      <div className="w-full space-y-8 min-w-0 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-white/5" />
        <div className="h-44 rounded-[2.5rem] bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy size={13} />
            <span>Gladiator Trophy Hall</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Achievements & Badges
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Unlock rare algorithmic honors, conquer milestone bounties, and ascend the gladiator ranks.
          </p>
        </div>
      </div>

      {/* Hero EXP & Player Rank Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-linear-to-r from-[#181206] via-[#100d14] to-[#070914] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Level Info (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-amber-500/30 to-yellow-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/10">
                {playerLevel}
              </div>
              <div>
                <div className="text-xs uppercase font-black tracking-widest text-amber-400">
                  Level {playerLevel} • {rankTitle}
                </div>
                <h2 className="text-2xl font-black text-white">{totalExp} Total EXP</h2>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                <span>Next Rank Progress</span>
                <span className="text-amber-400">{expIntoCurrentLevel} / 350 EXP ({levelProgressPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Trophy Stats (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <div className="p-4 rounded-3xl bg-black/50 border border-white/5 backdrop-blur-md text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Unlocked</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{totalUnlocked}/{totalBadgesCount}</div>
            </div>
            <div className="p-4 rounded-3xl bg-black/50 border border-white/5 backdrop-blur-md text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Streak</span>
              <div className="text-2xl font-black text-orange-400 mt-1">{data.stats.currentStreak}d</div>
            </div>
            <div className="p-4 rounded-3xl bg-black/50 border border-white/5 backdrop-blur-md text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Mastery</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{completionPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
        {CATEGORY_ORDER.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Award;
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} className={isSelected ? "text-amber-400" : "text-gray-500"} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-md ${
                isUnlocked
                  ? "bg-linear-to-b from-[#161208] via-[#0d0d12] to-[#070912] border-amber-500/30 hover:border-amber-500/50 shadow-amber-500/5"
                  : "bg-[#0a0a0f] border-white/5 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shadow-inner ${
                    isUnlocked
                      ? "bg-linear-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400"
                      : "bg-white/5 border-white/10 text-gray-500"
                  }`}>
                    {isUnlocked ? (
                      <span>{badge.icon || "🏆"}</span>
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                    +150 EXP
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-extrabold ${isUnlocked ? "text-white" : "text-gray-400"}`}>
                    {badge.name}
                  </h3>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    {badge.category}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Status / Progress Footer */}
              <div className="pt-3 border-t border-white/5">
                {isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 size={14} />
                    <span>Unlocked & Mastered</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                      <span>Locked Challenge</span>
                      <span>In Progress</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-600 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
