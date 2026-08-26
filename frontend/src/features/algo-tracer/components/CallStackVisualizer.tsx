"use client";

import React from "react";
import { Layers, Cpu, Database, Activity, GitCommit } from "lucide-react";
import { TraceStep, AlgorithmType } from "../types";

interface CallStackVisualizerProps {
  currentStep?: TraceStep;
  currentStepIndex: number;
  totalSteps: number;
  algoType?: AlgorithmType;
  algoDisplayName?: string;
  className?: string;
}

export function CallStackVisualizer({
  currentStep,
  currentStepIndex,
  totalSteps,
  algoType = "bubble-sort",
  algoDisplayName = "Algorithm",
  className = "",
}: CallStackVisualizerProps) {
  // Infer mock call stack and memory footprint from current step
  const variables = currentStep?.variables || {};
  const stepType = currentStep?.type || "compare";

  // Calculate simulated recursion depth based on step parameters or algorithm type
  const isRecursive =
    algoType.includes("merge") ||
    algoType.includes("quick") ||
    algoType.includes("tree") ||
    algoType.includes("dfs") ||
    algoType.includes("binary");

  const simulatedDepth = isRecursive
    ? Math.min(
        5,
        Math.max(
          1,
          Math.floor(Math.sin((currentStepIndex / Math.max(1, totalSteps)) * Math.PI * 2) * 2) + 2,
        ),
      )
    : 1;

  // Stack frames list
  const stackFrames = Array.from({ length: simulatedDepth }).map((_, i) => {
    const depthLevel = simulatedDepth - i;
    const isTop = i === 0;
    return {
      id: `frame-${i}`,
      functionName: `${algoDisplayName.replace(/\s+/g, "")}Scope(depth=${depthLevel})`,
      depth: depthLevel,
      isTop,
      args: isTop ? variables : { status: "suspended", parentFrame: depthLevel - 1 },
      pc: isTop ? `Line ${currentStep?.line || 12} [${stepType.toUpperCase()}]` : "Waiting for child return",
    };
  });

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-xl font-mono text-xs flex flex-col gap-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
            <Cpu size={14} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
              Call Stack & Memory Runtime
            </h4>
            <p className="text-[10px] text-[var(--text-muted)]">
              Execution context & stack allocation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
            <Activity size={11} className="animate-pulse" />
            <span>Depth: {simulatedDepth}</span>
          </span>
        </div>
      </div>

      {/* Stack Frames Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <span>Active Stack Frames (Top $\to$ Bottom)</span>
          <span>Program Counter</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {stackFrames.map((frame) => (
            <div
              key={frame.id}
              className={`p-3 rounded-xl border transition-all ${
                frame.isTop
                  ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)] text-[var(--text-primary)]"
                  : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] opacity-70 text-[var(--text-muted)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      frame.isTop ? "bg-[var(--accent-primary)] animate-ping" : "bg-gray-500"
                    }`}
                  />
                  <span className="font-bold font-mono truncate">{frame.functionName}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent-primary)] shrink-0">
                  {frame.pc}
                </span>
              </div>

              {frame.isTop && Object.keys(frame.args).length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--accent-primary)]/20 flex flex-wrap gap-1.5">
                  {Object.entries(frame.args).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)]"
                    >
                      <span className="text-[var(--accent-primary)] font-bold">{k}:</span>{" "}
                      {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Memory Footprint Bar */}
      <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <Database size={11} /> Auxiliary Space
            </span>
            <span className="text-emerald-400 font-mono">
              {isRecursive ? `O(log N)` : `O(1)`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, simulatedDepth * 20)}%` }}
            />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <Layers size={11} /> Stack Memory
            </span>
            <span className="text-cyan-400 font-mono">
              {(simulatedDepth * 4.2).toFixed(1)} KB
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (simulatedDepth / 5) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
