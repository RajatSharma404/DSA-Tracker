import * as acorn from "acorn";
import * as walk from "acorn-walk";
import ts from "typescript";
import { ComplexityEstimate } from "./types";

export * from "./types";

interface AstMetrics {
  maxLoopDepth: number;
  hasRecursion: boolean;
  recursiveBranches: number;
  hasHalving: boolean;
  hasSorting: boolean;
  hasMapOrSetInLoop: boolean;
  hasAllocationsInLoop: boolean;
  allocates2D: boolean;
  allocates1D: boolean;
  notes: string[];
}

/**
 * Analyzes JavaScript AST using Acorn and Acorn-walk
 */
function analyzeJsAst(code: string): AstMetrics {
  const metrics: AstMetrics = {
    maxLoopDepth: 0,
    hasRecursion: false,
    recursiveBranches: 0,
    hasHalving: false,
    hasSorting: false,
    hasMapOrSetInLoop: false,
    hasAllocationsInLoop: false,
    allocates2D: false,
    allocates1D: false,
    notes: [],
  };

  let ast: acorn.Node;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: false,
    });
  } catch {
    ast = acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      locations: false,
    });
  }

  let currentLoopDepth = 0;
  const functionStack: string[] = [];

  const isLoop = (nodeType: string) =>
    nodeType === "ForStatement" ||
    nodeType === "ForOfStatement" ||
    nodeType === "ForInStatement" ||
    nodeType === "WhileStatement" ||
    nodeType === "DoWhileStatement";

  walk.full(ast, (node: acorn.Node) => {
    // Check halving / doubling patterns in binary expressions
    if (node.type === "BinaryExpression" || node.type === "AssignmentExpression") {
      const op = (node as unknown as { operator: string }).operator;
      if (op === ">>" || op === ">>=" || op === "/=" || op === "<<=" || op === "*=") {
        metrics.hasHalving = true;
      }
    }
  });

  walk.ancestor(ast, {
    ForStatement(node, _state, ancestors) {
      checkLoop(ancestors);
    },
    ForOfStatement(node, _state, ancestors) {
      checkLoop(ancestors);
    },
    ForInStatement(node, _state, ancestors) {
      checkLoop(ancestors);
    },
    WhileStatement(node, _state, ancestors) {
      checkLoop(ancestors);
    },
    DoWhileStatement(node, _state, ancestors) {
      checkLoop(ancestors);
    },
    CallExpression(node, _state, ancestors) {
      const anyNode = node as unknown as {
        callee: { type: string; name?: string; property?: { name?: string } };
      };

      // Check sorting
      if (
        anyNode.callee.type === "MemberExpression" &&
        anyNode.callee.property?.name === "sort"
      ) {
        metrics.hasSorting = true;
      }

      // Check recursion
      if (anyNode.callee.type === "Identifier" && anyNode.callee.name) {
        const calleeName = anyNode.callee.name;
        // Check if any enclosing function in ancestors has this name
        for (const anc of ancestors) {
          const fn = anc as unknown as {
            type: string;
            id?: { name?: string };
          };
          if (
            (fn.type === "FunctionDeclaration" || fn.type === "FunctionExpression") &&
            fn.id?.name === calleeName
          ) {
            metrics.hasRecursion = true;
            metrics.recursiveBranches++;
            break;
          }
        }
      }

      // Check operations in loop
      const inLoop = ancestors.some((a) => isLoop(a.type));
      if (inLoop) {
        if (
          anyNode.callee.type === "MemberExpression" &&
          anyNode.callee.property?.name &&
          ["set", "get", "has", "add"].includes(anyNode.callee.property.name)
        ) {
          metrics.hasMapOrSetInLoop = true;
        }
        if (
          anyNode.callee.type === "MemberExpression" &&
          anyNode.callee.property?.name === "push"
        ) {
          metrics.hasAllocationsInLoop = true;
          metrics.allocates1D = true;
        }
      }
    },
    NewExpression(node, _state, ancestors) {
      const anyNode = node as unknown as {
        callee: { type: string; name?: string };
      };
      if (
        anyNode.callee.type === "Identifier" &&
        (anyNode.callee.name === "Map" || anyNode.callee.name === "Set")
      ) {
        const inLoop = ancestors.some((a) => isLoop(a.type));
        if (inLoop) {
          metrics.hasMapOrSetInLoop = true;
        }
        metrics.allocates1D = true;
      }
      if (
        anyNode.callee.type === "Identifier" &&
        (anyNode.callee.name === "Array" || anyNode.callee.name === "Int32Array")
      ) {
        metrics.allocates1D = true;
      }
    },
  });

  function checkLoop(ancestors: acorn.Node[]) {
    const depth = ancestors.filter((a) => isLoop(a.type)).length;
    if (depth > metrics.maxLoopDepth) {
      metrics.maxLoopDepth = depth;
    }
  }

  // Regex assist for halving patterns like Math.floor(n / 2) or mid = lo + (hi - lo) / 2
  if (/(?:Math\.floor|Math\.trunc)\s*\([^)]*\/\s*2\)/i.test(code) || /(?:>>\s*1|\/\s*2)/.test(code)) {
    metrics.hasHalving = true;
  }

  // 2D Array allocation detection
  if (/new\s+Array\([^)]*\)\s*\.\s*fill\([^)]*new\s+Array|Array\.from\(\s*\{[^}]*\}\s*,\s*\(\)\s*=>\s*\[\]/i.test(code)) {
    metrics.allocates2D = true;
  }

  return metrics;
}

