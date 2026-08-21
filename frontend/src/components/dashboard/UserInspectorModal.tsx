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
import { soundEffects } from "@/lib/soundEffects";

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
    if (floors > 20)
      return {
        title: "Grand Cyber Architect",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      };
    if (floors > 10)
      return {
        title: "Skyscraper Master",
        color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      };
    if (floors > 3)
      return {
        title: "Urban Developer",
        color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      };
    return {
      title: "Foundation Builder",
      color: "text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-secondary)]",
    };
  };

  const tier = getTitleTier(user.completedLevels);

  // Estimate question breakdown
  const estEasy = user.completedLevels * 2;
  const estMedium = user.completedLevels * 2;
  const estHard = user.completedLevels * 1;
  const estTotal = estEasy + estMedium + estHard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
        {/* Banner Header */}
        <div className="p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] relative">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/40 flex items-center justify-center shadow-inner text-2xl font-black text-[var(--accent-primary)]">
              {rank === 1 ? "👑" : `#${rank}`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  {user.username}
                </h2>
                {isMe && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    You
                  </span>
                )}
              </div>
              <div
                className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${tier.color}`}
              >
                <Sparkles className="w-3 h-3" />
                {tier.title}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                  Floors Built
                </div>
                <div className="text-xl font-black text-[var(--text-primary)] font-display">
                  {user.completedLevels}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                  Estimated Solves
                </div>
                <div className="text-xl font-black text-[var(--text-primary)] font-display">
                  {estTotal}
                </div>
              </div>
            </div>
          </div>

          {/* Problem Difficulty Breakdown */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3 font-mono text-xs">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
              Estimated Question Distribution
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-emerald-400 font-black text-sm">{estEasy}</div>
                <div className="text-[9px] text-[var(--text-muted)] font-bold">EASY</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-amber-400 font-black text-sm">{estMedium}</div>
                <div className="text-[9px] text-[var(--text-muted)] font-bold">MEDIUM</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-rose-400 font-black text-sm">{estHard}</div>
                <div className="text-[9px] text-[var(--text-muted)] font-bold">HARD</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--accent-primary)] text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
