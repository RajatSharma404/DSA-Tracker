"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import { Award, Lock, Loader2, Trophy, Flame, Star } from "lucide-react";

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

const CATEGORY_ORDER = ['Milestones', 'Consistency', 'Difficulty', 'Exploration', 'Mastery'];
const CATEGORY_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  Milestones:   { accent: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  Consistency:  { accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Difficulty:   { accent: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  Exploration:  { accent: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  Mastery:      { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dsaApi.getAchievements().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!data) return null;

  const pct = data.stats.totalBadges > 0 ? Math.round((data.stats.unlocked / data.stats.totalBadges) * 100) : 0;
  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    badges: data.badges.filter(b => b.category === cat),
  })).filter(g => g.badges.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 min-w-0">
      {/* Header + Stats */}
      <div className="p-8 rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-yellow-600/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/20">
              <Trophy size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Achievements</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                {data.stats.unlocked} of {data.stats.totalBadges} unlocked
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#gold)" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">{pct}%</span>
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-black text-white">{data.stats.totalSolved}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Solved</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-amber-400">{data.stats.longestStreak}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-purple-400">{data.stats.completedTopics}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Topics 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      {grouped.map(group => {
        const colors = CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Milestones;
        return (
          <div key={group.category}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-black uppercase tracking-widest ${colors.accent}`}>{group.category}</span>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] text-gray-600 font-bold">
                {group.badges.filter(b => b.unlocked).length}/{group.badges.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.badges.map(badge => (
                <div
                  key={badge.id}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                    badge.unlocked
                      ? `bg-[#0a0a0f] ${colors.border} hover:border-white/20 shadow-lg`
                      : 'bg-white/[0.01] border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${badge.unlocked ? '' : 'grayscale opacity-40'} transition-all`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white truncate">{badge.name}</h4>
                        {!badge.unlocked && <Lock size={10} className="text-gray-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{badge.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Progress</span>
                        <span className="text-[9px] font-black text-gray-400">{Math.round(badge.progress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${badge.unlocked ? 'bg-amber-500' : 'bg-gray-600'}`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Indicator */}
                  {badge.unlocked && (
                    <div className="absolute top-3 right-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
