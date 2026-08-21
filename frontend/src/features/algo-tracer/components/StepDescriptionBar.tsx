import React from "react";
import { Sparkles } from "lucide-react";
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
          label: "Compare",
          color: "bg-[#ff6b6b]/20 border-[#ff6b6b]/40 text-[#ff6b6b]",
        };
      case "swap":
        return {
          label: "Swap",
          color: "bg-[#ffd93d]/20 border-[#ffd93d]/40 text-[#ffd93d]",
        };
      case "found":
        return {
          label: "Match",
          color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
        };
      case "insert":
      case "sorted":
        return {
          label: "Sorted",
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
          label: "Graph",
          color: "bg-blue-500/20 border-blue-500/40 text-blue-300",
        };
      default:
        return {
          label: "Step",
          color: "bg-white/10 border-white/20 text-gray-300",
        };
    }
  };

  const badge = getTypeBadge(step?.type || "iterate");

  return (
    <div className="h-17 px-3.5 py-2 rounded-2xl bg-[#0f0f1c] border border-cyan-500/20 shadow-md flex items-center gap-3 shrink-0 overflow-hidden">
      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
        <Sparkles size={15} />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-bold uppercase text-cyan-400">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0}/{totalSteps}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded-md font-bold uppercase border ${badge.color}`}
          >
            {badge.label}
          </span>
          {step?.line ? (
            <span className="text-gray-400 font-mono">
              Line {step.line}
            </span>
          ) : null}
        </div>

        <p className="text-[13px] sm:text-[13.5px] text-gray-100 font-medium leading-snug line-clamp-2 truncate">
          {step?.description || "Ready to execute. Click 'Run & Trace' to start."}
        </p>
      </div>
    </div>
  );
}
