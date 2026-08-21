import React from "react";
import { TraceStep } from "../../types";

interface BarDiagramProps {
  step: TraceStep;
  allSteps?: TraceStep[];
  currentIndex?: number;
}

export function BarDiagram({ step, allSteps = [], currentIndex = 0 }: BarDiagramProps) {
  const arrayState = step.arrayState && step.arrayState.length > 0 ? step.arrayState : [5, 3, 8, 1, 9, 2, 4];
  const maxVal = Math.max(...arrayState.map((v) => Math.abs(v)), 1);

  const comparing = step.highlighting?.comparing || [];
  const swapping = step.highlighting?.swapping || [];
  const sorted = step.highlighting?.sorted || [];
  const pivot = step.highlighting?.pivot;

  // Calculate cumulative stats up to current step
  const comparisonsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "compare").length;
  const swapsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "swap").length;

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Counters & Indicator Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse" />
            Comparing
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffd93d]/10 border border-[#ffd93d]/30 text-[#ffd93d] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#ffd93d]" />
            Swapping
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6bcb77]/10 border border-[#6bcb77]/30 text-[#6bcb77] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#6bcb77]" />
            Sorted
          </div>
          {pivot !== null && pivot !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff9f43]/10 border border-[#ff9f43]/30 text-[#ff9f43] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ff9f43]" />
              Pivot
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            Comparisons: <strong className="text-cyan-400">{comparisonsCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            Swaps: <strong className="text-yellow-400">{swapsCount}</strong>
          </span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="flex-1 flex items-end justify-center gap-2 sm:gap-3 py-6 px-2 min-h-48 overflow-x-auto">
        {arrayState.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sorted.includes(idx);
          const isPivot = pivot === idx;

          // Height formula
          const heightPercent = Math.max(15, Math.round((Math.abs(val) / maxVal) * 85));

          let barColor = "bg-[#3d3d5c] border-[#4a4a70]";
          let textColor = "text-gray-300";
          let glowEffect = "";

          if (isSorted) {
            barColor = "bg-[#6bcb77] border-[#6bcb77]";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_12px_rgba(107,203,119,0.3)]";
          } else if (isSwapping) {
            barColor = "bg-[#ffd93d] border-[#ffd93d] animate-bounce";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_15px_rgba(255,217,61,0.5)]";
          } else if (isComparing) {
            barColor = "bg-[#ff6b6b] border-[#ff6b6b]";
            textColor = "text-white font-extrabold";
            glowEffect = "shadow-[0_0_15px_rgba(255,107,107,0.5)] scale-[1.03]";
          } else if (isPivot) {
            barColor = "bg-[#ff9f43] border-[#ff9f43]";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_15px_rgba(255,159,67,0.5)]";
          }

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 flex-1 max-w-16 min-w-8 transition-all duration-250 ease-out"
            >
              {/* Value floating tag */}
              <span className={`text-[11px] font-mono font-bold transition-all ${textColor}`}>
                {val}
              </span>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-xl sm:rounded-t-2xl border ${barColor} ${glowEffect} transition-all duration-250 ease-out flex items-start justify-center pt-1.5`}
              >
                {isPivot && (
                  <span className="text-[9px] font-black text-black font-mono uppercase tracking-tighter">
                    P
                  </span>
                )}
              </div>

              {/* Index label */}
              <span className="text-[10px] font-mono text-gray-500 font-bold">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
