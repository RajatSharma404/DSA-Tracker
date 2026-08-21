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

  const comparisonsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "compare").length;
  const swapsCount = allSteps
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === "swap").length;

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 sm:p-3 bg-[#0a0a12]/90 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      {/* Counters & Legend */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#ff6b6b] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
            Compare
          </div>
          <div className="flex items-center gap-1 text-[#ffd93d] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd93d]" />
            Swap
          </div>
          <div className="flex items-center gap-1 text-[#6bcb77] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bcb77]" />
            Sorted
          </div>
          {pivot !== null && pivot !== undefined && (
            <div className="flex items-center gap-1 text-[#ff9f43] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f43]" />
              Pivot
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            C: <strong className="text-cyan-400">{comparisonsCount}</strong>
          </span>
          <span className="text-gray-400">
            S: <strong className="text-yellow-400">{swapsCount}</strong>
          </span>
        </div>
      </div>

      {/* Bar Canvas */}
      <div className="flex-1 flex items-end justify-center gap-1.5 sm:gap-2 py-1 px-1 min-h-0 overflow-x-auto">
        {arrayState.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sorted.includes(idx);
          const isPivot = pivot === idx;

          const heightPercent = Math.max(18, Math.round((Math.abs(val) / maxVal) * 82));

          let barColor = "bg-[#3d3d5c] border-[#4a4a70]";
          let textColor = "text-gray-400";
          let glowEffect = "";

          if (isSorted) {
            barColor = "bg-[#6bcb77] border-[#6bcb77]";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_8px_rgba(107,203,119,0.3)]";
          } else if (isSwapping) {
            barColor = "bg-[#ffd93d] border-[#ffd93d] animate-bounce";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_10px_rgba(255,217,61,0.5)]";
          } else if (isComparing) {
            barColor = "bg-[#ff6b6b] border-[#ff6b6b]";
            textColor = "text-white font-extrabold";
            glowEffect = "shadow-[0_0_10px_rgba(255,107,107,0.5)] scale-[1.02]";
          } else if (isPivot) {
            barColor = "bg-[#ff9f43] border-[#ff9f43]";
            textColor = "text-black font-extrabold";
            glowEffect = "shadow-[0_0_10px_rgba(255,159,67,0.5)]";
          }

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1 flex-1 max-w-12 min-w-6 transition-all duration-200"
            >
              <span className={`text-[10px] font-mono font-bold ${textColor}`}>
                {val}
              </span>

              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-lg border ${barColor} ${glowEffect} transition-all duration-200 flex items-start justify-center pt-0.5`}
              >
                {isPivot && (
                  <span className="text-[8px] font-black text-black font-mono">
                    P
                  </span>
                )}
              </div>

              <span className="text-[9px] font-mono text-gray-500 font-bold">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
