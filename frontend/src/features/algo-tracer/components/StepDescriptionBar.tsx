import React from "react";
import { Sparkles, ArrowRight, CheckCircle2, RotateCw, GitCommit } from "lucide-react";
import { TraceStep } from "../types";

interface StepDescriptionBarProps {
  step: TraceStep;
  currentStepIndex: number;
  totalSteps: number;
}

export function StepDescriptionBar({
  step,
  currentStepIndex,
  totalSteps,
}: StepDescriptionBarProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "compare":
        return {
          label: "Comparison",
          color: "bg-[#ff6b6b]/20 border-[#ff6b6b]/40 text-[#ff6b6b]",
        };
      case "swap":
        return {
          label: "Swap",
          color: "bg-[#ffd93d]/20 border-[#ffd93d]/40 text-[#ffd93d]",
        };
      case "found":
        return {
          label: "Match Found",
          color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
        };
      case "insert":
      case "sorted":
        return {
          label: "Sorted Position",
          color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
        };
      case "split":
        return {
          label: "Divide",
          color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
        };
      case "merge":
        return {
          label: "Merge",
          color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
        };
      case "visit":
      case "enqueue":
        return {
          label: "Graph Traversal",
          color: "bg-blue-500/20 border-blue-500/40 text-blue-300",
        };
      default:
        return {
          label: "Execution Step",
          color: "bg-white/10 border-white/20 text-gray-300",
        };
    }
  };

  const badge = getTypeBadge(step?.type || "iterate");

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#0f0f1c] border border-cyan-500/20 shadow-xl flex items-start sm:items-center gap-3.5 transition-all">
      <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
        <Sparkles size={18} />
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono border ${badge.color}`}
          >
            {badge.label}
          </span>
          {step?.line ? (
            <span className="text-[10px] font-mono text-gray-400">
              (Line {step.line})
            </span>
          ) : null}
        </div>

        <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
          {step?.description || "Ready to execute algorithm. Click 'Run & Trace' to begin."}
        </p>
      </div>
    </div>
  );
}