/**
 * Analyzes TypeScript AST using the TypeScript Compiler API
 */
function analyzeTsAst(code: string): AstMetrics {
  const metrics: AstMetrics = {
    maxLoopDepth: 0,
    hasRecursion: false,
    recursiveBranches: 0,
    hasHalving: false,
    hasSorting: false,
    hasMapOrSetInLoop: false,
    hasAllocationsInLoop: false,
    allocates2D: false,
    allocates1D: false,
    notes: [],
  };

  const sourceFile = ts.createSourceFile(
    "solution.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let currentLoopDepth = 0;
  const functionNames: string[] = [];

  function isLoopNode(node: ts.Node): boolean {
    return (
      node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.ForOfStatement ||
      node.kind === ts.SyntaxKind.ForInStatement ||
      node.kind === ts.SyntaxKind.WhileStatement ||
      node.kind === ts.SyntaxKind.DoStatement
    );
  }

  function visit(node: ts.Node) {
    let loopPushed = false;
    let funcPushed = false;

    // Track function declaration names for recursion
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isFunctionExpression(node)
    ) {
      if (node.name && ts.isIdentifier(node.name)) {
        functionNames.push(node.name.text);
        funcPushed = true;
      }
    }

    if (isLoopNode(node)) {
      currentLoopDepth++;
      loopPushed = true;
      if (currentLoopDepth > metrics.maxLoopDepth) {
        metrics.maxLoopDepth = currentLoopDepth;
      }
    }

    // Binary expressions for halving/doubling
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (
        op === ts.SyntaxKind.GreaterThanGreaterThanToken ||
        op === ts.SyntaxKind.GreaterThanGreaterThanEqualsToken ||
        op === ts.SyntaxKind.SlashEqualsToken ||
        op === ts.SyntaxKind.AsteriskEqualsToken
      ) {
        metrics.hasHalving = true;
      }
    }

    // Call expressions (sort, recursion, push)
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr)) {
        const propName = expr.name.text;
        if (propName === "sort") {
          metrics.hasSorting = true;
        }
        if (["set", "get", "has", "add"].includes(propName) && currentLoopDepth > 0) {
          metrics.hasMapOrSetInLoop = true;
        }
        if (propName === "push" && currentLoopDepth > 0) {
          metrics.hasAllocationsInLoop = true;
          metrics.allocates1D = true;
        }
      } else if (ts.isIdentifier(expr)) {
        if (functionNames.includes(expr.text)) {
          metrics.hasRecursion = true;
          metrics.recursiveBranches++;
        }
      }
    }

    // New expressions (Map, Set, Array)
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      if (name === "Map" || name === "Set") {
        if (currentLoopDepth > 0) {
          metrics.hasMapOrSetInLoop = true;
        }
        metrics.allocates1D = true;
      }
      if (name === "Array" || name === "Int32Array") {
        metrics.allocates1D = true;
      }
    }

    ts.forEachChild(node, visit);

    if (loopPushed) {
      currentLoopDepth--;
    }
    if (funcPushed) {
      functionNames.pop();
    }
  }

  visit(sourceFile);

  if (/(?:Math\.floor|Math\.trunc)\s*\([^)]*\/\s*2\)/i.test(code) || /(?:>>\s*1|\/\s*2)/.test(code)) {
    metrics.hasHalving = true;
  }
  if (/new\s+Array\([^)]*\)\s*\.\s*fill\([^)]*new\s+Array|Array\.from\(\s*\{[^}]*\}\s*,\s*\(\)\s*=>\s*\[\]/i.test(code)) {
    metrics.allocates2D = true;
  }

  return metrics;
}

