"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export default function BadgeShowcase() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlocked, setUnlocked] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    dsaApi
      .getAchievements()
      .then((d) => {
        setBadges(d.badges);
        setUnlocked(d.stats.unlocked);
        setTotal(d.stats.totalBadges);
      })
      .catch(() => {});
  }, []);

  const unlockedBadges = badges.filter((b) => b.unlocked).slice(0, 6);
  const nextLocked = badges.find((b) => !b.unlocked && (b.progress || 0) > 0);

  if (badges.length === 0) return null;

  return (
    <div className="p-6 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -ml-12 -mt-12 group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase flex items-center gap-2 font-display">
          <Trophy size={16} className="text-amber-400" />
          Badges
          <span className="text-[9px] font-bold text-[var(--text-muted)] font-mono ml-1">
            {unlocked}/{total}
          </span>
        </h3>
        <Link
          href="/achievements"
          className="flex items-center gap-1 text-[9px] font-black text-amber-400/80 uppercase tracking-widest hover:text-amber-400 transition-colors"
        >
          View All <ArrowRight size={10} />
        </Link>
      </div>

      {/* Unlocked Badges Row */}
      <div className="flex items-center gap-2 flex-wrap relative z-10">
        {unlockedBadges.map((b, idx) => (
          <div
            key={b.id}
            style={{ animationDelay: `${idx * 60}ms` }}
            className="badge-pop w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 hover:scale-110 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)] flex items-center justify-center text-lg cursor-default transition-all duration-200"
            data-tooltip={b.name}
          >
            {b.icon}
          </div>
        ))}
        {unlocked > 6 && (
          <span className="text-[10px] font-black text-[var(--text-muted)] font-mono ml-1">
            +{unlocked - 6}
          </span>
        )}
        {unlocked === 0 && (
          <p className="text-[11px] text-[var(--text-muted)] italic">
            Solve your first problem to earn a badge!
          </p>
        )}
      </div>

      {/* Next Badge Hint */}
      {nextLocked && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 relative z-10">
          <span className="text-sm grayscale opacity-40">
            {nextLocked.icon}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-medium">
            Next:{" "}
            <span className="text-[var(--text-secondary)] font-bold">{nextLocked.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}
