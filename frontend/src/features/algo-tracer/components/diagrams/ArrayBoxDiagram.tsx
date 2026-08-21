import React from "react";
import { TraceStep } from "../../types";
import { CheckCircle2, Target, Crosshair } from "lucide-react";

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
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Top Legend / Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <Crosshair size={14} className="text-cyan-400" />
          <span>Active Search Window:</span>
          {low !== undefined && high !== undefined ? (
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
              [{low} .. {high}]
            </span>
          ) : (
            <span className="text-gray-500">Global Space</span>
          )}
        </div>

        {foundIndex !== undefined && foundIndex !== null && foundIndex >= 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs font-mono animate-pulse">
            <CheckCircle2 size={14} />
            <span>Target Found at [{foundIndex}]!</span>
          </div>
        )}
      </div>

      {/* Main Boxed Array Representation */}
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-full overflow-x-auto p-2">
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
              "bg-[#131320] border-white/10 text-gray-300 shadow-lg";

            if (isFound) {
              boxStyle =
                "bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-110";
            } else if (isMid) {
              boxStyle =
                "bg-amber-500/20 border-amber-400 text-amber-300 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105";
            } else if (isComparing) {
              boxStyle =
                "bg-purple-500/20 border-purple-400 text-purple-200 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.4)]";
            } else if (isEliminated || (!inActiveRange && (low !== undefined || high !== undefined))) {
              boxStyle = "bg-white/2 border-white/5 text-gray-600 opacity-30 line-through";
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-2 min-w-12 sm:min-w-14">
                {/* Pointer Indicators */}
                <div className="h-6 flex items-center justify-center gap-1">
                  {isLow && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500 text-black font-mono shadow">
                      L
                    </span>
                  )}
                  {isMid && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-black font-mono shadow">
                      MID
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-500 text-white font-mono shadow">
                      H
                    </span>
                  )}
                  {isLeft && !isLow && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500 text-white font-mono shadow">
                      Left
                    </span>
                  )}
                  {isRight && !isHigh && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white font-mono shadow">
                      Right
                    </span>
                  )}
                </div>

                {/* Box Element */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-base sm:text-lg font-mono font-bold transition-all duration-300 ${boxStyle}`}
                >
                  {isFound ? (
                    <div className="flex items-center gap-1">
                      <span>{val}</span>
                      <CheckCircle2 size={14} className="shrink-0" />
                    </div>
                  ) : (
                    val
                  )}
                </div>

                {/* Index Subtext */}
                <span className="text-[10px] font-mono text-gray-500 font-bold">
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
