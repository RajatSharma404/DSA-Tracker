"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  ArrowDownToLine,
  BookOpen,
  Copy,
  FileUp,
  FolderOpen,
  Layers3,
  Link2,
  Loader2,
  MessageSquareText,
  Play,
  Plus,
  Search,
  Tags,
  TextCursorInput,
  Trash2,
  Workflow,
} from "lucide-react";
import { dsaApi, SearchProblem, UserTag } from "@/lib/api";
import {
  createDefaultNodeData,
  getDefaultAccent,
  parseRoadmapText,
  serializeRoadmapText,
  type RoadmapNodeData,
  type RoadmapNodeKind,
} from "./roadmapText";

type BuilderTab = "nodes" | "questions" | "tags" | "text";

type DragPayload =
  | { kind: RoadmapNodeKind }
  | { kind: "problem"; problem: SearchProblem }
  | { kind: "tag"; tag: UserTag };

const STORAGE_KEY = "dsa-custom-roadmap-text-v1";

function RoadmapBuilderNode({
  id,
  data,
  selected,
}: NodeProps<RoadmapNodeData>) {
  const { deleteElements } = useReactFlow();

  const deleteNode = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void deleteElements({ nodes: [{ id }] });
    },
    [deleteElements, id],
  );

  const commonBorder = selected
    ? "border-white/50 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_20px_60px_rgba(0,0,0,0.45)]"
    : "border-white/10";

  const toneClasses: Record<RoadmapNodeKind, string> = {
    starting: "bg-sky-500/10 text-sky-300",
    folder: "bg-fuchsia-500/10 text-fuchsia-300",
    problem: "bg-emerald-500/10 text-emerald-300",
    notes: "bg-amber-500/10 text-amber-300",
    tag: "bg-pink-500/10 text-pink-300",
  };

  const iconByKind: Record<RoadmapNodeKind, React.ReactNode> = {
    starting: <Play size={14} />,
    folder: <FolderOpen size={14} />,
    problem: <BookOpen size={14} />,
    notes: <MessageSquareText size={14} />,
    tag: <Tags size={14} />,
  };

  return (
    <div
      className={`group relative min-w-52.5 rounded-[1.2rem] border bg-[#0c0c0c] px-4 py-3 backdrop-blur-xl transition-all duration-200 ${commonBorder}`}
      style={{
        boxShadow: `0 0 0 1px ${data.accent}1f, 0 22px 45px rgba(0,0,0,0.55)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at 50% 10%, ${data.accent}22, transparent 58%)`,
        }}
      />

      <button
        type="button"
        onClick={deleteNode}
        className={`absolute right-2 top-2 z-20 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 transition-all hover:bg-red-500/20 ${
          selected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
        title="Delete node"
        aria-label="Delete node"
      >
        <Trash2 size={12} />
      </button>

      <DualHandle position={Position.Left} accent={data.accent} />
      <DualHandle position={Position.Right} accent={data.accent} />

      <div className="relative z-10 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 ${toneClasses[data.kind]}`}
        >
          {iconByKind[data.kind]}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-black text-white">
              {data.label}
            </h4>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
              {data.kind}
            </span>
          </div>

          {data.kind === "problem" && data.problemTitle ? (
            <p className="mt-1 truncate text-xs text-gray-400">
              {data.problemTitle}
            </p>
          ) : null}

          {data.kind === "notes" && data.text ? (
            <p className="mt-1 line-clamp-2 text-xs text-gray-400">
              {data.text}
            </p>
          ) : null}

          {data.kind === "tag" ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(data.tagNames || []).length > 0 ? (
                data.tagNames?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-300"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">
                  Pick tags in the panel.
                </span>
              )}
            </div>
          ) : null}

          {(data.description || data.topicName || data.problemDifficulty) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
              {data.description ? <span>{data.description}</span> : null}
              {data.topicName ? <span>{data.topicName}</span> : null}
              {data.problemDifficulty ? (
                <span>{data.problemDifficulty}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HandleBubble({
  position,
  accent,
  type,
  offsetY,
}: {
  position: Position;
  accent: string;
  type: "source" | "target";
  offsetY: string;
}) {
  return (
    <Handle
      id={`${position}-${type}`}
      type={type}
      position={position}
      className="h-3! w-3! border-none!"
      style={{
        top: offsetY,
        transform: "translateY(-50%)",
        background: accent,
        boxShadow: `0 0 0 4px ${accent}22`,
      }}
    />
  );
}

function DualHandle({
  position,
  accent,
}: {
  position: Position;
  accent: string;
}) {
  return (
    <>
      <HandleBubble
        position={position}
        accent={accent}
        type="target"
        offsetY="43%"
      />
      <HandleBubble
        position={position}
        accent={accent}
        type="source"
        offsetY="57%"
      />
    </>
  );
}

const nodeTypes = {
  roadmapBuilder: RoadmapBuilderNode,
};

function BuilderWorkspace() {
  const flow = useReactFlow();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [title, setTitle] = useState("Custom Roadmap");
  const [activeTab, setActiveTab] = useState<BuilderTab>("nodes");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [availableProblems, setAvailableProblems] = useState<SearchProblem[]>(
    [],
  );
  const [availableTags, setAvailableTags] = useState<UserTag[]>([]);
  const [problemQuery, setProblemQuery] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState<string>("ALL");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [importDraft, setImportDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const hasHydrated = useRef(false);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const serializedText = useMemo(
    () => serializeRoadmapText({ title, nodes, edges }),
    [title, nodes, edges],
  );

  const filteredProblems = useMemo(() => {
    const query = problemQuery.trim().toLowerCase();
    return availableProblems.filter((problem) => {
      const matchesQuery = !query
        ? true
        : [
            problem.title,
            problem.topicName,
            ...(problem.tags || []).map((tag) => tag.name),
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
      const matchesDifficulty =
        problemDifficulty === "ALL" || problem.difficulty === problemDifficulty;
      return matchesQuery && matchesDifficulty;
    });
  }, [availableProblems, problemQuery, problemDifficulty]);

  const matchingTagProblems = useMemo(() => {
    if (selectedTagIds.length === 0) return availableProblems;
    return availableProblems.filter((problem) =>
      selectedTagIds.every((tagId) =>
        problem.tags?.some((tag) => tag.id === tagId),
      ),
    );
  }, [availableProblems, selectedTagIds]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [problems, tags] = await Promise.all([
        dsaApi.searchProblems({}).catch((err) => {
          console.error("Failed to fetch problems:", err);
          return [];
        }),
        dsaApi.getTags().catch((err) => {
          console.error("Failed to fetch tags:", err);
          return [] as UserTag[];
        }),
      ]);
      setAvailableProblems(problems);
      setAvailableTags(tags);

      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = parseRoadmapText(saved);
          if (parsed.nodes.length || parsed.edges.length) {
            console.log(
              "Restoring saved roadmap:",
              parsed.nodes.length,
              "nodes",
            );
            setTitle(parsed.title || "Custom Roadmap");
            setNodes(
              parsed.nodes.map((node) => ({
                ...node,
                type: "roadmapBuilder",
                data: {
                  ...createDefaultNodeData(node.data.kind, node.data),
                  ...node.data,
                },
              })),
            );
            setEdges(parsed.edges);
            setSelectedNodeId(null);
          }
        } catch (parseError) {
          console.error("Failed to parse saved roadmap:", parseError);
        }
      }
    } catch (error) {
      console.error("Failed to load roadmap builder data", error);
    } finally {
      hasHydrated.current = true;
      setLoading(false);
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, serializedText);
  }, [serializedText]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    if (selectedNode.data.kind === "problem") setActiveTab("questions");
    if (selectedNode.data.kind === "tag") {
      setActiveTab("tags");
    }
  }, [selectedNode]);

  useEffect(() => {
    if (nodes.length > 0) {
      window.requestAnimationFrame(() => {
        flow.fitView({ padding: 0.18, duration: 400 });
      });
    }
  }, [nodes.length, flow]);

  useEffect(() => {
    if (selectedNode?.data.kind !== "tag") return;
    const nextSelection = selectedNode.data.tagIds || [];
    if (nextSelection.join("|") !== selectedTagIds.join("|")) {
      setSelectedTagIds(nextSelection);
    }
  }, [selectedNode?.data.kind, selectedNode?.data.tagIds, selectedTagIds]);

  const generateNodeId = (kind: RoadmapNodeKind) =>
    `roadmap-${kind}-${crypto.randomUUID().slice(0, 8)}`;

  const createNode = useCallback(
    (kind: RoadmapNodeKind, payload?: DragPayload) => {
      const id = generateNodeId(kind);
      const base = createDefaultNodeData(kind, {
        accent: getDefaultAccent(kind),
      });

      let nextData = base;
      if (payload && "problem" in payload) {
        nextData = {
          ...base,
          kind: "problem",
          label: payload.problem.title,
          description: payload.problem.topicName,
          problemId: payload.problem.id,
          problemTitle: payload.problem.title,
          problemDifficulty: payload.problem.difficulty,
          topicName: payload.problem.topicName,
          link: payload.problem.link || undefined,
        };
      }

      if (payload && "tag" in payload) {
        nextData = {
          ...base,
          kind: "tag",
          label: payload.tag.name,
          description: "Tag filter",
          tagIds: [payload.tag.id],
          tagNames: [payload.tag.name],
          tagColors: [payload.tag.color],
          problemIds: availableProblems
            .filter((problem) =>
              problem.tags?.some((tag) => tag.id === payload.tag.id),
            )
            .map((problem) => problem.id),
        };
      }

      const nextNode: Node<RoadmapNodeData> = {
        id,
        type: "roadmapBuilder",
        position: {
          x: 120 + ((nodes.length * 42) % 280),
          y: 120 + ((nodes.length * 26) % 180),
        },
        data: nextData,
      };

      setNodes((current) => [...current, nextNode]);
      setSelectedNodeId(id);
      if (kind === "problem") setActiveTab("questions");
      if (kind === "tag") {
        setActiveTab("tags");
        if (payload && "tag" in payload) {
          setSelectedTagIds([payload.tag.id]);
        }
      }
    },
    [availableProblems, nodes.length, setNodes],
  );

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<RoadmapNodeData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...patch,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const assignProblemToNode = useCallback(
    (problem: SearchProblem) => {
      if (selectedNode && selectedNode.data.kind === "problem") {
        updateNodeData(selectedNode.id, {
          label: problem.title,
          description: problem.topicName,
          problemId: problem.id,
          problemTitle: problem.title,
          problemDifficulty: problem.difficulty,
          topicName: problem.topicName,
          link: problem.link || undefined,
          accent: getDefaultAccent("problem"),
        });
        setActiveTab("questions");
        return;
      }

      createNode("problem", { kind: "problem", problem });
    },
    [createNode, selectedNode, updateNodeData],
  );

  const assignTagsToNode = useCallback(
    (tagIds: string[]) => {
      if (!selectedNode || selectedNode.data.kind !== "tag") return;
      const tagList = tagIds
        .map((tagId) => availableTags.find((tag) => tag.id === tagId))
        .filter(Boolean) as UserTag[];

      updateNodeData(selectedNode.id, {
        label:
          tagList.length > 0
            ? tagList.map((tag) => tag.name).join(" + ")
            : "Tag Node",
        tagIds,
        tagNames: tagList.map((tag) => tag.name),
        tagColors: tagList.map((tag) => tag.color),
        problemIds: availableProblems
          .filter((problem) =>
            tagIds.every((tagId) =>
              problem.tags?.some((tag) => tag.id === tagId),
            ),
          )
          .map((problem) => problem.id),
      });
      setSelectedTagIds(tagIds);
      setActiveTab("tags");
    },
    [availableProblems, availableTags, selectedNode, updateNodeData],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const source = connection.source;
      const target = connection.target;
      const sourceHandle = connection.sourceHandle || null;
      const targetHandle = connection.targetHandle || null;

      setEdges((current) => {
        const alreadyLinked = current.some(
          (edge) =>
            edge.source === source &&
            edge.target === target &&
            (edge.sourceHandle || null) === sourceHandle &&
            (edge.targetHandle || null) === targetHandle,
        );
        if (alreadyLinked) return current;

        return [
          ...current,
          {
            id: `edge-${source}-${sourceHandle || "default"}-${target}-${targetHandle || "default"}`,
            source,
            target,
            sourceHandle,
            targetHandle,
            type: "default",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "rgba(148, 163, 184, 0.85)",
            },
            style: {
              stroke: "rgba(148, 163, 184, 0.7)",
              strokeWidth: 2,
            },
          },
        ];
      });
    },
    [setEdges],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/x-roadmap-builder");
      if (!raw) return;

      const payload = JSON.parse(raw) as DragPayload;
      const bounds = canvasRef.current?.getBoundingClientRect();
      const position = bounds
        ? flow.project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          })
        : {
            x: 120 + ((nodes.length * 42) % 280),
            y: 120 + ((nodes.length * 26) % 180),
          };

      const kind =
        "problem" in payload
          ? "problem"
          : "tag" in payload
            ? "tag"
            : payload.kind;
      const id = generateNodeId(kind);
      const base = createDefaultNodeData(kind, {
        accent: getDefaultAccent(kind),
      });

      const nextData: RoadmapNodeData =
        "problem" in payload
          ? {
              ...base,
              kind: "problem",
              label: payload.problem.title,
              description: payload.problem.topicName,
              problemId: payload.problem.id,
              problemTitle: payload.problem.title,
              problemDifficulty: payload.problem.difficulty,
              topicName: payload.problem.topicName,
              link: payload.problem.link || undefined,
            }
          : "tag" in payload
            ? {
                ...base,
                kind: "tag",
                label: payload.tag.name,
                description: "Tag filter",
                tagIds: [payload.tag.id],
                tagNames: [payload.tag.name],
                tagColors: [payload.tag.color],
                problemIds: availableProblems
                  .filter((problem) =>
                    problem.tags?.some((tag) => tag.id === payload.tag.id),
                  )
                  .map((problem) => problem.id),
              }
            : base;

      setNodes((current) => [
        ...current,
        {
          id,
          type: "roadmapBuilder",
          position,
          data: nextData,
        },
      ]);

      setSelectedNodeId(id);
      if (kind === "problem") setActiveTab("questions");
      if (kind === "tag") {
        setActiveTab("tags");
        if ("tag" in payload) setSelectedTagIds([payload.tag.id]);
      }
    },
    [availableProblems, flow, nodes.length, setNodes],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const startDrag =
    (payload: DragPayload) => (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.setData(
        "application/x-roadmap-builder",
        JSON.stringify(payload),
      );
      event.dataTransfer.effectAllowed = "copy";
    };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) =>
      current.filter(
        (edge) =>
          edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    );
    setSelectedNodeId(null);
  };

  const removeSelectedElements = useCallback(() => {
    const selectedNodeIds = new Set(
      nodes
        .filter((node) => node.selected || node.id === selectedNodeId)
        .map((node) => node.id),
    );

    if (selectedNodeIds.size === 0) return;

    setNodes((currentNodes) =>
      currentNodes.filter((node) => !selectedNodeIds.has(node.id)),
    );
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target) &&
          !edge.selected,
      ),
    );

    if (selectedNodeId && selectedNodeIds.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId, setEdges, setNodes]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      removeSelectedElements();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [removeSelectedElements]);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedTagIds([]);
  };

  const importText = () => {
    const parsed = parseRoadmapText(importDraft);
    setTitle(parsed.title || "Custom Roadmap");
    setNodes(
      parsed.nodes.map((node) => ({
        ...node,
        type: "roadmapBuilder",
        data: {
          ...createDefaultNodeData(node.data.kind, node.data),
          ...node.data,
        },
      })),
    );
    setEdges(parsed.edges);
    setSelectedNodeId(null);
    setActiveTab("text");
    setTimeout(() => flow.fitView({ padding: 0.18, duration: 300 }), 0);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(serializedText);
    setExportMessage("Copied to clipboard");
    window.setTimeout(() => setExportMessage(null), 1800);
  };

  const downloadText = () => {
    const blob = new Blob([serializedText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "custom-roadmap"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExportMessage("Downloaded roadmap text");
    window.setTimeout(() => setExportMessage(null), 1800);
  };

  const loadTextFile = async (file: File) => {
    const text = await file.text();
    setImportDraft(text);
    const parsed = parseRoadmapText(text);
    setTitle(parsed.title || "Custom Roadmap");
    setNodes(
      parsed.nodes.map((node) => ({
        ...node,
        type: "roadmapBuilder",
        data: {
          ...createDefaultNodeData(node.data.kind, node.data),
          ...node.data,
        },
      })),
    );
    setEdges(parsed.edges);
    setSelectedNodeId(null);
    setActiveTab("text");
    setTimeout(() => flow.fitView({ padding: 0.18, duration: 300 }), 0);
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center rounded-4xl border border-white/5 bg-[#050505]">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
          <Loader2 className="animate-spin" size={16} />
          Loading custom roadmap builder...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
            <Layers3 size={12} /> Custom Builder
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
            Build a roadmap that feels like the current one, but yours.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Lay out starting points, folders, problem nodes, note cards, and tag
            filters. The map is saved as plain text and updates as you connect
            or disconnect nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyText}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-200 transition-colors hover:bg-white/10"
          >
            <Copy size={14} /> Copy text
          </button>
          <button
            onClick={downloadText}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200 transition-colors hover:bg-blue-500/20"
          >
            <ArrowDownToLine size={14} /> Download
          </button>
          {exportMessage ? (
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
              {exportMessage}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative min-h-[72vh] overflow-hidden rounded-4xl border border-white/5 bg-[#050505] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_26%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 backdrop-blur-md">
            {nodes.length} nodes · {edges.length} links
          </div>

          <div className="pointer-events-none absolute right-5 top-5 z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-sky-400" /> Empty canvas
            <div className="h-2 w-2 rounded-full bg-emerald-400" /> Auto text
            sync
          </div>

          {nodes.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center p-10 text-center">
              <div className="max-w-md rounded-[1.8rem] border border-white/10 bg-black/40 px-8 py-10 backdrop-blur-md">
                <h3 className="text-xl font-black text-white">
                  Start with an empty map.
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Add nodes from the right panel or drag a problem or tag
                  straight onto the field. Connect nodes with the built-in
                  handles, and the plain-text roadmap updates automatically.
                </p>
              </div>
            </div>
          ) : null}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            connectionMode={ConnectionMode.Loose}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              if (node.data.kind === "problem") setActiveTab("questions");
              if (node.data.kind === "tag") {
                setActiveTab("tags");
                setSelectedTagIds(node.data.tagIds || []);
              }
            }}
            onSelectionChange={({ nodes: selectedNodes }) => {
              if (selectedNodes.length === 1) {
                setSelectedNodeId(selectedNodes[0].id);
                return;
              }
              if (selectedNodes.length === 0) {
                setSelectedNodeId(null);
              }
            }}
            onPaneClick={() => setSelectedNodeId(null)}
            onNodeDragStart={(_, node) => {
              setSelectedNodeId(node.id);
            }}
            defaultEdgeOptions={{
              type: "default",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "rgba(148, 163, 184, 0.85)",
              },
              style: {
                stroke: "rgba(148, 163, 184, 0.72)",
                strokeWidth: 2,
              },
            }}
            fitView
            minZoom={0.4}
            maxZoom={1.8}
            className="relative h-full w-full"
          >
            <Background color="rgba(148,163,184,0.14)" gap={24} />
            <Controls
              showInteractive={false}
              style={{
                background: "rgba(10, 10, 10, 0.88)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
              }}
            />
          </ReactFlow>
        </div>

        <div className="flex min-h-[72vh] flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#0c0c0c] shadow-[0_30px_120px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 border-b border-white/5 p-3">
            {[
              { id: "nodes", label: "Nodes", icon: Workflow },
              { id: "questions", label: "Questions", icon: Search },
              { id: "tags", label: "Tags", icon: Tags },
              { id: "text", label: "Text", icon: TextCursorInput },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as BuilderTab)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.25em] transition-colors ${
                    active
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <tab.icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden p-4">
            {activeTab === "nodes" ? (
              <NodesTab
                selectedNode={selectedNode}
                title={title}
                setTitle={setTitle}
                onCreateNode={createNode}
                onUpdateNode={updateNodeData}
                onDeleteNode={removeSelectedNode}
                onClearCanvas={clearCanvas}
                onDragStart={startDrag}
                canvasCount={nodes.length}
              />
            ) : null}

            {activeTab === "questions" ? (
              <QuestionsTab
                problems={filteredProblems}
                selectedProblemId={selectedNode?.data.problemId}
                problemQuery={problemQuery}
                setProblemQuery={setProblemQuery}
                problemDifficulty={problemDifficulty}
                setProblemDifficulty={setProblemDifficulty}
                onDragStart={startDrag}
                onPick={assignProblemToNode}
              />
            ) : null}

            {activeTab === "tags" ? (
              <TagsTab
                tags={availableTags}
                selectedTagIds={selectedTagIds}
                setSelectedTagIds={assignTagsToNode}
                problems={matchingTagProblems}
                onDragStart={startDrag}
              />
            ) : null}

            {activeTab === "text" ? (
              <TextTab
                text={serializedText}
                importDraft={importDraft}
                setImportDraft={setImportDraft}
                onImport={importText}
                onLoadFile={loadTextFile}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function NodesTab({
  selectedNode,
  title,
  setTitle,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onClearCanvas,
  onDragStart,
  canvasCount,
}: {
  selectedNode: Node<RoadmapNodeData> | null;
  title: string;
  setTitle: (value: string) => void;
  onCreateNode: (kind: RoadmapNodeKind) => void;
  onUpdateNode: (nodeId: string, patch: Partial<RoadmapNodeData>) => void;
  onDeleteNode: () => void;
  onClearCanvas: () => void;
  onDragStart: (
    payload: DragPayload,
  ) => (event: DragEvent<HTMLElement>) => void;
  canvasCount: number;
}) {
  const nodeKinds: Array<{
    kind: RoadmapNodeKind;
    label: string;
    icon: React.ReactNode;
  }> = [
    { kind: "starting", label: "Starting Node", icon: <Play size={14} /> },
    { kind: "folder", label: "Folder Node", icon: <FolderOpen size={14} /> },
    { kind: "problem", label: "Problem Node", icon: <BookOpen size={14} /> },
    {
      kind: "notes",
      label: "Notes Node",
      icon: <MessageSquareText size={14} />,
    },
    { kind: "tag", label: "Tag Node", icon: <Tags size={14} /> },
  ];

  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Roadmap Title
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-sky-400/40"
            placeholder="My custom roadmap"
          />
        </div>

        {selectedNode ? (
          <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                  Selected Node
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  {selectedNode.data.label}
                </h3>
              </div>
              <button
                onClick={onDeleteNode}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <input
                value={selectedNode.data.label}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, { label: event.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/40"
              />
              <textarea
                value={
                  selectedNode.data.description || selectedNode.data.text || ""
                }
                onChange={(event) =>
                  onUpdateNode(
                    selectedNode.id,
                    selectedNode.data.kind === "notes"
                      ? { text: event.target.value }
                      : { description: event.target.value },
                  )
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/40"
                placeholder="Add context for this node"
              />
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                <span>Type: {selectedNode.data.kind}</span>
                {selectedNode.data.kind === "problem" &&
                selectedNode.data.problemDifficulty ? (
                  <span>Difficulty: {selectedNode.data.problemDifficulty}</span>
                ) : null}
                {selectedNode.data.kind === "tag" &&
                selectedNode.data.matchMode ? (
                  <span>Match: {selectedNode.data.matchMode}</span>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/5 bg-white/2 p-4 text-sm text-gray-400">
            Select a node to edit its label and metadata.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {nodeKinds.map((item) => (
            <button
              key={item.kind}
              draggable
              onDragStart={onDragStart({ kind: item.kind })}
              onClick={() => onCreateNode(item.kind)}
              className="group flex items-start gap-3 rounded-[1.35rem] border border-white/5 bg-white/2 p-4 text-left transition-all hover:border-white/15 hover:bg-white/4"
            >
              <div
                className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
                style={{
                  background: `${getDefaultAccent(item.kind)}18`,
                  color: getDefaultAccent(item.kind),
                }}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white">{item.label}</h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Drag this into the canvas or click to create it near the
                  center.
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Canvas
              </p>
              <h4 className="mt-1 text-sm font-black text-white">
                {canvasCount} nodes currently placed
              </h4>
            </div>
            <button
              onClick={onClearCanvas}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:bg-white/10"
            >
              Clear
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-gray-500">
            Connect nodes by dragging from the right handle of one node to the
            left handle of the next. The text file updates every time you move,
            connect, or delete nodes.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({
  problems,
  selectedProblemId,
  problemQuery,
  setProblemQuery,
  problemDifficulty,
  setProblemDifficulty,
  onDragStart,
  onPick,
}: {
  problems: SearchProblem[];
  selectedProblemId?: string;
  problemQuery: string;
  setProblemQuery: (value: string) => void;
  problemDifficulty: string;
  setProblemDifficulty: (value: string) => void;
  onDragStart: (
    payload: DragPayload,
  ) => (event: DragEvent<HTMLElement>) => void;
  onPick: (problem: SearchProblem) => void;
}) {
  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Search Problems
          </label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={14}
              />
              <input
                value={problemQuery}
                onChange={(event) => setProblemQuery(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-400/40"
                placeholder="Search by title, topic, or tag"
              />
            </div>
            <select
              value={problemDifficulty}
              onChange={(event) => setProblemDifficulty(event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 outline-none focus:border-sky-400/40"
            >
              <option value="ALL">All</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3">
          {problems.map((problem) => {
            const selected = selectedProblemId === problem.id;
            return (
              <div
                key={problem.id}
                draggable
                onDragStart={onDragStart({ kind: "problem", problem })}
                className={`rounded-[1.35rem] border p-4 transition-all ${
                  selected
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/5 bg-white/2 hover:border-white/15 hover:bg-white/4"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-white">
                      {problem.title}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      {problem.topicName}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                    {problem.difficulty}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(problem.tags || []).slice(0, 4).map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300"
                      style={{ backgroundColor: `${tag.color}1a` }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => onPick(problem)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-500/20"
                  >
                    <Plus size={14} /> Add or replace node
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">
                    Drag onto the canvas too
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TagsTab({
  tags,
  selectedTagIds,
  setSelectedTagIds,
  problems,
  onDragStart,
}: {
  tags: UserTag[];
  selectedTagIds: string[];
  setSelectedTagIds: (tagIds: string[]) => void;
  problems: SearchProblem[];
  onDragStart: (
    payload: DragPayload,
  ) => (event: DragEvent<HTMLElement>) => void;
}) {
  const [tagQuery, setTagQuery] = useState("");

  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tagQuery, tags]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
      return;
    }
    setSelectedTagIds([...selectedTagIds, tagId]);
  };

  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Tag Filter Node
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                Select one or more tags.
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
              Exact tag intersection
            </span>
          </div>

          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={14}
            />
            <input
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-400/40"
              placeholder="Search tags"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filteredTags.map((tag) => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors ${
                    active
                      ? "border-white/20 text-white"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: active
                      ? `${tag.color}2a`
                      : "rgba(255,255,255,0.03)",
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
            {filteredTags.length === 0 ? (
              <p className="text-sm text-gray-500">No tags found.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Matching Questions
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {selectedTagIds.length > 0
              ? `${problems.length} problems match the exact tag set.`
              : "Choose tags to filter the problem list."}
          </p>

          <div className="mt-4 grid gap-3">
            {problems.map((problem) => (
              <div
                key={problem.id}
                draggable
                onDragStart={onDragStart({ kind: "problem", problem })}
                className="rounded-[1.2rem] border border-white/5 bg-black/30 p-3 transition-colors hover:border-white/10 hover:bg-black/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-white">
                      {problem.title}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      {problem.topicName}
                    </p>
                  </div>
                  <button
                    onClick={() => onDragStart({ kind: "problem", problem })}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10"
                  >
                    <Link2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextTab({
  text,
  importDraft,
  setImportDraft,
  onImport,
  onLoadFile,
}: {
  text: string;
  importDraft: string;
  setImportDraft: (value: string) => void;
  onImport: () => void;
  onLoadFile: (file: File) => Promise<void>;
}) {
  return (
    <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Export
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                Plain text roadmap format
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
              auto-updated
            </span>
          </div>

          <textarea
            readOnly
            value={text}
            rows={14}
            className="mt-4 w-full rounded-[1.2rem] border border-white/10 bg-black/50 px-4 py-3 font-mono text-[12px] leading-6 text-gray-200 outline-none"
          />
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/2 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Import
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                Paste or load a roadmap text file.
              </h3>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-200 transition-colors hover:bg-white/10">
              <FileUp size={14} /> Upload
              <input
                type="file"
                accept=".txt,.roadmap,.map,text/plain"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) await onLoadFile(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <textarea
            value={importDraft}
            onChange={(event) => setImportDraft(event.target.value)}
            rows={11}
            className="mt-4 w-full rounded-[1.2rem] border border-white/10 bg-black/50 px-4 py-3 font-mono text-[12px] leading-6 text-gray-200 outline-none focus:border-sky-400/40"
            placeholder="Paste a roadmap file here to import it."
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Format uses a node list at the top and simple{" "}
              <span className="font-bold text-gray-300">-&gt;</span> edge links
              below.
            </p>
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-500/20"
            >
              <Layers3 size={14} /> Import text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomRoadmapBuilder() {
  return (
    <ReactFlowProvider>
      <BuilderWorkspace />
    </ReactFlowProvider>
  );
}
