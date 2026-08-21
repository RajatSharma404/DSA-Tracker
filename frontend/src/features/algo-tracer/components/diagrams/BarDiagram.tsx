"use client";

import React from "react";
import { TraceStep } from "../../types";

interface BarDiagramProps {
  step: TraceStep;
  allSteps?: TraceStep[];
  currentIndex?: number;
}

export function BarDiagram({
  step,
  allSteps = [],
  currentIndex = 0,
}: BarDiagramProps) {
  const arrayState =
    step.arrayState && step.arrayState.length > 0
      ? step.arrayState
      : [5, 3, 8, 1, 9, 2, 4];
  const maxVal = Math.max(...arrayState.map((v) => Math.abs(v)), 1);

  const comparing = step.highlighting?.comparing || [];
  const swapping = step.highlighting?.swapping || [];
  const sorted = step.highlighting?.sorted || [];
  const pivot = step.highlighting?.pivot;

  const comparisonsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "compare").length;
  const swapsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "swap").length;

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 sm:p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
      {/* Counters & Legend */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Compare
          </div>
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Swap
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Sorted
          </div>
          {pivot !== null && pivot !== undefined && (
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Pivot
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">
            C: <strong className="text-[var(--accent-primary)]">{comparisonsCount}</strong>
          </span>
          <span className="text-[var(--text-muted)]">
            S: <strong className="text-amber-400">{swapsCount}</strong>
          </span>
        </div>
      </div>

      {/* Bar Canvas - full height flex container */}
      <div className="flex-1 h-full min-h-0 flex items-end justify-center gap-2 sm:gap-3 py-2 px-2 overflow-x-auto">
        {arrayState.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sorted.includes(idx);
          const isPivot = pivot === idx;

          const heightPercent = Math.max(
            15,
            Math.round((Math.abs(val) / maxVal) * 85),
          );

          let barColor = "bg-[var(--bg-secondary)] border-[var(--border-subtle)]";
          let textColor = "text-[var(--text-secondary)]";
          let glowEffect = "";

          if (isSorted) {
            barColor = "bg-emerald-500 border-emerald-400";
            textColor = "text-emerald-400 font-extrabold";
            glowEffect = "shadow-[0_0_10px_rgba(16,185,129,0.35)]";
          } else if (isSwapping) {
            barColor = "bg-rose-500 border-rose-400 animate-bounce";
            textColor = "text-rose-300 font-extrabold";
            glowEffect = "shadow-[0_0_12px_rgba(244,63,94,0.5)]";
          } else if (isComparing) {
            barColor = "bg-amber-500 border-amber-400";
            textColor = "text-amber-300 font-extrabold";
            glowEffect = "shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-[1.02]";
          } else if (isPivot) {
            barColor = "bg-purple-500 border-purple-400";
            textColor = "text-purple-300 font-extrabold";
            glowEffect = "shadow-[0_0_12px_rgba(168,85,247,0.5)]";
          }

          return (
            <div
              key={idx}
              className="h-full flex flex-col justify-end items-center gap-1.5 flex-1 max-w-14 min-w-7 transition-all duration-200"
            >
              {/* Value label above bar */}
              <span className={`text-[11px] font-mono font-bold ${textColor}`}>
                {val}
              </span>

              {/* Bar itself with relative height */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-xl border-t-2 border-l-2 border-r-2 ${barColor} ${glowEffect} transition-all duration-200 flex items-start justify-center pt-1 min-h-3`}
              >
                {isPivot && (
                  <span className="text-[9px] font-black text-black font-mono">
                    P
                  </span>
                )}
              </div>

              {/* Index label below bar */}
              <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
