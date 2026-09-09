"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Workflow,
  Code2,
  Info,
} from "lucide-react";

export interface FlowchartNode {
  id: string | number;
  label?: string;
  text?: string;
  name?: string;
  type?: "start" | "end" | "process" | "decision" | "io" | string;
  line?: number;
  startLine?: number;
  endLine?: number;
  lines?: number[];
  x?: number;
  y?: number;
}

export interface FlowchartEdge {
  from?: string | number;
  to?: string | number;
  source?: string | number;
  target?: string | number;
  label?: string;
  condition?: string;
  text?: string;
}

export interface FlowchartData {
  nodes?: FlowchartNode[];
  edges?: FlowchartEdge[];
  flowchart?: {
    nodes?: FlowchartNode[];
    edges?: FlowchartEdge[];
  };
  data?: {
    nodes?: FlowchartNode[];
    edges?: FlowchartEdge[];
  };
}

export interface FlowchartPanelProps {
  data: FlowchartData | null;
  onClose: () => void;
  onNodeClick?: (node: FlowchartNode) => void;
  className?: string;
}

export function FlowchartPanel({
  data,
  onClose,
  onNodeClick,
  className = "",
}: FlowchartPanelProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize nodes and edges from diverse API payload shapes
  const nodes: FlowchartNode[] = useMemo(() => {
    if (!data) return [];
    const rawNodes =
      data.nodes || data.flowchart?.nodes || data.data?.nodes || [];
    return rawNodes.map((n, idx) => ({
      ...n,
      id: n.id !== undefined ? n.id : `node-${idx}`,
      type: (n.type || "process").toLowerCase(),
    }));
  }, [data]);

  const edges: FlowchartEdge[] = useMemo(() => {
    if (!data) return [];
    const rawEdges =
      data.edges || data.flowchart?.edges || data.data?.edges || [];
    if (rawEdges.length > 0) {
      return rawEdges.map((e) => ({
        ...e,
        from: e.from !== undefined ? e.from : e.source,
        to: e.to !== undefined ? e.to : e.target,
        label: e.label || e.condition || e.text,
      }));
    }
    // Fallback: If no explicit edges were returned, link sequential nodes
    if (nodes.length > 1) {
      const fallbackEdges: FlowchartEdge[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        fallbackEdges.push({
          from: nodes[i].id,
          to: nodes[i + 1].id,
        });
      }
      return fallbackEdges;
    }
    return [];
  }, [data, nodes]);

  // Layout parameters
  const nodeWidth = 190;
  const nodeHeight = 52;
  const verticalSpacing = 115;
  const baseWidth = 560;
  const centerX = baseWidth / 2;
  const topPadding = 70;

  // Compute layout positions for each node (top-down)
  const nodePositions = useMemo(() => {
    const posMap = new Map<
      string | number,
      { x: number; y: number; width: number; height: number; node: FlowchartNode }
    >();

    nodes.forEach((node, index) => {
      const x = centerX;
      const y = topPadding + index * verticalSpacing;
      posMap.set(String(node.id), {
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        node,
      });
    });

    return posMap;
  }, [nodes, centerX, verticalSpacing, topPadding, nodeWidth, nodeHeight]);

  const totalHeight = Math.max(
    500,
    topPadding + nodes.length * verticalSpacing + 60
  );

  // Drag handlers for canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag on primary click on canvas
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, +(prev - 0.15).toFixed(2)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeSelect = useCallback(
    (node: FlowchartNode) => {
      setSelectedNodeId(node.id);
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  const getNodeColors = (type: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: "rgba(0, 240, 255, 0.22)",
        stroke: "var(--accent-primary, #00f0ff)",
        strokeWidth: 2.5,
        textColor: "#00f0ff",
      };
    }
    switch (type) {
      case "start":
      case "end":
        return {
          fill: "rgba(16, 185, 129, 0.16)",
          stroke: "#10b981",
          strokeWidth: 1.8,
          textColor: "#34d399",
        };
      case "decision":
        return {
          fill: "rgba(245, 158, 11, 0.16)",
          stroke: "#f59e0b",
          strokeWidth: 1.8,
          textColor: "#fbbf24",
        };
      case "io":
        return {
          fill: "rgba(168, 85, 247, 0.16)",
          stroke: "#a855f7",
          strokeWidth: 1.8,
          textColor: "#c084fc",
        };
      case "process":
      default:
        return {
          fill: "rgba(255, 255, 255, 0.05)",
          stroke: "rgba(255, 255, 255, 0.2)",
          strokeWidth: 1.5,
          textColor: "#e2e8f0",
        };
    }
  };

  const renderNodeShape = (
    pos: { x: number; y: number; width: number; height: number; node: FlowchartNode }
  ) => {
    const { x, y, width: w, height: h, node } = pos;
    const isSelected = selectedNodeId === node.id;
    const type = (node.type || "process").toLowerCase();
    const colors = getNodeColors(type, isSelected);

    switch (type) {
      case "start":
      case "end":
        return (
          <rect
            x={x - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            rx={h / 2}
            ry={h / 2}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={colors.strokeWidth}
            className="transition-all duration-200"
          />
        );
      case "decision": {
        const halfW = w / 2 + 10;
        const halfH = h / 2 + 6;
        const points = `${x},${y - halfH} ${x + halfW},${y} ${x},${y + halfH} ${x - halfW},${y}`;
        return (
          <polygon
            points={points}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={colors.strokeWidth}
            className="transition-all duration-200"
          />
        );
      }
      case "io": {
        const skew = 18;
        const points = `${x - w / 2 + skew},${y - h / 2} ${x + w / 2 + skew},${y - h / 2} ${x + w / 2 - skew},${y + h / 2} ${x - w / 2 - skew},${y + h / 2}`;
        return (
          <polygon
            points={points}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={colors.strokeWidth}
            className="transition-all duration-200"
          />
        );
      }
      case "process":
      default:
        return (
          <rect
            x={x - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            rx={10}
            ry={10}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={colors.strokeWidth}
            className="transition-all duration-200"
          />
        );
    }
  };

  const getLineLabel = (node: FlowchartNode) => {
    const line = node.line ?? node.startLine ?? (node.lines && node.lines[0]);
    if (line !== undefined) {
      return `L${line}`;
    }
    return null;
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#0d0d14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative select-none ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[var(--accent-muted,rgba(0,240,255,0.15))] text-[var(--accent-primary,#00f0ff)]">
            <Workflow size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Control Flow
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {nodes.length} {nodes.length === 1 ? "step" : "steps"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Click any block to highlight code in editor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Zoom in flowchart"
          >
            <ZoomIn size={15} />
          </button>
          <span className="text-[10px] font-mono text-gray-400 px-1 min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Zoom out flowchart"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleResetView}
            title="Reset Pan & Zoom"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Reset zoom and position"
          >
            <RotateCcw size={15} />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button
            onClick={onClose}
            title="Close Flowchart (Restore Full Editor)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
            aria-label="Close flowchart panel"
          >
            <X size={14} />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex-1 relative w-full h-full overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ minHeight: "380px" }}
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
            <Info size={32} className="text-gray-500" />
            <p className="text-sm text-gray-400">
              No flowchart steps found. Try analyzing a function with structured
              code.
            </p>
          </div>
        ) : (
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${baseWidth} ${totalHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              {/* Arrowhead marker */}
              <marker
                id="flowchart-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 1, 7 4, 0 7"
                  fill="var(--accent-primary, #00f0ff)"
                />
              </marker>

              {/* Background dot grid */}
              <pattern
                id="flowchart-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="2"
                  cy="2"
                  r="1.2"
                  fill="rgba(255, 255, 255, 0.06)"
                />
              </pattern>
            </defs>

            {/* Background grid fill */}
            <rect
              width="100%"
              height="100%"
              fill="url(#flowchart-grid)"
              className="pointer-events-none"
            />

            {/* Pan and Zoom Layer */}
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              className="transition-transform duration-75 ease-out"
            >
              {/* Directed Edges */}
              {edges.map((edge, idx) => {
                const fromPos = nodePositions.get(String(edge.from));
                const toPos = nodePositions.get(String(edge.to));
                if (!fromPos || !toPos) return null;

                const isDownward = toPos.y > fromPos.y;

                if (isDownward) {
                  const startX = fromPos.x;
                  const startY = fromPos.y + fromPos.height / 2;
                  const endX = toPos.x;
                  const endY = toPos.y - toPos.height / 2 - 4;

                  const midY = (startY + endY) / 2;

                  return (
                    <g key={`edge-${idx}`}>
                      <path
                        d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                        fill="none"
                        stroke="var(--accent-primary, #00f0ff)"
                        strokeWidth="2"
                        strokeOpacity="0.75"
                        markerEnd="url(#flowchart-arrowhead)"
                      />
                      {edge.label && (
                        <g>
                          <rect
                            x={(startX + endX) / 2 - 25}
                            y={midY - 9}
                            width="50"
                            height="18"
                            rx="4"
                            fill="#161622"
                            stroke="rgba(0, 240, 255, 0.3)"
                            strokeWidth="1"
                          />
                          <text
                            x={(startX + endX) / 2}
                            y={midY + 3}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill="#00f0ff"
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }

                // Upward / Loopback edge (e.g. while/for loop)
                const startX = fromPos.x + fromPos.width / 2;
                const startY = fromPos.y;
                const endX = toPos.x + toPos.width / 2 + 4;
                const endY = toPos.y;
                const loopOffset = Math.max(fromPos.x, toPos.x) + fromPos.width / 2 + 50;

                return (
                  <g key={`edge-${idx}`}>
                    <path
                      d={`M ${startX} ${startY} H ${loopOffset} V ${endY} H ${endX}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      strokeOpacity="0.8"
                      markerEnd="url(#flowchart-arrowhead)"
                    />
                    {edge.label && (
                      <text
                        x={loopOffset + 8}
                        y={(startY + endY) / 2}
                        fontSize="10"
                        fontWeight="600"
                        fill="#fbbf24"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {Array.from(nodePositions.values()).map((pos) => {
                const { node, x, y } = pos;
                const isSelected = selectedNodeId === node.id;
                const type = (node.type || "process").toLowerCase();
                const colors = getNodeColors(type, isSelected);
                const labelText =
                  node.label || node.text || node.name || node.type || "Step";
                const lineTag = getLineLabel(node);

                return (
                  <g
                    key={String(node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeSelect(node);
                    }}
                    className="cursor-pointer group"
                    tabIndex={0}
                    role="button"
                    aria-label={`${type} node: ${labelText}`}
                  >
                    {/* Visual Shape */}
                    {renderNodeShape(pos)}

                    {/* Node Text */}
                    <text
                      x={x}
                      y={lineTag ? y - 2 : y + 4}
                      textAnchor="middle"
                      fill={colors.textColor}
                      fontSize="12"
                      fontWeight={isSelected ? "700" : "600"}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      className="transition-colors select-none pointer-events-none"
                    >
                      {labelText.length > 24
                        ? labelText.slice(0, 23) + "…"
                        : labelText}
                    </text>

                    {/* Line Number Badge */}
                    {lineTag && (
                      <g className="pointer-events-none">
                        <text
                          x={x}
                          y={y + 14}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.45)"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {lineTag}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Footer Info / Legend */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/40 border-t border-white/5 text-[11px] text-gray-400 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
            Start/End
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400/80 inline-block rotate-45 scale-75" />
            Decision
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-400/80 inline-block skew-x-12" />
            I/O
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-gray-400/80 inline-block" />
            Process
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
          <Code2 size={12} />
          <span>Pan: Drag canvas • Zoom: +/-</span>
        </div>
      </div>
    </div>
  );
}
