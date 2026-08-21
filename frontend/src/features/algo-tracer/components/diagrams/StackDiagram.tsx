"use client";

import React from "react";
import { TraceStep } from "../../types";
import { Layers } from "lucide-react";

interface StackDiagramProps {
  step: TraceStep;
}

export function StackDiagram({ step }: StackDiagramProps) {
  const stackItems =
    step.dataStructureState ||
    (step.variables?.stack
      ? JSON.parse(String(step.variables.stack).replace(/'/g, '"'))
      : [10, 20, 30]);

  const topIndex = stackItems.length - 1;

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-purple-400 font-bold">
          <Layers size={13} />
          <span>LIFO Stack</span>
        </div>
        <div className="text-[var(--text-muted)]">
          Size: <strong className="text-[var(--text-primary)]">{stackItems.length}</strong>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-end py-1 min-h-0">
        <div className="w-36 sm:w-44 border-b-2 border-l-2 border-r-2 border-purple-500/40 rounded-b-xl p-1.5 bg-[var(--bg-secondary)] flex flex-col-reverse gap-1 max-h-28 overflow-y-auto">
          {stackItems.length > 0 ? (
            stackItems.map((val: string | number, idx: number) => {
              const isTop = idx === topIndex;

              return (
                <div
                  key={idx}
                  className={`w-full py-1 px-2 rounded-lg border flex items-center justify-between text-[11px] font-mono font-bold transition-all ${
                    isTop
                      ? "bg-purple-500/30 border-purple-400 text-purple-200"
                      : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-[9px] text-[var(--text-muted)]">[{idx}]</span>
                  <span className="font-black text-[var(--text-primary)]">{val}</span>
                  {isTop ? (
                    <span className="px-1 py-0.1 rounded bg-purple-500 text-black text-[8px] font-black uppercase">
                      TOP
                    </span>
                  ) : (
                    <span className="w-4" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-[10px] text-[var(--text-muted)] italic py-2">
              Empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
