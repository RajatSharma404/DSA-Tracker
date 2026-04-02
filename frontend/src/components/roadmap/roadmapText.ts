import type { Edge, Node } from "reactflow";

export type RoadmapNodeKind =
  | "starting"
  | "folder"
  | "problem"
  | "notes"
  | "tag";

export type RoadmapMatchMode = "ALL" | "ANY";

export interface RoadmapNodeData {
  kind: RoadmapNodeKind;
  label: string;
  accent: string;
  description?: string;
  text?: string;
  problemId?: string;
  problemTitle?: string;
  problemDifficulty?: "EASY" | "MEDIUM" | "HARD";
  link?: string;
  topicName?: string;
  tagIds?: string[];
  tagNames?: string[];
  tagColors?: string[];
  matchMode?: RoadmapMatchMode;
  problemIds?: string[];
}

export interface RoadmapDocument {
  title: string;
  nodes: Array<Node<RoadmapNodeData>>;
  edges: Edge[];
}

const DEFAULT_ACCENTS: Record<RoadmapNodeKind, string> = {
  starting: "#38bdf8",
  folder: "#a855f7",
  problem: "#22c55e",
  notes: "#f59e0b",
  tag: "#ec4899",
};

const encode = (value: string) => encodeURIComponent(value ?? "");

const decode = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
};

const escapeLine = (value: string) => encode(value).replace(/\n/g, "");

const unescapeLine = (value: string) => decode(value.trim());

export const getDefaultAccent = (kind: RoadmapNodeKind) =>
  DEFAULT_ACCENTS[kind];

export const createDefaultNodeData = (
  kind: RoadmapNodeKind,
  overrides: Partial<RoadmapNodeData> = {},
): RoadmapNodeData => {
  const base: RoadmapNodeData = {
    kind,
    label:
      kind === "starting"
        ? "Start Here"
        : kind === "folder"
          ? "New Folder"
          : kind === "problem"
            ? "Problem Node"
            : kind === "notes"
              ? "Notes"
              : "Tag Node",
    accent: DEFAULT_ACCENTS[kind],
    description:
      kind === "starting"
        ? "Kick off the roadmap from this node."
        : kind === "folder"
          ? "Use folders to group a section of the map."
          : kind === "problem"
            ? "Attach a LeetCode question here."
            : kind === "notes"
              ? "Add context, reminders, or review notes."
              : "Match one or more tags to find problems.",
    text: kind === "notes" ? "" : undefined,
    tagIds: kind === "tag" ? [] : undefined,
    tagNames: kind === "tag" ? [] : undefined,
    tagColors: kind === "tag" ? [] : undefined,
    matchMode: kind === "tag" ? "ALL" : undefined,
    problemIds: kind === "tag" ? [] : undefined,
  };

  return { ...base, ...overrides };
};

export const serializeRoadmapText = (document: RoadmapDocument) => {
  const lines: string[] = [
    "# DSA Custom Roadmap v1",
    `title: ${escapeLine(document.title || "Custom Roadmap")}`,
    `updated: ${new Date().toISOString()}`,
    "",
    "[nodes]",
  ];

  document.nodes.forEach((node) => {
    const data = node.data;
    const fields: string[] = [
      `${node.id}`,
      `${data.kind}`,
      `${escapeLine(data.label)}`,
      `x=${Math.round(node.position.x)}`,
      `y=${Math.round(node.position.y)}`,
      `accent=${encode(data.accent || DEFAULT_ACCENTS[data.kind])}`,
    ];

    if (data.description)
      fields.push(`description=${encode(data.description)}`);
    if (data.text) fields.push(`text=${encode(data.text)}`);
    if (data.problemId) fields.push(`problemId=${encode(data.problemId)}`);
    if (data.problemTitle)
      fields.push(`problemTitle=${encode(data.problemTitle)}`);
    if (data.problemDifficulty)
      fields.push(`problemDifficulty=${encode(data.problemDifficulty)}`);
    if (data.link) fields.push(`link=${encode(data.link)}`);
    if (data.topicName) fields.push(`topicName=${encode(data.topicName)}`);
    if (data.tagIds?.length)
      fields.push(`tagIds=${encode(data.tagIds.join(","))}`);
    if (data.tagNames?.length)
      fields.push(`tagNames=${encode(data.tagNames.join(","))}`);
    if (data.tagColors?.length)
      fields.push(`tagColors=${encode(data.tagColors.join(","))}`);
    if (data.matchMode) fields.push(`matchMode=${encode(data.matchMode)}`);
    if (data.problemIds?.length)
      fields.push(`problemIds=${encode(data.problemIds.join(","))}`);

    lines.push(fields.join(" | "));
  });

  lines.push("", "[edges]");

  const edgesBySource = new Map<string, string[]>();
  document.edges.forEach((edge) => {
    const nextTargets = edgesBySource.get(edge.source) || [];
    nextTargets.push(edge.target);
    edgesBySource.set(edge.source, nextTargets);
  });

  edgesBySource.forEach((targets, source) => {
    if (targets.length === 1) {
      lines.push(`${source} -> ${targets[0]}`);
    } else if (targets.length > 1) {
      lines.push(`${source} -> [${targets.join(", ")}]`);
    }
  });

  return lines.join("\n");
};

