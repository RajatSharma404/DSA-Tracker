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
    <div className="flex flex-col h-full w-full justify-between p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Counters & Legend */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
            Compare
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Swap
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
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

          let barColor = "bg-[var(--bg-tertiary)]";
          let textColor = "text-[var(--text-muted)]";
          const glowEffect = "";

          if (isSwapping) {
            barColor = "bg-rose-500";
            textColor = "text-rose-500 font-semibold";
          } else if (isComparing) {
            barColor = "bg-[var(--accent-primary)]";
            textColor = "text-[var(--text-primary)] font-semibold";
          } else if (isPivot) {
            barColor = "bg-violet-500";
            textColor = "text-violet-500 font-semibold";
          } else if (isSorted) {
            barColor = "bg-emerald-500/70";
            textColor = "text-emerald-500";
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
                className={`w-full rounded-t-md ${barColor} ${glowEffect} transition-[height,background-color] duration-200 flex items-start justify-center pt-1 min-h-3`}
              >
                {isPivot && (
                  <span className="text-[9px] font-semibold text-[var(--on-accent)] font-mono">
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
