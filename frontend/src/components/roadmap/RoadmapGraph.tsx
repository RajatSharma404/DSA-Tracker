"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  MarkerType,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import TopicNode from "./TopicNode";
import ProblemNode from "./ProblemNode";
import ProblemDrawer from "./ProblemDrawer";
import { Topic, Problem, dsaApi } from "@/lib/api";
import { queryCache } from "@/lib/queryCache";
import {
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Sparkles,
  BookOpen,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const nodeTypes = {
  topicNode: TopicNode,
  problemNode: ProblemNode,
};

// Curriculum Phases Configuration
interface PhaseConfig {
  id: string;
  name: string;
  color: string;
  keywords: string[];
}

const PHASES: PhaseConfig[] = [
  {
    id: "phase-1",
    name: "Phase 1: Foundations",
    color: "#38bdf8",
    keywords: ["array", "string", "two pointer", "sliding window", "sorting", "searching", "math"],
  },
  {
    id: "phase-2",
    name: "Phase 2: Core Data Structures",
    color: "#34d399",
    keywords: ["linked list", "stack", "queue", "tree", "binary tree", "bst", "heap", "priority queue"],
  },
  {
    id: "phase-3",
    name: "Phase 3: Search & Graphs",
    color: "#fbbf24",
    keywords: ["binary search", "recursion", "backtracking", "graph", "bfs", "dfs", "disjoint", "dsu", "union"],
  },
  {
    id: "phase-4",
    name: "Phase 4: Advanced DP & Optimization",
    color: "#c084fc",
    keywords: ["greedy", "dynamic programming", "dp", "bit", "monotonic", "trie", "advanced graph", "segment"],
  },
];

function getTopicPhase(topicName: string): PhaseConfig {
  const lower = topicName.toLowerCase();
  for (const phase of PHASES) {
    if (phase.keywords.some((kw) => lower.includes(kw))) {
      return phase;
    }
  }
  return PHASES[0];
}

// 2D Multi-Tier Curriculum Dagre Layout
function getMultiTierLayout(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR",
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: isHorizontal ? 95 : 70,
    nodesep: isHorizontal ? 16 : 28,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    const isTopic = node.type === "topicNode";
    dagreGraph.setNode(node.id, {
      width: isTopic ? 290 : 230,
      height: isTopic ? 160 : 46,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id);
    const isTopic = node.type === "topicNode";
    const nodeWidth = isTopic ? 290 : 230;
    const nodeHeight = isTopic ? 160 : 46;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPos.x - nodeWidth / 2,
        y: nodeWithPos.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

function InnerRoadmapGraph() {
  const reactFlow = useReactFlow();
  const cachedTopics = queryCache.get<Topic[]>("topics");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(!cachedTopics);
  const [topicsData, setTopicsData] = useState<Topic[]>(cachedTopics || []);
  const [problemsByTopic, setProblemsByTopic] = useState<Record<string, Problem[]>>({});
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(new Set());
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTier, setActiveTier] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "DOING" | "DONE" | "DUE">("ALL");
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  // Initialize Topics & Problems
  const initData = async () => {
    if (!cachedTopics) setLoading(true);
    try {
      const topics = await dsaApi.getTopics();
      const problemPromises = topics.map((t) =>
        dsaApi.getTopicProblems(t.id).catch(() => [] as Problem[]),
      );
      const problemsSets = await Promise.all(problemPromises);
      const topicProblemMap: Record<string, Problem[]> = {};
      topics.forEach((t, i) => {
        topicProblemMap[t.id] = problemsSets[i];
      });

      setTopicsData(topics);
      setProblemsByTopic(topicProblemMap);
    } catch (err) {
      console.error("Failed to load roadmap graph", err);
      toast.error("Failed to load roadmap graph");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const toggleTopicExpand = useCallback((topicId: string) => {
    setExpandedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const expandAllTopics = useCallback(() => {
    setExpandedTopicIds(new Set(topicsData.map((t) => t.id)));
  }, [topicsData]);

  const collapseAllTopics = useCallback(() => {
    setExpandedTopicIds(new Set());
  }, []);

  // Filter helper for on-canvas problems
  const filterProblem = useCallback(
    (prob: Problem) => {
      const matchesDiff =
        difficultyFilter === "ALL" || prob.difficulty === difficultyFilter;

      const isDue =
        prob.status === "DONE" &&
        !!prob.nextReviewDate &&
        new Date(prob.nextReviewDate) <= new Date();

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "DUE"
            ? isDue
            : prob.status === statusFilter;

      return matchesDiff && matchesStatus;
    },
    [difficultyFilter, statusFilter],
  );

  // Construct Multi-Tier Graph Elements with All Questions & Curved Bezier Edges
  const graphElements = useMemo(() => {
    if (!topicsData || topicsData.length === 0) return { nodes: [], edges: [] };

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Group topics by Phase Tier
    const phaseBuckets: Record<string, Topic[]> = {
      "phase-1": [],
      "phase-2": [],
      "phase-3": [],
      "phase-4": [],
    };

    topicsData.forEach((t) => {
      const phase = getTopicPhase(t.name);
      phaseBuckets[phase.id].push(t);
    });

    // Create topic nodes & on-canvas expanded questions
    topicsData.forEach((topic) => {
      const phase = getTopicPhase(topic.name);
      if (activeTier !== "ALL" && activeTier !== phase.id) return;

      const isTarget = targetNodeId === `topic-${topic.id}`;
      const isCompleted = topic.progressPercentage === 100;
      const isExpanded = expandedTopicIds.has(topic.id);

      initialNodes.push({
        id: `topic-${topic.id}`,
        type: "topicNode",
        data: {
          label: topic.name,
          description: topic.description,
          progressPercentage: topic.progressPercentage,
          solvedProblems: topic.solvedProblems,
          totalProblems: topic.totalProblems,
          tier: phase.name,
          isTarget,
          isExpanded,
          onOpenDrawer: () => setSelectedTopicId(topic.id),
          onToggleExpand: () => toggleTopicExpand(topic.id),
        },
        position: { x: 0, y: 0 },
      });

      // If expanded, generate ALL matching question nodes with curved bezier edges
      if (isExpanded) {
        const allProblems = problemsByTopic[topic.id] || [];
        const matchingProblems = allProblems.filter(filterProblem);

        matchingProblems.forEach((prob) => {
          const isDone = prob.status === "DONE";
          const isDue =
            isDone &&
            !!prob.nextReviewDate &&
            new Date(prob.nextReviewDate) <= new Date();

          initialNodes.push({
            id: `prob-${topic.id}-${prob.id}`,
            type: "problemNode",
            data: {
              label: prob.title,
              difficulty: prob.difficulty,
              status: prob.status,
              link: prob.link,
              nextReviewDate: prob.nextReviewDate,
              problemId: prob.id,
            },
            position: { x: 0, y: 0 },
          });

          // Curved Bezier Edge
          initialEdges.push({
            id: `edge-prob-${topic.id}-${prob.id}`,
            source: `topic-${topic.id}`,
            target: `prob-${topic.id}-${prob.id}`,
            type: "default", // Smooth cubic bezier curve
            className: "edge-flow-anim",
            style: {
              stroke: isDue
                ? "#f59e0b"
                : isDone
                  ? "#10b981"
                  : "var(--accent-primary)",
              strokeWidth: isDone ? 2 : 1.5,
              strokeDasharray: "6 6",
              opacity: isDone ? 0.9 : 0.6,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isDue ? "#f59e0b" : isDone ? "#10b981" : "var(--accent-primary)",
              width: 12,
              height: 12,
            },
          });
        });
      }
    });

    // Build inter-topic dependency edges across phases
    const phaseOrder = ["phase-1", "phase-2", "phase-3", "phase-4"];

    phaseOrder.forEach((phaseId, phaseIdx) => {
      const currentBucket = phaseBuckets[phaseId];

      // Intra-tier linear sequence
      for (let i = 0; i < currentBucket.length - 1; i++) {
        const from = currentBucket[i];
        const to = currentBucket[i + 1];
        if (activeTier !== "ALL" && activeTier !== phaseId) continue;

        const isCompleted = from.progressPercentage === 100;

        initialEdges.push({
          id: `edge-intra-${from.id}-${to.id}`,
          source: `topic-${from.id}`,
          target: `topic-${to.id}`,
          type: "default", // Smooth curved bezier
          className: "edge-flow-anim",
          animated: !isCompleted && from.progressPercentage > 0,
          style: {
            stroke: isCompleted ? "#10b981" : "var(--accent-primary)",
            strokeWidth: 2.2,
            strokeDasharray: "8 6",
            filter: isCompleted
              ? "drop-shadow(0 0 4px rgba(16,185,129,0.5))"
              : "drop-shadow(0 0 4px var(--accent-glow))",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCompleted ? "#10b981" : "var(--accent-primary)",
            width: 14,
            height: 14,
          },
        });
      }

      // Inter-tier bridge edges (from last of previous phase to first of current phase)
      if (phaseIdx > 0 && activeTier === "ALL") {
        const prevBucket = phaseBuckets[phaseOrder[phaseIdx - 1]];
        if (prevBucket.length > 0 && currentBucket.length > 0) {
          const from = prevBucket[prevBucket.length - 1];
          const to = currentBucket[0];
          const isCompleted = from.progressPercentage === 100;

          initialEdges.push({
            id: `edge-bridge-${from.id}-${to.id}`,
            source: `topic-${from.id}`,
            target: `topic-${to.id}`,
            type: "default", // Smooth curved bezier
            className: "edge-flow-anim",
            animated: true,
            style: {
              stroke: isCompleted ? "#10b981" : "#c084fc",
              strokeWidth: 2.8,
              strokeDasharray: "8 8",
              filter: isCompleted
                ? "drop-shadow(0 0 6px rgba(16,185,129,0.6))"
                : "drop-shadow(0 0 6px rgba(192,132,252,0.6))",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCompleted ? "#10b981" : "#c084fc",
              width: 16,
              height: 16,
            },
          });
        }
      }
    });

    return getMultiTierLayout(initialNodes, initialEdges, "LR");
  }, [
    topicsData,
    problemsByTopic,
    expandedTopicIds,
    activeTier,
    targetNodeId,
    filterProblem,
    toggleTopicExpand,
  ]);

  useEffect(() => {
    setNodes(graphElements.nodes);
    setEdges(graphElements.edges);
  }, [graphElements, setNodes, setEdges]);

  // Search & Camera Auto-Focus
  const handleSearchJump = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setTargetNodeId(null);
      return;
    }

    const match = topicsData.find((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (match) {
      const nodeId = `topic-${match.id}`;
      setTargetNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        reactFlow.setCenter(node.position.x + 140, node.position.y + 70, {
          zoom: 1.15,
          duration: 700,
        });
      }
    } else {
      setTargetNodeId(null);
    }
  };

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return topicsData.find((t) => t.id === selectedTopicId) || null;
  }, [selectedTopicId, topicsData]);

  const selectedTopicProblems = useMemo(() => {
    if (!selectedTopicId) return [];
    return problemsByTopic[selectedTopicId] || [];
  }, [selectedTopicId, problemsByTopic]);

  if (loading) {
    return (
      <div className="flex h-160 w-full items-center justify-center rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)]" />
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest font-mono">
            Compiling Curriculum Metro Map...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-185 w-full rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-2xl">
      {/* Top Floating Control Console */}
      <div className="absolute top-5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Search Jump Bar */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Jump to topic..."
              value={searchQuery}
              onChange={(e) => handleSearchJump(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchJump("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 text-xs font-bold text-gray-300 outline-hidden shadow-lg cursor-pointer"
          >
            <option value="ALL">Difficulty: All</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 text-xs font-bold text-gray-300 outline-hidden shadow-lg cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value="TODO">Todo</option>
            <option value="DOING">Doing</option>
            <option value="DONE">Done</option>
            <option value="DUE">Due Review</option>
          </select>
        </div>

        {/* Right: Global Expand/Collapse & Phase Filters */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
            <button
              onClick={expandAllTopics}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronDown size={12} />
              Expand All ({topicsData.reduce((acc, t) => acc + (problemsByTopic[t.id]?.length || 0), 0)}+)
            </button>
            <button
              onClick={collapseAllTopics}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronUp size={12} />
              Collapse
            </button>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
            <button
              onClick={() => setActiveTier("ALL")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTier === "ALL"
                  ? "bg-white text-black font-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Phases
            </button>
            {PHASES.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActiveTier(phase.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer hidden md:inline-block ${
                  activeTier === phase.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {phase.name.split(":")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ReactFlow Canvas with Curved Bezier Connections */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        onlyRenderVisibleElements={true}
        fitView
        fitViewOptions={{ padding: 0.16, duration: 600 }}
        minZoom={0.03}
        maxZoom={1.8}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background color="#161622" gap={28} size={1} />
        <Controls
          showInteractive={false}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "6px",
            background: "rgba(10, 10, 16, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        />
        <MiniMap
          nodeColor={(n) =>
            n.type === "topicNode"
              ? n.data?.isTarget
                ? "#06b6d4"
                : "#3b82f6"
              : "#6366f1"
          }
          maskColor="rgba(0,0,0,0.75)"
          style={{
            background: "#090910",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
          }}
        />
      </ReactFlow>

      {/* Slide-Over Problem Matrix Drawer */}
      <ProblemDrawer
        isOpen={!!selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
        topic={selectedTopic}
        problems={selectedTopicProblems}
      />
    </div>
  );
}

export default function RoadmapGraph() {
  return (
    <ReactFlowProvider>
      <InnerRoadmapGraph />
    </ReactFlowProvider>
  );
}
