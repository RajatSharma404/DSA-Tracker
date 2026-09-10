import type { FlowchartData, FlowchartNode, FlowchartEdge } from "@/components/FlowchartPanel";

/**
 * Intelligent client-side AST Control Flow Graph Generator.
 * Parses Python, C, C++, Java, and JavaScript/TypeScript code snippets into
 * interactive FlowchartNode and FlowchartEdge structures for FlowchartPanel.
 */

interface RawCodeLine {
  lineNum: number;
  raw: string;
  trimmed: string;
  indent: number;
}

export function generateAstFlowchart(
  code: string,
  lang: string = "python"
): FlowchartData {
  if (!code || !code.trim()) {
    return { nodes: [], edges: [] };
  }

  const normalizedLang = (lang || "").toLowerCase();
  const allLines = code.split(/\r?\n/);

  // Extract non-empty, non-comment lines with line numbers (1-indexed)
  const codeLines: RawCodeLine[] = [];
  for (let i = 0; i < allLines.length; i++) {
    const raw = allLines[i];
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Filter single-line comments
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*")
    ) {
      continue;
    }

    // Determine leading indentation
    const matchIndent = raw.match(/^\s*/);
    const indent = matchIndent ? matchIndent[0].length : 0;

    codeLines.push({
      lineNum: i + 1,
      raw,
      trimmed,
      indent,
    });
  }

  if (codeLines.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  let nodeCounter = 1;

  const createNode = (
    type: "start" | "end" | "decision" | "process" | "io",
    label: string,
    lineNum: number,
    startLine?: number,
    endLine?: number
  ): FlowchartNode => {
    const node: FlowchartNode = {
      id: `node-${nodeCounter++}`,
      type,
      label: truncateLabel(label),
      line: lineNum,
      startLine: startLine ?? lineNum,
      endLine: endLine ?? lineNum,
      lines: [lineNum],
    };
    nodes.push(node);
    return node;
  };

  const isPython = normalizedLang === "python" || normalizedLang === "py";
  const isCStyle =
    normalizedLang === "c" ||
    normalizedLang === "cpp" ||
    normalizedLang === "c++" ||
    normalizedLang === "java" ||
    normalizedLang === "javascript" ||
    normalizedLang === "typescript" ||
    normalizedLang === "js" ||
    normalizedLang === "ts";

  let hasStartNode = false;
  const loopStack: { node: FlowchartNode; indent: number }[] = [];
  let prevNode: FlowchartNode | null = null;
  let lastDecisionNode: FlowchartNode | null = null;

  for (let i = 0; i < codeLines.length; i++) {
    const { lineNum, trimmed, indent } = codeLines[i];

    // Check if we exited a loop based on indent
    if (loopStack.length > 0 && isPython) {
      const topLoop = loopStack[loopStack.length - 1];
      if (indent <= topLoop.indent) {
        // Exited loop, connect last statement back to loop decision node
        if (prevNode && prevNode.id !== topLoop.node.id && prevNode.type !== "end") {
          edges.push({
            from: prevNode.id,
            to: topLoop.node.id,
            label: "Next Iteration",
          });
        }
        loopStack.pop();
      }
    }

    // 1. Function Header / Entry Point
    if (
      trimmed.startsWith("def ") ||
      (!hasStartNode &&
        isCStyle &&
        /\b(?:int|void|bool|double|float|auto|char|long|vector|string)\s+[a-zA-Z0-9_]+\s*\(/.test(
          trimmed
        )) ||
      (!hasStartNode && /^(?:function\s+[a-zA-Z0-9_]+|const\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?\()/.test(trimmed))
    ) {
      const funcLabel = trimmed.replace(/:$/, "").replace(/\{$/, "").trim();
      const node = createNode("start", funcLabel, lineNum);
      hasStartNode = true;

      if (prevNode) {
        edges.push({ from: prevNode.id, to: node.id });
      }
      prevNode = node;
      continue;
    }

    // 2. Return Statement / Exit Point
    if (trimmed.startsWith("return") || trimmed === "break;" || trimmed === "break") {
      const returnLabel = trimmed.replace(/;$/, "").trim();
      const node = createNode("end", returnLabel, lineNum);

      if (prevNode) {
        const edgeLabel = lastDecisionNode && prevNode.id === lastDecisionNode.id ? "True" : undefined;
        edges.push({ from: prevNode.id, to: node.id, label: edgeLabel });
        if (lastDecisionNode && prevNode.id === lastDecisionNode.id) {
          lastDecisionNode = null;
        }
      }
      prevNode = node;
      continue;
    }

    // 3. While Loop
    if (trimmed.startsWith("while ") || trimmed.startsWith("while(")) {
      const cond = extractCondition(trimmed, "while");
      const node = createNode("decision", `while (${cond})`, lineNum);

      if (prevNode) {
        edges.push({ from: prevNode.id, to: node.id });
      }
      loopStack.push({ node, indent });
      lastDecisionNode = node;
      prevNode = node;
      continue;
    }

    // 4. For Loop
    if (trimmed.startsWith("for ") || trimmed.startsWith("for(")) {
      const cond = extractCondition(trimmed, "for");
      const node = createNode("decision", `for (${cond})`, lineNum);

      if (prevNode) {
        edges.push({ from: prevNode.id, to: node.id });
      }
      loopStack.push({ node, indent });
      lastDecisionNode = node;
      prevNode = node;
      continue;
    }

    // 5. If Statement
    if (trimmed.startsWith("if ") || trimmed.startsWith("if(")) {
      const cond = extractCondition(trimmed, "if");
      const node = createNode("decision", `${cond} ?`, lineNum);

      if (prevNode) {
        edges.push({ from: prevNode.id, to: node.id });
      }
      lastDecisionNode = node;
      prevNode = node;
      continue;
    }

    // 6. Elif / Else If Statement
    if (
      trimmed.startsWith("elif ") ||
      trimmed.startsWith("elif(") ||
      trimmed.startsWith("else if") ||
      trimmed.startsWith("else if(")
    ) {
      const cond = extractCondition(trimmed, trimmed.startsWith("elif") ? "elif" : "else if");
      const node = createNode("decision", `${cond} ?`, lineNum);

      if (lastDecisionNode) {
        edges.push({ from: lastDecisionNode.id, to: node.id, label: "False" });
      } else if (prevNode) {
        edges.push({ from: prevNode.id, to: node.id, label: "False" });
      }
      lastDecisionNode = node;
      prevNode = node;
      continue;
    }

    // 7. Else Statement
    if (trimmed === "else:" || trimmed.startsWith("else") && (trimmed.endsWith(":") || trimmed.endsWith("{"))) {
      // Else acts as false branch connector, skip as standalone node unless needed
      continue;
    }

    // 8. I/O Statement
    if (
      trimmed.startsWith("print(") ||
      trimmed.startsWith("printf(") ||
      trimmed.includes("cout <<") ||
      trimmed.includes("cin >>") ||
      trimmed.startsWith("console.log(")
    ) {
      const ioLabel = trimmed.replace(/;$/, "").trim();
      const node = createNode("io", ioLabel, lineNum);

      if (prevNode) {
        const edgeLabel = lastDecisionNode && prevNode.id === lastDecisionNode.id ? "True" : undefined;
        edges.push({ from: prevNode.id, to: node.id, label: edgeLabel });
        if (lastDecisionNode && prevNode.id === lastDecisionNode.id) {
          lastDecisionNode = null;
        }
      }
      prevNode = node;
      continue;
    }

    // 9. Standard Statement / Variable Assignment / Computation
    // Ignore standalone closing braces
    if (trimmed === "}" || trimmed === "};" || trimmed === "{") {
      continue;
    }

    const stmtLabel = trimmed.replace(/;$/, "").trim();
    const node = createNode("process", stmtLabel, lineNum);

    if (prevNode) {
      const edgeLabel = lastDecisionNode && prevNode.id === lastDecisionNode.id ? "True" : undefined;
      edges.push({ from: prevNode.id, to: node.id, label: edgeLabel });
      if (lastDecisionNode && prevNode.id === lastDecisionNode.id) {
        lastDecisionNode = null;
      }
    }
    prevNode = node;
  }

  // If no start node was created, add an entry Start node
  if (!hasStartNode && nodes.length > 0) {
    const firstLine = codeLines[0].lineNum;
    const startNode: FlowchartNode = {
      id: "node-0",
      type: "start",
      label: "Start Algorithm",
      line: firstLine,
      startLine: firstLine,
      endLine: firstLine,
      lines: [firstLine],
    };
    nodes.unshift(startNode);
    if (nodes.length > 1) {
      edges.unshift({ from: startNode.id, to: nodes[1].id });
    }
  }

  // Ensure terminal End node exists if the last node isn't already an end
  if (nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1];
    if (lastNode.type !== "end") {
      const lastLine = codeLines[codeLines.length - 1].lineNum;
      const endNode: FlowchartNode = {
        id: `node-${nodeCounter++}`,
        type: "end",
        label: "End Algorithm",
        line: lastLine,
        startLine: lastLine,
        endLine: lastLine,
        lines: [lastLine],
      };
      nodes.push(endNode);
      edges.push({ from: lastNode.id, to: endNode.id });
    }
  }

  // Clean and deduplicate edges
  const seenEdges = new Set<string>();
  const validEdges: FlowchartEdge[] = [];
  for (const edge of edges) {
    if (edge.from !== undefined && edge.to !== undefined && edge.from !== edge.to) {
      const key = `${edge.from}->${edge.to}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        validEdges.push(edge);
      }
    }
  }

  // Fallback: If no edges or single node, connect sequentially
  if (validEdges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      validEdges.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
      });
    }
  }

  return {
    nodes,
    edges: validEdges,
  };
}

function extractCondition(line: string, keyword: string): string {
  let text = line.trim();
  if (text.startsWith(keyword)) {
    text = text.slice(keyword.length).trim();
  }
  // Strip trailing colons or opening braces
  text = text.replace(/:$/, "").replace(/\{$/, "").trim();
  // Strip leading and trailing parentheses if wrapped
  if (text.startsWith("(") && text.endsWith(")")) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

function truncateLabel(str: string, maxLength: number = 32): string {
  if (!str) return "";
  const cleaned = str.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 3) + "...";
}
