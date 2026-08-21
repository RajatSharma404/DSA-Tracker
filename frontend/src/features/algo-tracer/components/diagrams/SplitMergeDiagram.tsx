"use client";

import React from "react";
import { TraceStep } from "../../types";
import { GitFork } from "lucide-react";

interface SplitMergeDiagramProps {
  step: TraceStep;
}

export function SplitMergeDiagram({ step }: SplitMergeDiagramProps) {
  const treeNodes = step.treeState || [];
  const arrayState = step.arrayState || [];
  const activeRange = step.highlighting?.activeRange;

  const depthGroups: Record<number, typeof treeNodes> = {};
  treeNodes.forEach((node) => {
    if (!depthGroups[node.depth]) depthGroups[node.depth] = [];
    depthGroups[node.depth].push(node);
  });

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
          <GitFork size={13} />
          <span>Recursion Tree</span>
        </div>
        <div className="text-[var(--text-muted)]">
          Array: <strong className="text-[var(--text-primary)]">[{arrayState.join(",")}]</strong>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-1 overflow-y-auto min-h-0 [scrollbar-width:thin]">
        {Object.keys(depthGroups).length > 0 ? (
          Object.entries(depthGroups).map(([depth, nodes]) => (
            <div
              key={depth}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              {nodes.map((node) => {
                const isActive =
                  activeRange &&
                  node.leftIndex === activeRange[0] &&
                  node.rightIndex === activeRange[1];

                return (
                  <div
                    key={node.id}
                    className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                      isActive
                        ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] scale-105"
                        : node.stage === "merged"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[8px] font-mono text-[var(--text-muted)]">
                        [{node.leftIndex}..{node.rightIndex}]
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {node.array.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold border ${
                            isActive
                              ? "bg-[var(--accent-primary)] text-black border-[var(--accent-primary)] font-extrabold"
                              : node.stage === "merged"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)]"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {arrayState.map((val, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center text-xs font-mono font-bold text-[var(--accent-primary)]"
              >
                {val}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
