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
    <div className="p-6 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -ml-12 -mt-12 group-hover:bg-amber-500/10 transition-all duration-700" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white tracking-tight uppercase flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />
          Badges
          <span className="text-[9px] font-bold text-gray-600 ml-1">
            {unlocked}/{total}
          </span>
        </h3>
        <Link
          href="/achievements"
          className="flex items-center gap-1 text-[9px] font-black text-amber-400/60 uppercase tracking-widest hover:text-amber-400 transition-colors"
        >
          View All <ArrowRight size={10} />
        </Link>
      </div>

      {/* Unlocked Badges Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {unlockedBadges.map((b) => (
          <div
            key={b.id}
            className="badge-3d w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg cursor-default"
            title={b.name}
          >
            {b.icon}
          </div>
        ))}
        {unlocked > 6 && (
          <span className="text-[10px] font-black text-gray-500 ml-1">
            +{unlocked - 6}
          </span>
        )}
        {unlocked === 0 && (
          <p className="text-[11px] text-gray-600 italic">
            Solve your first problem to earn a badge!
          </p>
        )}
      </div>

      {/* Next Badge Hint */}
      {nextLocked && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <span className="text-sm grayscale opacity-40">
            {nextLocked.icon}
          </span>
          <span className="text-[9px] text-gray-600 font-medium">
            Next:{" "}
            <span className="text-gray-400 font-bold">{nextLocked.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}
