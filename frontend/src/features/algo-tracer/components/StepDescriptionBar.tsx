"use client";

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
          color: "bg-amber-500/20 border-amber-500/40 text-amber-300",
        };
      case "swap":
        return {
          label: "Swap",
          color: "bg-rose-500/20 border-rose-500/40 text-rose-300",
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
          color: "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
        };
    }
  };

  const badge = getTypeBadge(step?.type || "iterate");

  return (
    <div className="h-17 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md flex items-center gap-3 shrink-0 overflow-hidden">
      <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shrink-0">
        <Sparkles size={15} />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-bold uppercase text-[var(--accent-primary)]">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0}/{totalSteps}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded-md font-bold uppercase border ${badge.color}`}
          >
            {badge.label}
          </span>
          {step?.line ? (
            <span className="text-[var(--text-muted)] font-mono">
              Line {step.line}
            </span>
          ) : null}
        </div>

        <p className="text-[13px] sm:text-[13.5px] text-[var(--text-primary)] font-medium leading-snug line-clamp-2 truncate">
          {step?.description || "Ready to execute. Click 'Run & Trace' to start."}
        </p>
      </div>
    </div>
  );
}