export const parseRoadmapText = (text: string): RoadmapDocument => {
  const rawLines = text.split(/\r?\n/);
  const nodes: Array<Node<RoadmapNodeData>> = [];
  const edges: Edge[] = [];
  let title = "Custom Roadmap";
  let section: "header" | "nodes" | "edges" = "header";

  const parseKeyValue = (entry: string) => {
    const eqIndex = entry.indexOf("=");
    if (eqIndex === -1) return null;
    const key = entry.slice(0, eqIndex).trim();
    const value = entry.slice(eqIndex + 1).trim();
    return { key, value };
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (/^\[nodes\]$/i.test(line)) {
      section = "nodes";
      continue;
    }

    if (/^\[edges\]$/i.test(line)) {
      section = "edges";
      continue;
    }

    if (section === "header") {
      const titleMatch = line.match(/^title:\s*(.+)$/i);
      if (titleMatch) {
        title = unescapeLine(titleMatch[1]);
      }
      continue;
    }

    if (section === "nodes") {
      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 3) continue;

      const [id, kindRaw, labelRaw, ...fields] = parts;
      const kind = kindRaw as RoadmapNodeKind;
      const data = createDefaultNodeData(kind, {
        label: unescapeLine(labelRaw),
      });

      let x = 120;
      let y = 120;

      fields.forEach((field) => {
        const parsed = parseKeyValue(field);
        if (!parsed) return;

        const { key, value } = parsed;
        if (key === "x") x = Number(value) || 0;
        else if (key === "y") y = Number(value) || 0;
        else if (key === "accent") data.accent = unescapeLine(value);
        else if (key === "description") data.description = unescapeLine(value);
        else if (key === "text") data.text = unescapeLine(value);
        else if (key === "problemId") data.problemId = unescapeLine(value);
        else if (key === "problemTitle")
          data.problemTitle = unescapeLine(value);
        else if (key === "problemDifficulty")
          data.problemDifficulty = unescapeLine(
            value,
          ) as RoadmapNodeData["problemDifficulty"];
        else if (key === "link") data.link = unescapeLine(value);
        else if (key === "topicName") data.topicName = unescapeLine(value);
        else if (key === "tagIds")
          data.tagIds = unescapeLine(value).split(",").filter(Boolean);
        else if (key === "tagNames")
          data.tagNames = unescapeLine(value).split(",").filter(Boolean);
        else if (key === "tagColors")
          data.tagColors = unescapeLine(value).split(",").filter(Boolean);
        else if (key === "matchMode")
          data.matchMode = unescapeLine(value) as RoadmapMatchMode;
        else if (key === "problemIds")
          data.problemIds = unescapeLine(value).split(",").filter(Boolean);
      });

      nodes.push({
        id,
        type: "roadmapBuilder",
        position: { x, y },
        data,
      });
      continue;
    }

    if (section === "edges") {
      const match = line.match(/^(.*?)\s*->\s*(.+)$/);
      if (!match) continue;
      const source = match[1].trim();
      const targetBlock = match[2].trim();

      const targets =
        targetBlock.startsWith("[") && targetBlock.endsWith("]")
          ? targetBlock
              .slice(1, -1)
              .split(",")
              .map((target) => target.trim())
              .filter(Boolean)
          : [targetBlock];

      targets.forEach((target) => {
        edges.push({
          id: `edge-${source}-${target}`,
          source,
          target,
        });
      });
    }
  }

  return { title, nodes, edges };
};
