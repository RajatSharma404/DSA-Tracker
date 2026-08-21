"use client";

import React, { useMemo } from "react";
import { Activity, Cpu, Layers, Zap, Gauge } from "lucide-react";
import { TraceStep, TheoryData } from "../types";

interface ComplexityHUDProps {
  currentStepIndex: number;
  allSteps: TraceStep[];
  theory?: TheoryData;
}

export function ComplexityHUD({
  currentStepIndex,
  allSteps,
  theory,
}: ComplexityHUDProps) {
  // Compute cumulative statistics up to current step
  const stats = useMemo(() => {
    let comparisons = 0;
    let swaps = 0;
    let recursiveDepth = 0;
    let maxStackSize = 0;

    const slice = allSteps.slice(0, currentStepIndex + 1);
    slice.forEach((step) => {
      if (step.type === "compare") comparisons++;
      if (step.type === "swap") swaps++;
      if (step.callStack) {
        recursiveDepth = Math.max(recursiveDepth, step.callStack.length);
      }
      if (step.dataStructureState) {
        maxStackSize = Math.max(maxStackSize, step.dataStructureState.length);
      }
      if (step.graphState?.queueOrStack) {
        maxStackSize = Math.max(maxStackSize, step.graphState.queueOrStack.length);
      }
    });

    const activeCallStack = allSteps[currentStepIndex]?.callStack?.length || 0;
    const activeDsSize =
      allSteps[currentStepIndex]?.dataStructureState?.length ||
      allSteps[currentStepIndex]?.graphState?.queueOrStack?.length ||
      0;

    return {
      comparisons,
      swaps,
      totalOperations: comparisons + swaps + currentStepIndex,
      activeCallStack,
      activeDsSize,
      maxAuxMemory: Math.max(activeCallStack, activeDsSize, 1),
    };
  }, [allSteps, currentStepIndex]);

  const timeComplexity = theory?.complexity?.average || "O(N log N)";
  const spaceComplexity = theory?.complexity?.space || "O(1)";

  return (
    <div className="h-10 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 shadow-sm text-[11px] font-mono shrink-0 overflow-x-auto [scrollbar-width:none]">
      {/* Left: Operations & Comparisons */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Activity size={13} className="text-[var(--accent-primary)]" />
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
            Ops:
          </span>
          <span className="font-bold text-[var(--text-primary)]">
            {stats.totalOperations}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] hidden sm:flex">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
            Compares:
          </span>
          <span className="font-bold text-amber-400">
            {stats.comparisons}
          </span>
        </div>

        {stats.swaps > 0 && (
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] hidden md:flex">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
              Swaps:
            </span>
            <span className="font-bold text-rose-400">
              {stats.swaps}
            </span>
          </div>
        )}
      </div>

      {/* Center: Auxiliary Space Depth */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-purple-400" />
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
            Aux Depth:
          </span>
          <span className="font-bold text-purple-300">
            {stats.maxAuxMemory}
          </span>
        </div>
      </div>

      {/* Right: Big-O Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          title={`Time Complexity: ${timeComplexity}`}
          className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 text-[10px] font-bold"
        >
          Time: {timeComplexity}
        </span>
        <span
          title={`Space Complexity: ${spaceComplexity}`}
          className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold hidden sm:inline-block"
        >
          Space: {spaceComplexity}
        </span>
      </div>
    </div>
  );
}
