"use client";

import React, { useState, useRef, useEffect } from "react";
import { TraceStep } from "../../types";
import { Network, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

interface GraphDiagramProps {
  step: TraceStep;
}

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  "0": { x: 50, y: 70 },
  "1": { x: 150, y: 35 },
  "2": { x: 150, y: 105 },
  "3": { x: 260, y: 20 },
  "4": { x: 260, y: 65 },
  "5": { x: 260, y: 110 },
};

export function GraphDiagram({ step }: GraphDiagramProps) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    DEFAULT_POSITIONS,
  );
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Handle node drag
  const handleMouseDown = (nodeId: string) => {
    soundEffects.playClick();
    setDraggingNode(nodeId);
  };

  useEffect(() => {
    if (!draggingNode) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 320 / rect.width;
      const scaleY = 140 / rect.height;

      const newX = Math.max(15, Math.min(305, (e.clientX - rect.left) * scaleX));
      const newY = Math.max(15, Math.min(125, (e.clientY - rect.top) * scaleY));

      setPositions((prev) => ({
        ...prev,
        [draggingNode]: { x: Math.round(newX), y: Math.round(newY) },
      }));
    };

    const handleMouseUp = () => {
      setDraggingNode(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingNode]);

  const handleResetLayout = () => {
    soundEffects.playClick();
    setPositions(DEFAULT_POSITIONS);
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
      {/* Header with Traversal Info & Zoom Controls */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)] shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
          <Network size={13} />
          <span>Graph Traversal (Draggable)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">
            Visited: {visitedSet.size}
          </span>

          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              title="Zoom In"
              className="p-1 hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              <ZoomIn size={11} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              title="Zoom Out"
              className="p-1 hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              <ZoomOut size={11} />
            </button>
            <button
              onClick={handleResetLayout}
              title="Reset Layout"
              className="p-1 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="flex-1 flex items-center justify-center py-1 min-h-0 relative select-none">
        <svg
          ref={svgRef}
          viewBox="0 0 320 140"
          style={{ transform: `scale(${zoom})`, transition: "transform 0.15s ease-out" }}
          className="w-full max-w-sm h-full max-h-36 overflow-visible"
        >
          {/* Edges */}
          {graphState.edges.map((edge, idx) => {
            const p1 = positions[edge.from] || { x: 50, y: 50 };
            const p2 = positions[edge.to] || { x: 150, y: 150 };

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
                stroke={isEdgeActive ? "var(--accent-primary)" : "var(--border-subtle)"}
                strokeWidth={isEdgeActive ? "2.5" : "1.5"}
                className="transition-colors duration-200"
              />
            );
          })}

          {/* Nodes */}
          {graphState.nodes.map((node) => {
            const pos = positions[node.id] || { x: 50, y: 50 };
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentNode === node.id;
            const isDragging = draggingNode === node.id;

            return (
              <g
                key={node.id}
                onMouseDown={() => handleMouseDown(node.id)}
                className="cursor-grab active:cursor-grabbing transition-transform duration-100"
                style={{
                  transform: isDragging ? "scale(1.15)" : "scale(1)",
                  transformOrigin: `${pos.x}px ${pos.y}px`,
                }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="14"
                  fill={
                    isCurrent
                      ? "var(--accent-primary)"
                      : isVisited
                        ? "rgba(6, 182, 212, 0.25)"
                        : "var(--bg-secondary)"
                  }
                  stroke={
                    isCurrent
                      ? "var(--text-primary)"
                      : isVisited
                        ? "var(--accent-primary)"
                        : "var(--border-subtle)"
                  }
                  strokeWidth={isCurrent ? "2.5" : "1.5"}
                  className="shadow-md"
                />
                <text
                  x={pos.x}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  fill={isCurrent ? "#000000" : "var(--text-primary)"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Traversal Queue / Stack Strip */}
      <div className="p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] font-bold uppercase">Queue:</span>
          <div className="flex items-center gap-1">
            {graphState.queueOrStack && graphState.queueOrStack.length > 0 ? (
              graphState.queueOrStack.map((item, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.2 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold border border-[var(--accent-primary)]/30"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-[var(--text-muted)] italic">Empty</span>
            )}
          </div>
        </div>

        <span className="text-[var(--text-muted)]">
          Visited Order: [{Array.from(visitedSet).join(",")}]
        </span>
      </div>
    </div>
  );
}
