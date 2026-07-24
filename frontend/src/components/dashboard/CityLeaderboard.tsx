"use client";

import React from "react";
import { LeaderboardUser } from "../3d/CityScene";
import { cn } from "@/lib/design-tokens";
import { cityAudio } from "@/lib/cityAudio";
import { Crown, Sparkles, Trophy } from "lucide-react";

const BuildingIcon = ({ levels, className }: { levels: number; className?: string }) => {
  if (levels === 0) {
    return <div className={cn("w-6 h-6 border-2 border-slate-700 bg-slate-800 rounded-sm", className)} />;
  }
  if (levels <= 5) {
    return (
      <svg className={cn("w-6 h-6 text-slate-400 drop-shadow-sm", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 12h16v12H4z" />
        <path d="M7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" fill="#0f172a" />
      </svg>
    );
  }
  if (levels <= 15) {
    return (
      <svg className={cn("w-6 h-6 text-indigo-400 drop-shadow-md", className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v18H6z" />
        <path d="M9 10h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2z" fill="#0f172a" />
      </svg>
    );
  }
  return (
    <svg className={cn("w-6 h-6 text-emerald-400 drop-shadow-lg", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 0h2v4h-2z" />
      <path d="M8 4h8v20H8z" />
      <path d="M10 7h1v2h-1zm3 0h1v2h-1zm-3 4h1v2h-1zm3 0h1v2h-1zm-3 4h1v2h-1zm3 0h1v2h-1zm-3 4h1v2h-1zm3 0h1v2h-1z" fill="#0f172a" />
    </svg>
  );
};

interface CityLeaderboardProps {
  users: LeaderboardUser[];
  currentUserId: string;
  hoveredUserId: string | null;
  onHoverUser: (id: string | null) => void;
  onClickUser: (id: string) => void;
}

export const CityLeaderboard = ({
  users,
  currentUserId,
  hoveredUserId,
  onHoverUser,
  onClickUser,
}: CityLeaderboardProps) => {
  const sortedUsers = [...users].sort((a, b) => b.completedLevels - a.completedLevels);

  return (
    <div className="flex flex-col gap-2 p-2">
      {sortedUsers.map((user, idx) => {
        const isMe = user.id === currentUserId;
        const isHovered = user.id === hoveredUserId;
        const rank = idx + 1;

        return (
          <button
            key={user.id}
            onMouseEnter={() => {
              onHoverUser(user.id);
              cityAudio.playHover();
            }}
            onMouseLeave={() => onHoverUser(null)}
            onClick={() => {
              cityAudio.playSelect();
              onClickUser(user.id);
            }}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 outline-none group",
              isMe
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : isHovered
                ? "bg-slate-800/80 border-slate-600/80 scale-[1.01]"
                : "bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700/50"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex items-center justify-center w-7 font-mono text-sm font-black",
                  rank === 1 ? "text-amber-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-slate-500"
                )}
              >
                {rank === 1 ? <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" /> : `#${rank}`}
              </div>
              <BuildingIcon levels={user.completedLevels} className="w-7 h-7" />
              <div className="flex flex-col">
                <span className={cn("font-bold text-sm flex items-center gap-1.5", isMe ? "text-indigo-300" : "text-slate-200")}>
                  {user.username} {isMe && <span className="text-sky-400 text-xs font-normal">(You)</span>}
                </span>
                {rank === 1 && (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Top Skyscraper
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-white">{user.completedLevels}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Floors</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
