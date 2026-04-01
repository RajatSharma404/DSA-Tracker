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
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import TopicNode from "./TopicNode";
import ProblemNode from "./ProblemNode";
import { Topic, Problem, dsaApi } from "@/lib/api";

const nodeTypes = {
  topicNode: TopicNode,
  problemNode: ProblemNode,
};

type StatusFilter = "ALL" | "TODO" | "DOING" | "DONE" | "DUE";
type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";

// Initial layout for first render only
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  savedPositions: Record<string, { x: number; y: number }>,
  direction = "LR",
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, ranksep: 56, nodesep: 34 });
  nodes.forEach((node) => {
    const isTopic = node.type === "topicNode";
    dagreGraph.setNode(node.id, {
      width: isTopic ? 268 : 212,
      height: isTopic ? 118 : 72,
    });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const persistedPosition = savedPositions[node.id];
    const isTopic = node.type === "topicNode";
    const nodeWidth = isTopic ? 268 : 212;
    const nodeHeight = isTopic ? 118 : 72;
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: persistedPosition ?? {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      draggable: true,
    };
  });

  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: "default",
    markerEnd: edge.markerEnd ?? {
      type: MarkerType.ArrowClosed,
      color: "rgba(148, 163, 184, 0.8)",
      width: 16,
      height: 16,
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export default function RoadmapGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [problemsByTopic, setProblemsByTopic] = useState<
    Record<string, Problem[]>
  >({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("ALL");

  const isProblemVisible = useCallback(
    (problem: Problem) => {
      const isDue =
        problem.status === "DONE" &&
        !!problem.nextReviewDate &&
        new Date(problem.nextReviewDate) <= new Date();

      const statusMatches =
        statusFilter === "ALL"
          ? true
          : statusFilter === "DUE"
            ? isDue
            : problem.status === statusFilter;

      const difficultyMatches =
        difficultyFilter === "ALL" || problem.difficulty === difficultyFilter;

      return statusMatches && difficultyMatches;
    },
    [statusFilter, difficultyFilter],
  );

  const toggleTopic = useCallback((topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedTopics(new Set(topicsData.map((t) => t.id)));
  }, [topicsData]);

  const collapseAll = useCallback(() => {
    setExpandedTopics(new Set());
  }, []);

  // Build nodes/edges and always auto-layout with Dagre
  const graphElements = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    topicsData.forEach((topic, index) => {
      const allProblems = problemsByTopic[topic.id] || [];
      const filteredProblems = allProblems.filter(isProblemVisible);
      const isExpanded = expandedTopics.has(topic.id);
      const visibleProblems = isExpanded ? filteredProblems : [];
      const hiddenCount = filteredProblems.length - visibleProblems.length;
      initialNodes.push({
        id: `topic-${topic.id}`,
        type: "topicNode",
        data: {
          label: topic.name,
          description: topic.description,
          progressPercentage: topic.progressPercentage,
          solvedProblems: topic.solvedProblems,
          totalProblems: topic.totalProblems,
          expanded: isExpanded,
          hiddenCount,
          onToggle: () => toggleTopic(topic.id),
        },
        position: { x: 0, y: 0 },
      });
      if (index > 0) {
        const prevCompleted = topicsData[index - 1].progressPercentage === 100;
        initialEdges.push({
          id: `edge-topics-${index}`,
          source: `topic-${topicsData[index - 1].id}`,
          target: `topic-${topic.id}`,
          type: "default",
          animated: false,
          style: {
            stroke: prevCompleted ? "#10b981" : "rgba(59,130,246,0.65)",
            strokeWidth: 2.1,
            strokeLinecap: "round",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: prevCompleted ? "#10b981" : "#3b82f6",
            width: 16,
            height: 16,
          },
        });
      }
      visibleProblems.forEach((problem) => {
        initialNodes.push({
          id: `prob-${problem.id}`,
          type: "problemNode",
          data: {
            label: problem.title,
            difficulty: problem.difficulty,
            status: problem.status,
            link: problem.link,
            nextReviewDate: problem.nextReviewDate,
          },
          position: { x: 0, y: 0 },
        });
        initialEdges.push({
          id: `edge-${topic.id}-${problem.id}`,
          source: `topic-${topic.id}`,
          target: `prob-${problem.id}`,
          type: "default",
          style: {
            stroke:
              problem.status === "DONE" ? "#10b981" : "rgba(255,255,255,0.24)",
            strokeWidth: problem.status === "DONE" ? 1.9 : 1.3,
            strokeDasharray: problem.status === "DONE" ? "0" : "4 6",
            strokeLinecap: "round",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color:
              problem.status === "DONE" ? "#10b981" : "rgba(226,232,240,0.7)",
            width: 14,
            height: 14,
          },
        });
      });
    });
    return getLayoutedElements(initialNodes, initialEdges, nodePositions, "LR");
  }, [
    topicsData,
    problemsByTopic,
    expandedTopics,
    isProblemVisible,
    toggleTopic,
    nodePositions,
  ]);

  const initData = async () => {
    try {
      const topics = await dsaApi.getTopics();
      console.log("Fetched topics:", topics);
      const allTopicProblemsPromises = topics.map((topic) =>
        dsaApi.getTopicProblems(topic.id),
      );
      const problemsSets = await Promise.all(allTopicProblemsPromises);
      const topicProblemMap: Record<string, Problem[]> = {};
      topics.forEach((topic, i) => {
        topicProblemMap[topic.id] = problemsSets[i];
      });
      console.log("Fetched problems by topic:", topicProblemMap);
      setTopicsData(topics);
      setProblemsByTopic(topicProblemMap);
      setExpandedTopics(new Set(topics.slice(0, 2).map((t) => t.id)));
    } catch (error) {
      console.error("Failed to fetch roadmap data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    setNodes(graphElements.nodes);
    setEdges(graphElements.edges);
  }, [graphElements, setNodes, setEdges]);

  // No manual drag logic; nodes are always auto-laid out

  if (loading) {
    return (
      <div className="flex h-150 w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white"></div>
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col h-150 w-full items-center justify-center text-gray-400 text-lg">
        <div>
          No roadmap data found. Please check your topics and problems data.
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Debug info:
          <br />
          Topics: {topicsData.length}
          <br />
          Problems:{" "}
          {Object.values(problemsByTopic).reduce(
            (acc, arr) => acc + arr.length,
            0,
          )}
          <br />
          Nodes: {nodes.length}
          <br />
        </div>
      </div>
    );
  }

  return (
    <div className="h-175 w-full bg-[#050505] rounded-4xl border border-white/5 overflow-hidden shadow-2xl relative">
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Solvable
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div> Completed
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-[#111] border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-gray-300 outline-hidden"
        >
          <option value="ALL">Status: All</option>
          <option value="TODO">Status: Todo</option>
          <option value="DOING">Status: Doing</option>
          <option value="DONE">Status: Done</option>
          <option value="DUE">Status: Due Review</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) =>
            setDifficultyFilter(e.target.value as DifficultyFilter)
          }
          className="bg-[#111] border border-white/10 rounded-md px-2 py-1 text-[11px] font-bold text-gray-300 outline-hidden"
        >
          <option value="ALL">Difficulty: All</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <button
          onClick={expandAll}
          className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold hover:bg-blue-500/30 transition-colors"
        >
          Expand
        </button>
        <button
          onClick={collapseAll}
          className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-colors"
        >
          Collapse
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={(_, node) => {
          setNodePositions((prev) => ({
            ...prev,
            [node.id]: node.position,
          }));
        }}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        minZoom={0.42}
        maxZoom={1.85}
        nodesDraggable={true}
      >
        <Background color="#1a1a1a" gap={26} />
        <Controls
          showInteractive={false}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "6px",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        />
        <MiniMap
          nodeColor={(n) => (n.type === "topicNode" ? "#3b82f6" : "#1f2937")}
          maskColor="rgba(0,0,0,0.7)"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
          }}
        />
      </ReactFlow>

      {/* Inject icon colours via a global style scoped to ReactFlow Controls */}
      <style>{`
        .react-flow__controls button {
          background: #1a1a1a !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          color: #fff !important;
          fill: #fff !important;
          width: 28px !important;
          height: 28px !important;
          transition: background 0.15s;
        }
        .react-flow__controls button:hover {
          background: #2a2a2a !important;
        }
        .react-flow__controls button svg {
          fill: #fff !important;
        }
      `}</style>
    </div>
  );
}