/**
 * Derives Big-O time and space complexity from AST metrics
 */
function deriveComplexityFromMetrics(metrics: AstMetrics): ComplexityEstimate {
  const notes: string[] = ["Estimated, not proven"];

  let time = "O(N)";
  let space = "O(1)";
  let confidence: "low" | "medium" = "medium";

  if (metrics.hasRecursion) {
    if (metrics.recursiveBranches >= 2) {
      time = "O(2^N)";
      space = "O(N)";
      notes.push(`Detected recursive branching (${metrics.recursiveBranches} recursive calls) without memoization`);
    } else if (metrics.hasHalving) {
      time = "O(log N)";
      space = "O(log N)";
      notes.push("Detected divide-and-conquer / binary recursive halving with logarithmic call stack");
    } else {
      time = "O(N)";
      space = "O(N)";
      notes.push("Detected linear recursion with O(N) call stack depth");
    }
  } else if (metrics.hasSorting) {
    if (metrics.maxLoopDepth > 0) {
      time = "O(N^2 log N)";
      notes.push("Detected Array.sort inside loop iteration");
    } else {
      time = "O(N log N)";
      notes.push("Dominated by sort comparison operations (O(N log N))");
    }
  } else if (metrics.maxLoopDepth === 0) {
    if (metrics.hasHalving) {
      time = "O(log N)";
      notes.push("Arithmetic halving operation with no iteration loops");
    } else {
      time = "O(1)";
      notes.push("Constant-time straight-line code with no detected loops or recursion");
    }
  } else if (metrics.maxLoopDepth === 1) {
    if (metrics.hasHalving) {
      time = "O(log N)";
      notes.push("Single loop with logarithmic step / interval halving (binary search pattern)");
    } else {
      time = "O(N)";
      notes.push("Single linear loop pass over input elements (depth 1)");
    }
  } else if (metrics.maxLoopDepth === 2) {
    time = "O(N^2)";
    notes.push("Detected nested iteration loops (depth 2)");
  } else if (metrics.maxLoopDepth >= 3) {
    time = `O(N^${metrics.maxLoopDepth})`;
    notes.push(`Detected deeply nested loops of depth ${metrics.maxLoopDepth}`);
  }

  if (metrics.allocates2D) {
    space = "O(M * N)";
    notes.push("Allocates 2D grid/matrix data structure");
  } else if (metrics.hasMapOrSetInLoop || metrics.allocates1D || metrics.hasAllocationsInLoop) {
    if (space === "O(1)") {
      space = "O(N)";
      notes.push("Allocates linear auxiliary storage (Map, Set, or dynamic Array)");
    }
  }

  return {
    time,
    space,
    confidence,
    method: "ast",
    notes,
  };
}

/**
 * Fallback regex heuristic for non-JS/TS languages or AST syntax errors
 */
