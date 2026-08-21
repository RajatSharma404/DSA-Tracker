"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Star } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { soundEffects } from "@/lib/soundEffects";

export type CityLevelProgress = {
  id: string;
  name: string;
  isCompleted: boolean;
  progress: {
    easy: { solved: number; required: number; total: number };
    medium: { solved: number; required: number; total: number };
    hard: { solved: number; required: number; total: number };
  };
};

export const CityLevelPath = ({ levels }: { levels: CityLevelProgress[] }) => {
  const [animatedLevels, setAnimatedLevels] = useState(levels);
  const [animatingLevelId, setAnimatingLevelId] = useState<string | null>(null);

  useEffect(() => {
    if (!animatingLevelId) {
      setAnimatedLevels(levels);
    }
  }, [levels, animatingLevelId]);

  useEffect(() => {
    const handleLevelCleared = () => {
      const currentIdx = animatedLevels.findIndex((l) => !l.isCompleted);
      if (currentIdx !== -1) {
        setAnimatingLevelId(animatedLevels[currentIdx].id);

        setTimeout(() => {
          setAnimatingLevelId(null);
        }, 800);
      }
    };
    window.addEventListener("levelCleared", handleLevelCleared);
    return () => window.removeEventListener("levelCleared", handleLevelCleared);
  }, [animatedLevels]);

  if (levels.length === 0) {
    return (
      <div className="text-center text-[var(--text-muted)] py-10 font-mono text-sm">
        No levels found.
      </div>
    );
  }

  const ITEM_HEIGHT = 160;
  const SVG_HEIGHT = Math.max(1, (levels.length - 1) * ITEM_HEIGHT);

  const getPosition = (index: number) => {
    const isLeft = index % 2 === 0;
    const x = isLeft ? 35 : 65;
    const y = index * ITEM_HEIGHT;
    return { x, y };
  };

  const pathD = levels.reduce((acc, _, idx) => {
    if (idx === 0) return `M 35 0`;
    const prev = getPosition(idx - 1);
    const curr = getPosition(idx);
    const controlY1 = prev.y + (curr.y - prev.y) / 2;
    const controlY2 = prev.y + (curr.y - prev.y) / 2;
    return `${acc} C ${prev.x} ${controlY1}, ${curr.x} ${controlY2}, ${curr.x} ${curr.y}`;
  }, "");

  const completedPathD = animatedLevels.reduce((acc, level, idx) => {
    if (idx === 0) return `M 35 0`;
    const isPrevComplete =
      animatedLevels[idx - 1].isCompleted ||
      animatingLevelId === animatedLevels[idx - 1].id;
    if (!isPrevComplete) return acc;

    const prev = getPosition(idx - 1);
    const curr = getPosition(idx);
    const controlY1 = prev.y + (curr.y - prev.y) / 2;
    const controlY2 = prev.y + (curr.y - prev.y) / 2;
    return `${acc} C ${prev.x} ${controlY1}, ${curr.x} ${controlY2}, ${curr.x} ${curr.y}`;
  }, "");

  const renderDots = (level: CityLevelProgress, isAnimating: boolean) => {
    const dots = [
      ...Array(level.progress.easy.required).fill({
        type: "easy",
        filled: false,
      }),
      ...Array(level.progress.medium.required).fill({
        type: "medium",
        filled: false,
      }),
      ...Array(level.progress.hard.required).fill({
        type: "hard",
        filled: false,
      }),
    ];

    let easySolved = Math.min(
      level.progress.easy.solved,
      level.progress.easy.required,
    );
    let mediumSolved = Math.min(
      level.progress.medium.solved,
      level.progress.medium.required,
    );
    let hardSolved = Math.min(
      level.progress.hard.solved,
      level.progress.hard.required,
    );

    if (isAnimating) {
      easySolved = level.progress.easy.required;
      mediumSolved = level.progress.medium.required;
      hardSolved = level.progress.hard.required;
    }

    let easyIdx = 0,
      mediumIdx = 0,
      hardIdx = 0;
    for (const dot of dots) {
      if (dot.type === "easy" && easyIdx < easySolved) {
        dot.filled = true;
        easyIdx++;
      } else if (dot.type === "medium" && mediumIdx < mediumSolved) {
        dot.filled = true;
        mediumIdx++;
      } else if (dot.type === "hard" && hardIdx < hardSolved) {
        dot.filled = true;
        hardIdx++;
      }
    }

    const colors: Record<string, string> = {
      easy: "border-emerald-500 bg-emerald-500",
      medium: "border-amber-500 bg-amber-500",
      hard: "border-rose-500 bg-rose-500",
    };
    const hollow: Record<string, string> = {
      easy: "border-emerald-500/30 bg-transparent",
      medium: "border-amber-500/30 bg-transparent",
      hard: "border-rose-500/30 bg-transparent",
    };

    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {dots.map((dot, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full border-[1.5px] transition-colors duration-300 ${
              dot.filled ? colors[dot.type] : hollow[dot.type]
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full flex flex-col items-center py-10 overflow-hidden">
      <div
        className="relative w-full max-w-sm mx-auto"
        style={{ height: `${SVG_HEIGHT + 80}px` }}
      >
        <svg
          viewBox={`0 0 100 ${SVG_HEIGHT}`}
          className="absolute top-0 left-0 w-full"
          style={{ height: `${SVG_HEIGHT}px` }}
          preserveAspectRatio="none"
        >
          {/* Base Dashed Track */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="4"
            strokeDasharray="8 8"
          />
          {/* Completed Solid Track */}
          <path
            d={completedPathD}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="4"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>

        {animatedLevels.map((level, idx) => {
          const pos = getPosition(idx);
          const isUnlocked = idx === 0 || animatedLevels[idx - 1]?.isCompleted;
          const isAnimatingThis = animatingLevelId === level.id;
          const isCompleted = level.isCompleted || isAnimatingThis;
          const isCurrent = isUnlocked && !isCompleted;

          const baseNodeStyle =
            "relative flex items-center justify-center w-16 h-16 rounded-full border-4 shadow-xl transition-all duration-500 ease-out z-10";

          return (
            <div
              key={level.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}px` }}
            >
              {isUnlocked && renderDots(level, isAnimatingThis)}

              {/* Node Render */}
              {!isUnlocked ? (
                // Locked Node
                <div className="flex flex-col items-center gap-2 opacity-50 select-none">
                  <div
                    className={cn(
                      baseNodeStyle,
                      "bg-[var(--bg-secondary)] border-[var(--border-subtle)]",
                    )}
                  >
                    <Lock className="w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Locked
                  </span>
                </div>
              ) : isCurrent ? (
                // Current / In Progress
                <Link
                  href={`/city/${encodeURIComponent(level.id)}`}
                  onClick={() => soundEffects.playClick()}
                  className="flex flex-col items-center gap-2 group outline-none cursor-pointer"
                >
                  <div
                    className={cn(
                      baseNodeStyle,
                      "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] group-hover:scale-110 group-focus-visible:ring-4 ring-[var(--accent-primary)]/50 shadow-[0_0_15px_var(--accent-glow)]",
                    )}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-primary)]/20" />
                    <Star className="w-7 h-7 text-[var(--accent-primary)] fill-[var(--accent-primary)]/20" />
                  </div>
                  <span className="text-xs font-bold text-[var(--accent-primary)] drop-shadow-sm font-display">
                    {level.name}
                  </span>
                </Link>
              ) : (
                // Completed
                <Link
                  href={`/city/${encodeURIComponent(level.id)}`}
                  onClick={() => soundEffects.playClick()}
                  className="flex flex-col items-center gap-2 group outline-none cursor-pointer"
                >
                  <div
                    className={cn(
                      baseNodeStyle,
                      isAnimatingThis
                        ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] scale-110 shadow-[0_0_20px_var(--accent-glow)]"
                        : "bg-emerald-500 border-emerald-400 group-hover:scale-105 shadow-emerald-500/20",
                    )}
                  >
                    <CheckCircle2 className="w-8 h-8 text-black" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-display">
                    {level.name}
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
