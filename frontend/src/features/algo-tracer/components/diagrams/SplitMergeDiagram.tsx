import React from "react";
import { TraceStep } from "../../types";
import { GitFork, Layers } from "lucide-react";

interface SplitMergeDiagramProps {
  step: TraceStep;
}

export function SplitMergeDiagram({ step }: SplitMergeDiagramProps) {
  const treeNodes = step.treeState || [];
  const arrayState = step.arrayState || [];
  const activeRange = step.highlighting?.activeRange;

  // Group nodes by depth
  const depthGroups: Record<number, typeof treeNodes> = {};
  treeNodes.forEach((node) => {
    if (!depthGroups[node.depth]) depthGroups[node.depth] = [];
    depthGroups[node.depth].push(node);
  });

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
          <GitFork size={15} />
          <span>Divide & Conquer Recursion Tree</span>
        </div>
        <div className="text-[11px] font-mono text-gray-400">
          Array Length: <strong className="text-white">{arrayState.length}</strong>
        </div>
      </div>

      {/* Main Tree Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 overflow-y-auto max-h-80">
        {Object.keys(depthGroups).length > 0 ? (
          Object.entries(depthGroups).map(([depth, nodes]) => (
            <div key={depth} className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {nodes.map((node) => {
                const isActive =
                  activeRange &&
                  node.leftIndex === activeRange[0] &&
                  node.rightIndex === activeRange[1];

                return (
                  <div
                    key={node.id}
                    className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                        : node.stage === "merged"
                          ? "bg-[#141d1a] border-emerald-500/30"
                          : "bg-[#11111c] border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                        [{node.leftIndex}..{node.rightIndex}]
                      </span>
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-black uppercase ${
                          node.stage === "merged"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : node.stage === "merging"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {node.stage}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {node.array.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
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
          /* Primary Array fallback */
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-gray-400 font-mono">Current Merged Array</span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {arrayState.map((val, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm font-mono font-bold text-cyan-300"
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Current Array */}
      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
        <span>Global Array State:</span>
        <span className="text-cyan-400 font-bold">
          [{arrayState.join(", ")}]
        </span>
      </div>
    </div>
  );
}