export function analyzeComplexityHeuristic(code: string, topic: string = ""): ComplexityEstimate {
  const norm = code.toLowerCase();
  const notes: string[] = ["Estimated, not proven via static heuristic"];

  const nestedThreeLoops = /for\s*\([^)]*\)\s*\{?[\s\S]{0,400}for\s*\([^)]*\)\s*\{?[\s\S]{0,400}for\s*\(/i.test(code);
  const nestedTwoLoops = /for\s*\([^)]*\)\s*\{?[\s\S]{0,350}for\s*\(/i.test(code) ||
                         /while\s*\([^)]*\)\s*\{?[\s\S]{0,350}for\s*\(/i.test(code) ||
                         /for\s*\([^)]*\)\s*\{?[\s\S]{0,350}while\s*\(/i.test(code);
  const hasBinarySearch = /(?:while|for)\s*\([^)]*(?:<|<=)[^)]*\)[\s\S]{0,250}(?:mid\s*=\s*|>>\s*1|\/\s*2)/i.test(code) ||
                          /(?:binary_search|lower_bound|upper_bound)/i.test(code);
  const hasSorting = /(?:std::sort|sort\s*\(|qsort)/i.test(code);
  const hasTreeRecursion = /(?:return\s+[a-zA-Z0-9_]+\s*\([^)]*left[^)]*\)\s*[\+\*]\s*[a-zA-Z0-9_]+\s*\([^)]*right)/i.test(code);
  const hasTwoBranchRecursion = (code.match(/return\s+[a-zA-Z0-9_]+\s*\(/g) || []).length >= 2;
  const hasHashMap = /(?:unordered_map|unordered_set|hash_map|dict\(|defaultdict)/i.test(code);
  const hasPriorityQueue = /(?:priority_queue|make_heap|push_heap|heapq)/i.test(code);
  const has2DVector = /(?:vector\s*<\s*vector|int\s+dp\s*\[[^\]]+\]\s*\[[^\]]+\])/i.test(code);
  const has1DVector = /(?:vector\s*<|int\s+dp\s*\[|new\s+int\s*\[|malloc\s*\()/i.test(code) || hasHashMap;

  let time = "O(N)";
  if (nestedThreeLoops) {
    time = "O(N^3)";
    notes.push("Heuristic: triple nested loop pattern");
  } else if (nestedTwoLoops) {
    time = has2DVector || topic.toLowerCase().includes("matrix") ? "O(M * N)" : "O(N^2)";
    notes.push(`Heuristic: nested loop pattern (${time})`);
  } else if (hasTreeRecursion || (hasTwoBranchRecursion && !hasHashMap)) {
    time = "O(2^N)";
    notes.push("Heuristic: recursive tree branching");
  } else if (hasSorting) {
    time = "O(N log N)";
    notes.push("Heuristic: sort invocation");
  } else if (hasPriorityQueue) {
    time = "O(N log K)";
    notes.push("Heuristic: heap/priority queue operations");
  } else if (hasBinarySearch) {
    time = "O(log N)";
    notes.push("Heuristic: binary search partition");
  }

  let space = "O(1)";
  if (has2DVector) {
    space = "O(M * N)";
  } else if (has1DVector) {
    space = "O(N)";
  } else if (hasPriorityQueue) {
    space = "O(K)";
  }

  return {
    time,
    space,
    confidence: "low",
    method: "heuristic",
    notes,
  };
}

/**
 * Main AST-based complexity analyzer with automatic language routing
 * JS -> Acorn AST
 * TS -> TypeScript Compiler AST
 * C++, Python, Java, etc. or parse error -> Fallback heuristic
 */
export function analyzeComplexity(
  code: string,
  language?: string,
  topic: string = ""
): ComplexityEstimate {
  const lang = (language || "").toLowerCase().trim();
  const isTs = lang === "typescript" || lang === "ts";
  const isJs = lang === "javascript" || lang === "js";

  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      time: "O(1)",
      space: "O(1)",
      confidence: "low",
      method: "heuristic",
      notes: ["Estimated, not proven", "Empty code snippet"],
    };
  }

  if (isJs) {
    try {
      const metrics = analyzeJsAst(code);
      return deriveComplexityFromMetrics(metrics);
    } catch {
      // Fallback to TS compiler AST or heuristic if Acorn fails on newer syntax
      try {
        const metrics = analyzeTsAst(code);
        return deriveComplexityFromMetrics(metrics);
      } catch {
        return analyzeComplexityHeuristic(code, topic);
      }
    }
  }

  if (isTs) {
    try {
      const metrics = analyzeTsAst(code);
      return deriveComplexityFromMetrics(metrics);
    } catch {
      return analyzeComplexityHeuristic(code, topic);
    }
  }

  // Other languages (C++, Python, Java, Go, etc.)
  return analyzeComplexityHeuristic(code, topic);
}

