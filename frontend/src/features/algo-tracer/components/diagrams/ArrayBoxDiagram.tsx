"use client";

import React from "react";
import { TraceStep } from "../../types";
import { CheckCircle2, Crosshair } from "lucide-react";

interface ArrayBoxDiagramProps {
  step: TraceStep;
}

export function ArrayBoxDiagram({ step }: ArrayBoxDiagramProps) {
  const arrayState =
    step.arrayState && step.arrayState.length > 0
      ? step.arrayState
      : [2, 5, 8, 12, 16, 23, 38, 56];

  const foundIndex = step.highlighting?.found;
  const pivot = step.highlighting?.pivot;
  const comparing = step.highlighting?.comparing || [];
  const activeRange = step.highlighting?.activeRange;
  const eliminatedRange = step.highlighting?.eliminatedRange;

  const low = step.variables?.low ?? activeRange?.[0];
  const high = step.variables?.high ?? activeRange?.[1];
  const mid = step.variables?.mid ?? pivot;
  const left = step.variables?.left;
  const right = step.variables?.right;

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 sm:p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
      {/* Status Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Crosshair size={12} className="text-[var(--accent-primary)]" />
          <span>Window:</span>
          {low !== undefined && high !== undefined ? (
            <span className="px-1.5 py-0.2 rounded bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] font-bold">
              [{low}..{high}]
            </span>
          ) : (
            <span className="text-[var(--text-muted)]">Global</span>
          )}
        </div>

        {foundIndex !== undefined && foundIndex !== null && foundIndex >= 0 && (
          <div className="flex items-center gap-1 px-2 py-0.2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 animate-pulse">
            <CheckCircle2 size={12} />
            <span>Target Found at [{foundIndex}]!</span>
          </div>
        )}
      </div>

      {/* Main Box Row */}
      <div className="flex-1 flex items-center justify-center py-2 min-h-0 overflow-x-auto">
        <div className="flex items-center justify-center gap-1.5 flex-wrap p-1">
          {arrayState.map((val, idx) => {
            const isFound = foundIndex === idx;
            const isMid = mid === idx;
            const isComparing = comparing.includes(idx);
            const isLeft = left === idx;
            const isRight = right === idx;
            const isLow = low === idx;
            const isHigh = high === idx;

            const isEliminated =
              eliminatedRange &&
              idx >= eliminatedRange[0] &&
              idx <= eliminatedRange[1];

            const inActiveRange =
              activeRange ? idx >= activeRange[0] && idx <= activeRange[1] : true;

            let boxStyle =
              "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] shadow-md";

            if (isFound) {
              boxStyle =
                "bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-105";
            } else if (isMid) {
              boxStyle =
                "bg-amber-500/20 border-amber-400 text-amber-300 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-105";
            } else if (isComparing) {
              boxStyle =
                "bg-purple-500/20 border-purple-400 text-purple-200 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.4)]";
            } else if (
              isEliminated ||
              (!inActiveRange && (low !== undefined || high !== undefined))
            ) {
              boxStyle =
                "bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-30 line-through";
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-9">
                <div className="h-4 flex items-center justify-center gap-0.5">
                  {isLow && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-[var(--accent-primary)] text-black font-mono">
                      L
                    </span>
                  )}
                  {isMid && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-amber-400 text-black font-mono">
                      MID
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-purple-500 text-white font-mono">
                      H
                    </span>
                  )}
                  {isLeft && !isLow && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-blue-500 text-white font-mono">
                      L
                    </span>
                  )}
                  {isRight && !isHigh && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black bg-rose-500 text-white font-mono">
                      R
                    </span>
                  )}
                </div>

                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 ${boxStyle}`}
                >
                  {isFound ? (
                    <div className="flex items-center gap-0.5">
                      <span>{val}</span>
                      <CheckCircle2 size={10} className="shrink-0" />
                    </div>
                  ) : (
                    val
                  )}
                </div>

                <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
