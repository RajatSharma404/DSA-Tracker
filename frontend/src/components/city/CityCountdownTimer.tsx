"use client";

import React, { useState, useEffect } from "react";
import { Clock, Zap, Sparkles, Activity } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function CityCountdownTimer({ targetDate }: { targetDate?: Date }) {
  // Default target: 14 days from now if not specified
  const [target] = useState<number>(() => {
    if (targetDate) return targetDate.getTime();
    // 14 days from mounting
    return Date.now() + 14 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 42 * 60 * 1000;
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 14,
    hours: 7,
    minutes: 42,
    seconds: 0,
    milliseconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const difference = Math.max(0, target - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((difference % 1000) / 10);

      setTimeLeft({ days, hours, minutes, seconds, milliseconds });
    }, 43);

    return () => clearInterval(interval);
  }, [target]);

  const timeUnits = [
    { label: "DAYS", value: String(timeLeft.days).padStart(2, "0"), unit: "D" },
    { label: "HOURS", value: String(timeLeft.hours).padStart(2, "0"), unit: "H" },
    { label: "MINUTES", value: String(timeLeft.minutes).padStart(2, "0"), unit: "M" },
    { label: "SECONDS", value: String(timeLeft.seconds).padStart(2, "0"), unit: "S" },
    { label: "MILLISEC", value: String(timeLeft.milliseconds).padStart(2, "0"), unit: "MS" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-primary)]/30 bg-[var(--bg-card)]/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[var(--accent-secondary)]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header line */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)]">
            <Clock size={16} className="animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)] font-display">
                Beta Ignition Sequence
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse">
                STAGE 03
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Sector 07 Public Metropolitan Deployment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
          <Activity size={13} className="text-emerald-400 animate-pulse" />
          <span>HOLOGRID SYNC: <strong className="text-emerald-400">99.98%</strong></span>
        </div>
      </div>

      {/* Countdown Digits Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 pt-6 relative z-10">
        {timeUnits.map((unit, idx) => (
          <div
            key={unit.label}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
              idx === 4
                ? "col-span-2 sm:col-span-1 border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/10"
                : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]/70 hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div className="relative">
              <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {unit.value}
              </span>
              <span className="absolute -top-1 -right-3 text-[10px] font-mono font-bold text-[var(--accent-primary)] opacity-70">
                {unit.unit}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] mt-2">
              {unit.label}
            </span>

            {/* Micro scanline bar */}
            <div className="w-full h-0.5 bg-[var(--border-subtle)] mt-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-1000"
                style={{
                  width:
                    unit.label === "SECONDS"
                      ? `${(Number(unit.value) / 60) * 100}%`
                      : unit.label === "MINUTES"
                      ? `${(Number(unit.value) / 60) * 100}%`
                      : "100%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom status note */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border-subtle)]/60">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--accent-primary)]" />
          <span>Access tier unlocks in sequence. Early VIP Citizens receive instant day-1 district keys.</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-muted)]">PROTOCOL #DSA-SPATIAL-v3</span>
      </div>
    </div>
  );
}
