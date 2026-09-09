"use client";

import { useEffect, useState } from "react";
import { dsaApi, StreakStats } from "@/lib/api";
import { Flame, Trophy } from "lucide-react";
import { StreakFlame } from "@/components/ui/StreakFlame";

interface StreakCardProps {
  streak?: number;
  longestStreak?: number;
  className?: string;
}

export default function StreakCard({
  streak: propStreak,
  longestStreak: propLongest,
  className = "",
}: StreakCardProps) {
  const [data, setData] = useState<StreakStats>({
    currentStreak: propStreak ?? 0,
    longestStreak: propLongest ?? 0,
  });
  const [loading, setLoading] = useState(propStreak === undefined);

  useEffect(() => {
    if (propStreak !== undefined && propLongest !== undefined) {
      setData({
        currentStreak: propStreak,
        longestStreak: propLongest,
      });
      setLoading(false);
      return;
    }

    let isMounted = true;
    dsaApi
      .getStreak()
      .then((res) => {
        if (isMounted && res) {
          setData({
            currentStreak: res.currentStreak ?? 0,
            longestStreak: res.longestStreak ?? 0,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load streak stats:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propStreak, propLongest]);

  const currentStreak = propStreak ?? data.currentStreak;
  const longestStreak = propLongest ?? data.longestStreak;

  return (
    <div
      id="streak-card"
      className={`p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden transition-all duration-300 hover:border-[var(--border-medium)] group ${className}`}
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-[var(--accent-glow)] blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
            Daily Consistency
          </p>

          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-36 bg-[var(--bg-tertiary)] animate-pulse rounded-lg" />
            ) : currentStreak > 0 ? (
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-display tracking-tight flex items-center gap-2">
                <span>🔥 {currentStreak} day streak</span>
              </h3>
            ) : (
              <h3 className="text-xl font-black text-amber-400 font-display tracking-tight flex items-center gap-2">
                <span>Start your streak today!</span>
              </h3>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <Trophy size={13} className="text-amber-400 shrink-0" />
            <span>
              Longest streak:{" "}
              <strong className="text-[var(--text-secondary)] font-bold font-mono">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </strong>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)] group-hover:shadow-[0_0_15px_var(--accent-glow)] transition-all shrink-0">
          {currentStreak > 0 ? (
            <StreakFlame streakDays={currentStreak} size={28} />
          ) : (
            <Flame size={28} className="text-amber-400 opacity-80" />
          )}
        </div>
      </div>
    </div>
  );
}
export { StreakCard };
