import React from "react";
import { TraceStep } from "../../types";
import { Network } from "lucide-react";

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

  const nodePositions: Record<string, { x: number; y: number }> = {
    "0": { x: 50, y: 70 },
    "1": { x: 150, y: 35 },
    "2": { x: 150, y: 105 },
    "3": { x: 260, y: 20 },
    "4": { x: 260, y: 65 },
    "5": { x: 260, y: 110 },
  };

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[#0a0a12]/90 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Network size={13} />
          <span>Graph Traversal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-300">Visited: {visitedSet.size}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center py-1 min-h-0">
        <svg viewBox="0 0 320 140" className="w-full max-w-sm h-full max-h-32 overflow-visible">
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
                strokeWidth={isEdgeActive ? "2.5" : "1.5"}
                className="transition-all duration-200"
              />
            );
          })}

          {graphState.nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 50, y: 50 };
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentNode === node.id;

            return (
              <g key={node.id} className="transition-all duration-200">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="13"
                  fill={isCurrent ? "#ffffff" : isVisited ? "#06b6d4" : "#1a1a2e"}
                  stroke={isCurrent ? "#06b6d4" : isVisited ? "#0891b2" : "#3d3d5c"}
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  fill={isCurrent ? "#000000" : isVisited ? "#000000" : "#ffffff"}
                  fontSize="10"
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

      {/* Queue Strip */}
      <div className="p-1.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-[10px] font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 font-bold uppercase">Queue:</span>
          <div className="flex items-center gap-1">
            {graphState.queueOrStack && graphState.queueOrStack.length > 0 ? (
              graphState.queueOrStack.map((item, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-gray-600 italic">Empty</span>
            )}
          </div>
        </div>

        <span className="text-gray-400">
          Order: [{Array.from(visitedSet).join(",")}]
        </span>
      </div>
    </div>
  );
}
