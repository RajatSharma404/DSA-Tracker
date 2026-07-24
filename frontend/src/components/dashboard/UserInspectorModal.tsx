"use client";

import React from "react";
import { LeaderboardUser } from "../3d/CityScene";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface UserInspectorModalProps {
  user: LeaderboardUser | null;
  currentUserId: string;
  rank: number;
  onClose: () => void;
  onViewPath?: (userId: string) => void;
}

export const UserInspectorModal: React.FC<UserInspectorModalProps> = ({
  user,
  currentUserId,
  rank,
  onClose,
  onViewPath,
}) => {
  if (!user) return null;

  const isMe = user.id === currentUserId;

  // Title tier based on floor height
  const getTitleTier = (floors: number) => {
    if (floors > 20) return { title: "Grand Cyber Architect", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    if (floors > 10) return { title: "Skyscraper Master", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" };
    if (floors > 3) return { title: "Urban Developer", color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" };
    return { title: "Foundation Builder", color: "text-slate-400 border-slate-700 bg-slate-800/40" };
  };

  const tier = getTitleTier(user.completedLevels);

  // Estimate question breakdown (5 per floor: 2 Easy, 2 Med, 1 Hard)
  const estEasy = user.completedLevels * 2;
  const estMedium = user.completedLevels * 2;
  const estHard = user.completedLevels * 1;
  const estTotal = estEasy + estMedium + estHard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-purple-900/40 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-inner text-2xl font-black text-indigo-300">
              {rank === 1 ? "👑" : `#${rank}`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                {isMe && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                    You
                  </span>
                )}
              </div>
              <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${tier.color}`}>
                <Sparkles className="w-3 h-3" />
                {tier.title}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Floors Built</div>
                <div className="text-xl font-black text-white">{user.completedLevels}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Global Rank</div>
                <div className="text-xl font-black text-white">#{rank}</div>
              </div>
            </div>
          </div>

          {/* Solved Problems Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Estimated Solved Questions
              </span>
              <span className="text-indigo-400 font-mono">{estTotal} Total</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Easy</div>
                <div className="text-base font-black text-white mt-0.5">{estEasy}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Medium</div>
                <div className="text-base font-black text-white mt-0.5">{estMedium}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Hard</div>
                <div className="text-base font-black text-white mt-0.5">{estHard}</div>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Last Active
            </span>
            <span className="font-semibold text-slate-200">
              {user.lastActivityDate
                ? new Date(user.lastActivityDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Active Today"}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            {onViewPath ? (
              <button
                onClick={() => {
                  onClose();
                  onViewPath(user.id);
                }}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                Inspect {user.username}&apos;s Path
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/city/1"
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                Enter City Path
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
