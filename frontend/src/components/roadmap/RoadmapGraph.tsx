"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
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

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB",
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : ("top" as any);
    node.sourcePosition = isHorizontal ? "right" : ("bottom" as any);

    node.position = {
      x: nodeWithPosition.x - 125,
      y: nodeWithPosition.y - 50,
    };

    return node;
  });

  return { nodes, edges };
};

export default function RoadmapGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const initData = async () => {
    try {
      const topics = await dsaApi.getTopics();
      const allTopicProblemsPromises = topics.map((topic) =>
        dsaApi.getTopicProblems(topic.id),
      );
      const problemsSets = await Promise.all(allTopicProblemsPromises);

      const initialNodes: Node[] = [];
      const initialEdges: Edge[] = [];

      // Build Graph
      topics.forEach((topic, index) => {
        // Node for Topic
        initialNodes.push({
          id: `topic-${topic.id}`,
          type: "topicNode",
          data: {
            label: topic.name,
            description: topic.description,
            progressPercentage: topic.progressPercentage,
            solvedProblems: topic.solvedProblems,
            totalProblems: topic.totalProblems,
          },
          position: { x: 0, y: 0 }, // Will be positioned by dagre
        });

        // Connect Topic to next Topic
        if (index > 0) {
          initialEdges.push({
            id: `edge-topics-${index}`,
            source: `topic-${topics[index - 1].id}`,
            target: `topic-${topic.id}`,
            animated: topics[index - 1].progressPercentage === 100,
            style: {
              stroke:
                topics[index - 1].progressPercentage === 100
                  ? "#10b981"
                  : "#3b82f6",
              strokeWidth: 3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color:
                topics[index - 1].progressPercentage === 100
                  ? "#10b981"
                  : "#3b82f6",
            },
          });
        }

        // Problems for this topic
        const problems = problemsSets[index];
        problems.forEach((problem) => {
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
              stroke: problem.status === "DONE" ? "#10b981" : "#333",
              strokeWidth: 2,
              strokeDasharray: problem.status === "DONE" ? "0" : "5 5",
            },
          });
        });
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          initialNodes,
          initialEdges,
          "LR", // Left to Right looks better for tree-like branching
        );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    } catch (error) {
      console.error("Failed to fetch roadmap data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full bg-[#050505] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#1a1a1a" gap={20} />
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
          nodeColor={(n) => (n.type === "topicNode" ? "#3b82f6" : "#1a1a1a")}
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
