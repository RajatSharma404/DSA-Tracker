"use client";

import React, { useMemo } from "react";
import { soundEffects } from "@/lib/soundEffects";

interface StreakFlameProps {
  streakDays: number;
  size?: number;
  showBadge?: boolean;
  className?: string;
}

export function StreakFlame({
  streakDays,
  size = 28,
  showBadge = false,
  className = "",
}: StreakFlameProps) {
  // Determine Flame Milestone Tier
  const tier = useMemo(() => {
    if (streakDays >= 100) {
      return {
        level: 4,
        name: "Supernova",
        glow: "drop-shadow(0 0 14px rgba(234,179,8,0.85)) drop-shadow(0 0 24px rgba(249,115,22,0.6))",
        coreGradient: ["#fef08a", "#eab308", "#f97316", "#ef4444"],
        badgeText: "100d Supernova",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    }
    if (streakDays >= 30) {
      return {
        level: 3,
        name: "Plasma Flame",
        glow: "drop-shadow(0 0 12px rgba(168,85,247,0.75)) drop-shadow(0 0 18px rgba(6,182,212,0.6))",
        coreGradient: ["#c084fc", "#a855f7", "#06b6d4", "#3b82f6"],
        badgeText: "30d Plasma",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      };
    }
    if (streakDays >= 7) {
      return {
        level: 2,
        name: "Blaze Flame",
        glow: "drop-shadow(0 0 10px rgba(249,115,22,0.75)) drop-shadow(0 0 15px rgba(239,68,68,0.5))",
        coreGradient: ["#fde047", "#f97316", "#ef4444", "#b91c1c"],
        badgeText: "7d Blaze",
        badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      };
    }
    return {
      level: 1,
      name: "Spark Flame",
      glow: "drop-shadow(0 0 6px rgba(245,158,11,0.6))",
      coreGradient: ["#fef08a", "#f59e0b", "#d97706", "#b45309"],
      badgeText: "Active Streak",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }, [streakDays]);

  const uniqueId = useMemo(
    () => `streak-flame-${Math.random().toString(36).slice(2, 7)}`,
    [],
  );

  return (
    <div
      onClick={() => soundEffects.playSuccess()}
      className={`inline-flex items-center gap-2 select-none group cursor-pointer ${className}`}
      title={`${streakDays} Day Streak — ${tier.name}`}
    >
      <div
        className="relative flex items-center justify-center transition-transform group-hover:scale-115 active:scale-95 duration-200"
        style={{ width: size, height: size }}
      >
        {/* Tier 4 Celestial Rotating Aura */}
        {tier.level >= 4 && (
          <div
            className="absolute inset-0 rounded-full border border-amber-400/40 animate-spin"
            style={{ animationDuration: "6s" }}
          />
        )}

        {/* Tier 3 & 4 Radial Glow Pulsar */}
        {tier.level >= 3 && (
          <div
            className="absolute -inset-1 rounded-full opacity-60 animate-ping"
            style={{
              background:
                tier.level === 4
                  ? "radial-gradient(circle, rgba(234,179,8,0.4), transparent 70%)"
                  : "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)",
              animationDuration: "3s",
            }}
          />
        )}

        {/* Procedural SVG Flame */}
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="relative z-10 overflow-visible transition-all duration-300"
          style={{ filter: tier.glow }}
        >
          <defs>
            <linearGradient id={`${uniqueId}-grad`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={tier.coreGradient[3]} />
              <stop offset="40%" stopColor={tier.coreGradient[2]} />
              <stop offset="75%" stopColor={tier.coreGradient[1]} />
              <stop offset="100%" stopColor={tier.coreGradient[0]} />
            </linearGradient>
            <linearGradient id={`${uniqueId}-inner`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="70%" stopColor={tier.coreGradient[0]} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Outer Main Flame */}
          <path
            d="M12 2C10.5 4.5 9 6.5 9 9C9 10.5 9.8 11.5 10.5 12C9 12 7.5 13.5 7.5 15.5C7.5 18.5 9.5 21 12 21C14.5 21 16.5 18.5 16.5 15.5C16.5 13 15 11 14 9.5C13.5 8.5 13 6 12 2Z"
            fill={`url(#${uniqueId}-grad)`}
            className="animate-pulse"
            style={{ animationDuration: "2s" }}
          />

          {/* Inner Core Flame */}
          <path
            d="M12 11C11.2 12.2 10.5 13.5 10.5 15C10.5 16.8 11.2 18.5 12 18.5C12.8 18.5 13.5 16.8 13.5 15C13.5 13.5 12.8 12.2 12 11Z"
            fill={`url(#${uniqueId}-inner)`}
          />

          {/* Floating Embers for Tier 2+ */}
          {tier.level >= 2 && (
            <>
              <circle cx="8" cy="7" r="1" fill={tier.coreGradient[0]} className="animate-bounce" style={{ animationDuration: "1.8s" }} />
              <circle cx="16" cy="6" r="1.2" fill={tier.coreGradient[1]} className="animate-bounce" style={{ animationDuration: "2.3s" }} />
              <circle cx="12" cy="1" r="0.8" fill="#fff" className="animate-ping" style={{ animationDuration: "1.2s" }} />
            </>
          )}
        </svg>
      </div>

      {showBadge && (
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono border ${tier.badgeColor}`}
        >
          {tier.badgeText}
        </span>
      )}
    </div>
  );
}
