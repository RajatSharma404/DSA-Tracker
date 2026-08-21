import React from "react";
import { TraceStep } from "../../types";
import { Network, ArrowRight } from "lucide-react";

interface GraphDiagramProps {
  step: TraceStep;
}

export function GraphDiagram({ step }: GraphDiagramProps) {
  const graphState = step.graphState || {
    nodes: [
      { id: "0", label: "0" },
      { id: "1", label: "1" },
      { id: "2", label: "2" },
      { id: "3", label: "3" },
      { id: "4", label: "4" },
      { id: "5", label: "5" },
    ],
    edges: [
      { from: "0", to: "1" },
      { from: "0", to: "2" },
      { from: "1", to: "3" },
      { from: "1", to: "4" },
      { from: "2", to: "5" },
    ],
    visited: ["0"],
    current: "0",
    queueOrStack: ["0"],
  };

  const visitedSet = new Set(graphState.visited || []);
  const currentNode = graphState.current;
  const activeEdge = step.highlighting?.activeEdge;

  // Compute node coordinates around a responsive canvas
  const nodePositions: Record<string, { x: number; y: number }> = {
    "0": { x: 80, y: 100 },
    "1": { x: 200, y: 50 },
    "2": { x: 200, y: 150 },
    "3": { x: 330, y: 30 },
    "4": { x: 330, y: 90 },
    "5": { x: 330, y: 160 },
  };

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
          <Network size={15} />
          <span>Graph Traversal Topology</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            Visited ({visitedSet.size})
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-cyan-400" />
            Current
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center py-2">
        <svg viewBox="0 0 400 200" className="w-full max-w-lg h-44 overflow-visible">
          {/* Edges */}
          {graphState.edges.map((edge, idx) => {
            const p1 = nodePositions[edge.from] || { x: 50, y: 50 };
            const p2 = nodePositions[edge.to] || { x: 150, y: 150 };

            const isEdgeActive =
              activeEdge &&
              ((activeEdge[0] === edge.from && activeEdge[1] === edge.to) ||
                (activeEdge[0] === edge.to && activeEdge[1] === edge.from));

            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isEdgeActive ? "#06b6d4" : "#2a2a40"}
                strokeWidth={isEdgeActive ? "3" : "2"}
                strokeDasharray={isEdgeActive ? "4,4" : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {graphState.nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 50, y: 50 };
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentNode === node.id;

            return (
              <g key={node.id} className="transition-all duration-300 cursor-pointer">
                {isCurrent && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="22"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="16"
                  fill={isCurrent ? "#ffffff" : isVisited ? "#06b6d4" : "#1a1a2e"}
                  stroke={isCurrent ? "#06b6d4" : isVisited ? "#0891b2" : "#3d3d5c"}
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill={isCurrent ? "#000000" : isVisited ? "#000000" : "#ffffff"}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Traversal Queue / Stack Box */}
      <div className="p-3 rounded-2xl bg-black/50 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            Traversal Queue:
          </span>
          <div className="flex items-center gap-1.5">
            {graphState.queueOrStack && graphState.queueOrStack.length > 0 ? (
              graphState.queueOrStack.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-gray-600 italic">Empty</span>
            )}
          </div>
        </div>

        <div className="text-[11px] text-gray-400">
          Visited Order:{" "}
          <strong className="text-white">[{Array.from(visitedSet).join(", ")}]</strong>
        </div>
      </div>
    </div>
  );
}
