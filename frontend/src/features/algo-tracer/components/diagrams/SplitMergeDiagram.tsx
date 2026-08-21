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
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[#0a0a12]/90 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <GitFork size={13} />
          <span>Recursion Tree</span>
        </div>
        <div className="text-gray-400">
          Array: <strong className="text-white">[{arrayState.join(",")}]</strong>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-1 overflow-y-auto min-h-0 [scrollbar-width:thin]">
        {Object.keys(depthGroups).length > 0 ? (
          Object.entries(depthGroups).map(([depth, nodes]) => (
            <div key={depth} className="flex items-center justify-center gap-2 flex-wrap">
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
                        ? "bg-cyan-500/20 border-cyan-400 scale-105"
                        : node.stage === "merged"
                          ? "bg-[#141d1a] border-emerald-500/30"
                          : "bg-[#11111c] border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[8px] font-mono text-gray-400">
                        [{node.leftIndex}..{node.rightIndex}]
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {node.array.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold border ${
                            isActive
                              ? "bg-cyan-400 text-black border-cyan-300 font-extrabold"
                              : node.stage === "merged"
                                ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                                : "bg-black/50 text-gray-300 border-white/10"
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
                className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-300"
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
