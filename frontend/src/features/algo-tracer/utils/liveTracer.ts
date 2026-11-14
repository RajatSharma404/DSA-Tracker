/**
 * Live JavaScript tracer: actually runs the user's code.
 *
 * 1. instrument(): parses the code with acorn and inserts hooks before every
 *    statement (line + snapshot of the variables in scope), around function
 *    bodies (call stack) and on return values.
 * 2. runInstrumented(): executes it in a throwaway Web Worker with a step
 *    limit and a wall-clock timeout, so infinite loops can't hang the page.
 * 3. toTraceSteps(): turns raw events into the TraceStep shape the existing
 *    diagrams render: the main array with pointer/write highlights, stack /
 *    queue contents and graph state when those variables exist.
 */
import { parse } from "acorn";
import type { TraceStep, DiagramType } from "../types";

// --------------------------------------------------------------- AST utils

type Node = {
  type: string;
  start: number;
  end: number;
  loc?: { start: { line: number } };
  [key: string]: unknown;
};

const isNode = (v: unknown): v is Node =>
  Boolean(v) && typeof v === "object" && typeof (v as Node).type === "string";

const FUNCTION_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
const SINGLE_BODY_KEYS: Record<string, string[]> = {
  IfStatement: ["consequent", "alternate"],
  ForStatement: ["body"],
  ForInStatement: ["body"],
  ForOfStatement: ["body"],
  WhileStatement: ["body"],
  DoWhileStatement: ["body"],
  // LabeledStatement is deliberately absent: wrapping a labeled loop's body
  // in braces would break `continue label`.
};

/** Identifiers bound by a pattern (params, declarations, destructuring). */
const patternNames = (p: unknown): string[] => {
  if (!isNode(p)) return [];
  switch (p.type) {
    case "Identifier":
      return [p.name as string];
    case "AssignmentPattern":
      return patternNames(p.left);
    case "RestElement":
      return patternNames(p.argument);
    case "ArrayPattern":
      return (p.elements as unknown[]).flatMap(patternNames);
    case "ObjectPattern":
      return (p.properties as Node[]).flatMap((prop) =>
        prop.type === "RestElement" ? patternNames(prop.argument) : patternNames(prop.value),
      );
    default:
      return [];
  }
};

const declaredNames = (stmt: Node): string[] => {
  if (stmt.type === "VariableDeclaration") {
    return (stmt.declarations as Node[]).flatMap((d) => patternNames(d.id));
  }
  return [];
};

export interface EntryPoint {
  name: string;
  params: string[];
}

export interface InstrumentResult {
  code: string;
  entry: EntryPoint | null;
}

export const RESERVED_HOOKS = ["__t", "__v", "__enter", "__exit", "__ret"];

export function instrument(source: string): InstrumentResult {
  const ast = parse(source, {
    ecmaVersion: "latest",
    sourceType: "script",
    locations: true,
    allowReturnOutsideFunction: true,
  }) as unknown as Node;

  const inserts: Array<{ pos: number; text: string; seq: number }> = [];
  let seq = 0;
  const insert = (pos: number, text: string) => inserts.push({ pos, text, seq: seq++ });
  const lineOf = (n: Node) => n.loc?.start.line ?? 0;

  const snapshot = (names: string[]) => {
    const unique = [...new Set(names)].filter((n) => !RESERVED_HOOKS.includes(n));
    return `()=>({${unique.map((n) => `${JSON.stringify(n)}:__v(()=>${n})`).join(",")}})`;
  };

  const functionName = (fn: Node, parent?: Node): string => {
    if (isNode(fn.id)) return fn.id.name as string;
    if (parent?.type === "VariableDeclarator" && isNode(parent.id) && parent.id.type === "Identifier")
      return parent.id.name as string;
    if (parent?.type === "Property" && isNode(parent.key)) return String(parent.key.name ?? "fn");
    if (parent?.type === "MethodDefinition" && isNode(parent.key)) return String(parent.key.name ?? "method");
    return "anonymous";
  };

  /** Visits any node, descending into children; scope = variables visible here. */
  const visit = (node: unknown, scope: string[], parent?: Node): void => {
    if (Array.isArray(node)) {
      node.forEach((n) => visit(n, scope, parent));
      return;
    }
    if (!isNode(node)) return;

    if (FUNCTION_TYPES.has(node.type)) {
      const params = (node.params as unknown[]).flatMap(patternNames);
      const inner = [...scope, ...params];
      const body = node.body as Node;
      if (body.type === "BlockStatement") {
        const name = functionName(node, parent);
        insert(body.start + 1, `__enter(${JSON.stringify(name)},${lineOf(node)});try{`);
        visitStatements(body.body as Node[], inner);
        insert(body.end - 1, `}finally{__exit();}`);
      } else {
        visit(body, inner, node);
      }
      return;
    }

    if (node.type === "BlockStatement" || node.type === "StaticBlock") {
      visitStatements(node.body as Node[], scope);
      return;
    }

    if (node.type === "SwitchCase") {
      visit(node.test, scope, node);
      visitStatements(node.consequent as Node[], scope);
      return;
    }

    if (node.type === "ReturnStatement" && isNode(node.argument)) {
      insert(node.argument.start, `__ret(${lineOf(node)},`);
      visit(node.argument, scope, node);
      insert(node.argument.end, `)`);
      return;
    }

    // Loops with a declaration in their head expose it to the body.
    let bodyScope = scope;
    if (
      (node.type === "ForStatement" && isNode(node.init) && node.init.type === "VariableDeclaration") ||
      ((node.type === "ForInStatement" || node.type === "ForOfStatement") &&
        isNode(node.left) &&
        node.left.type === "VariableDeclaration")
    ) {
      const decl = (node.type === "ForStatement" ? node.init : node.left) as Node;
      bodyScope = [...scope, ...declaredNames(decl)];
    }

    const singleKeys = SINGLE_BODY_KEYS[node.type] ?? [];
    for (const [key, value] of Object.entries(node)) {
      if (key === "loc" || key === "start" || key === "end" || key === "type") continue;
      const childScope = singleKeys.includes(key) || key === "test" || key === "update" ? bodyScope : scope;
      if (singleKeys.includes(key) && isNode(value) && value.type !== "BlockStatement") {
        // `for (...) x++;` -> `for (...) { __t(...); x++; }`
        insert(value.start, `{__t(${lineOf(value)},${snapshot(childScope)});`);
        visit(value, childScope, node);
        insert(value.end, `}`);
      } else {
        visit(value, childScope, node);
      }
    }
  };

  const visitStatements = (list: Node[], scope: string[]) => {
    let visible = [...scope];
    for (const stmt of list) {
      if (stmt.type !== "FunctionDeclaration" && stmt.type !== "EmptyStatement") {
        insert(stmt.start, `__t(${lineOf(stmt)},${snapshot(visible)});`);
      }
      visit(stmt, visible);
      visible = [...visible, ...declaredNames(stmt)];
    }
  };

  // Top level: collect entry function, but don't trace top-level statements
  // (they only define functions in practice).
  let entry: EntryPoint | null = null;
  for (const stmt of ast.body as Node[]) {
    if (!entry && stmt.type === "FunctionDeclaration" && isNode(stmt.id)) {
      entry = { name: stmt.id.name as string, params: (stmt.params as unknown[]).flatMap(patternNames) };
    }
    if (!entry && stmt.type === "VariableDeclaration") {
      for (const d of stmt.declarations as Node[]) {
        if (isNode(d.init) && FUNCTION_TYPES.has(d.init.type) && isNode(d.id) && d.id.type === "Identifier") {
          entry = { name: d.id.name as string, params: (d.init.params as unknown[]).flatMap(patternNames) };
          break;
        }
      }
    }
    visit(stmt, [], ast);
  }

  inserts.sort((a, b) => a.pos - b.pos || a.seq - b.seq);
  let out = source;
  for (let i = inserts.length - 1; i >= 0; i--) {
    const { pos, text } = inserts[i];
    out = out.slice(0, pos) + text + out.slice(pos);
  }
  return { code: out, entry };
}

// --------------------------------------------------------------- execution

export type RawEvent =
  | { k: "line"; line: number; vars: Record<string, unknown>; stack: string[] }
  | { k: "call"; line: number; name: string; stack: string[] }
  | { k: "return"; line: number; value: unknown; stack: string[] };

export interface RunResult {
  events: RawEvent[];
  result?: unknown;
  logs: string[];
  error?: string;
}

const PRELUDE = (maxSteps: number) => `
const __steps = []; const __stack = []; const __logs = []; let __count = 0;
const console = { log: (...a) => __logs.push(a.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join(" ")) };
const __clone = (v, d = 0) => {
  if (v === null || typeof v !== "object") return typeof v === "function" ? undefined : typeof v === "bigint" ? String(v) : v;
  if (d > 3) return "…";
  if (Array.isArray(v)) return v.slice(0, 300).map((x) => __clone(x, d + 1));
  if (v instanceof Set) return { __set: [...v].slice(0, 300).map((x) => __clone(x, d + 1)) };
  if (v instanceof Map) return { __map: [...v].slice(0, 300).map(([k, x]) => [__clone(k, d + 1), __clone(x, d + 1)]) };
  const o = {}; let n = 0;
  for (const k in v) { if (n++ > 100) break; o[k] = __clone(v[k], d + 1); }
  return o;
};
const __v = (f) => { try { return __clone(f()); } catch (e) { return undefined; } };
function __t(line, snap) {
  if (++__count > ${maxSteps}) throw new Error("__STEP_LIMIT__");
  __steps.push({ k: "line", line, vars: snap(), stack: __stack.slice() });
}
function __enter(name, line) {
  __stack.push(name);
  if (__stack.length > 200) throw new Error("__DEPTH_LIMIT__");
  __steps.push({ k: "call", line, name, stack: __stack.slice() });
}
function __exit() { __stack.pop(); }
function __ret(line, v) { __steps.push({ k: "return", line, value: __clone(v), stack: __stack.slice() }); return v; }
`;

const friendlyError = (msg: string) =>
  msg.includes("__STEP_LIMIT__")
    ? "Stopped after too many steps. Is there an infinite loop, or is the input very large?"
    : msg.includes("__DEPTH_LIMIT__")
      ? "Recursion went more than 200 calls deep. Check your base case."
      : msg;

/** Builds the worker source. Exported for tests. */
export const buildProgram = (instrumented: string, entry: EntryPoint, maxSteps: number) => `
${PRELUDE(maxSteps)}
${instrumented}
;self.onmessage = (e) => {
  try {
    const __r = ${entry.name}(...e.data.args);
    self.postMessage({ events: __steps, result: __clone(__r), logs: __logs });
  } catch (err) {
    self.postMessage({ events: __steps, logs: __logs, error: String((err && err.message) || err) });
  }
};`;

export function runInstrumented(
  instrumented: string,
  entry: EntryPoint,
  args: unknown[],
  { maxSteps = 3000, timeoutMs = 2500 } = {},
): Promise<RunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([buildProgram(instrumented, entry, maxSteps)], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ...r, error: r.error ? friendlyError(r.error) : undefined });
    };
    const timer = setTimeout(
      () => done({ events: [], logs: [], error: `Stopped after ${timeoutMs / 1000}s. Is there an infinite loop?` }),
      timeoutMs,
    );
    worker.onmessage = (e) => done(e.data as RunResult);
    worker.onerror = (e) => done({ events: [], logs: [], error: e.message || "Your code threw an error while loading." });
    worker.postMessage({ args });
  });
}

// ---------------------------------------------------------- argument binding

export interface TraceInputs {
  array: number[];
  target: number;
  graph: Record<string, Array<string | number>>;
}

const ARRAY_HINT = /^(nums?|arr|array|a|list|values?|heights?|prices|data|input|xs|items|piles|weights|intervals)$/i;
const TARGET_HINT = /^(target|k|x|key|val|value|goal|sum|n|m|t)$/i;
const GRAPH_HINT = /^(graph|adj|adjList|adjacency|g|edges)$/i;
const START_HINT = /^(start|src|source|root|begin|s)$/i;

/** Chooses arguments for the entry function from its parameter names. */
export function bindArguments(params: string[], inputs: TraceInputs): unknown[] {
  let arrayUsed = false;
  return params.map((p, i) => {
    if (GRAPH_HINT.test(p)) return inputs.graph;
    if (START_HINT.test(p)) return Object.keys(inputs.graph)[0] ?? 0;
    if (ARRAY_HINT.test(p) || (i === 0 && !arrayUsed && !TARGET_HINT.test(p))) {
      arrayUsed = true;
      return [...inputs.array];
    }
    if (TARGET_HINT.test(p)) return inputs.target;
    return undefined; // defaulted params (lo = 0, hi = arr.length - 1) take their defaults
  });
}

// ------------------------------------------------------------ conversion

const POINTER_NAMES = /^(i|j|k|l|r|lo|hi|low|high|mid|left|right|start|end|p|q|p1|p2|slow|fast|idx|index|pos|cur|curr|pivot|minIdx|maxIdx)$/i;
const STACK_NAMES = /^(stack|stk|st)$/i;
const QUEUE_NAMES = /^(queue|q|dq|deque)$/i;
const VISITED_NAMES = /^(visited|seen|vis)$/i;
const NODE_NAMES = /^(node|curr|cur|u|v|vertex|current)$/i;

const isNumArray = (v: unknown): v is number[] => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "number");
const asList = (v: unknown): Array<string | number> | null => {
  if (Array.isArray(v)) return v as Array<string | number>;
  if (v && typeof v === "object" && Array.isArray((v as { __set?: unknown[] }).__set))
    return (v as { __set: Array<string | number> }).__set;
  return null;
};
const fmt = (v: unknown): string => {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (v && typeof v === "object" && "__set" in (v as object)) return `Set(${JSON.stringify((v as { __set: unknown[] }).__set)})`;
  const s = JSON.stringify(v);
  return s && s.length > 60 ? `${s.slice(0, 57)}…` : String(s);
};

export interface LiveTrace {
  steps: TraceStep[];
  diagram: DiagramType;
  result?: unknown;
  logs: string[];
}

/**
 * Converts raw events into TraceSteps. `arrayName` is the variable treated
 * as the main array (the entry function's array parameter, if any).
 */
export function toTraceSteps(events: RawEvent[], arrayName: string | null, graphName: string | null): LiveTrace {
  const steps: TraceStep[] = [];
  let prevVars: Record<string, unknown> = {};
  let prevArray: number[] = [];
  let sawStack = false;
  let sawQueue = false;
  let sawGraph = false;
  let lastGraph: Record<string, Array<string | number>> | null = null;

  for (const ev of events) {
    if (ev.k === "call") {
      steps.push({
        stepIndex: steps.length,
        line: ev.line,
        type: "call",
        arrayState: prevArray,
        highlighting: {},
        variables: prevVars,
        description: `Call ${ev.name}()${ev.stack.length > 1 ? ` (depth ${ev.stack.length})` : ""}`,
        callStack: ev.stack,
      });
      continue;
    }
    if (ev.k === "return") {
      steps.push({
        stepIndex: steps.length,
        line: ev.line,
        type: "return",
        arrayState: prevArray,
        highlighting: {},
        variables: prevVars,
        description: `${ev.stack[ev.stack.length - 1] ?? "function"} returns ${fmt(ev.value)}`,
        callStack: ev.stack,
      });
      continue;
    }

    const vars = ev.vars;
    const arr = (arrayName && isNumArray(vars[arrayName]) && vars[arrayName]) || prevArray;
    const writes = arr.length === prevArray.length ? arr.map((x, i) => (x !== prevArray[i] ? i : -1)).filter((i) => i >= 0) : [];
    const pointers = Object.entries(vars)
      .filter(([k, v]) => POINTER_NAMES.test(k) && typeof v === "number" && Number.isInteger(v) && v >= 0 && v < arr.length)
      .map(([, v]) => v as number);

    const lo = ["lo", "low", "left", "l", "start"].map((k) => vars[k]).find((v) => typeof v === "number") as number | undefined;
    const hi = ["hi", "high", "right", "r", "end"].map((k) => vars[k]).find((v) => typeof v === "number") as number | undefined;

    const changed = Object.keys(vars).filter((k) => k !== arrayName && JSON.stringify(vars[k]) !== JSON.stringify(prevVars[k]));
    const parts = [
      ...writes.slice(0, 3).map((i) => `${arrayName}[${i}] = ${arr[i]}`),
      ...changed.slice(0, 4).map((k) => `${k} = ${fmt(vars[k])}`),
    ];

    const stackVar = Object.keys(vars).find((k) => STACK_NAMES.test(k) && asList(vars[k]));
    const queueVar = Object.keys(vars).find((k) => QUEUE_NAMES.test(k) && asList(vars[k]));
    if (stackVar) sawStack = true;
    if (queueVar) sawQueue = true;
    const graph: Record<string, Array<string | number>> | null =
      graphName && vars[graphName] && typeof vars[graphName] === "object"
        ? (vars[graphName] as Record<string, Array<string | number>>)
        : lastGraph;
    if (graph) {
      lastGraph = graph;
      sawGraph = true;
    }
    const visitedVar = Object.keys(vars).find((k) => VISITED_NAMES.test(k));
    const nodeVar = Object.keys(vars).find((k) => NODE_NAMES.test(k) && (typeof vars[k] === "number" || typeof vars[k] === "string"));
    const visitedList = visitedVar ? asList(vars[visitedVar]) : null;

    steps.push({
      stepIndex: steps.length,
      line: ev.line,
      type: writes.length ? "swap" : pointers.length >= 2 ? "compare" : "iterate",
      arrayState: arr,
      highlighting: {
        comparing: [...new Set(pointers)],
        swapping: writes,
        activeRange: typeof lo === "number" && typeof hi === "number" && lo <= hi ? [lo, hi] : undefined,
        currentNode: nodeVar ? (vars[nodeVar] as string | number) : null,
        visitedNodes: visitedList ?? undefined,
      },
      variables: vars,
      description: parts.length ? `Line ${ev.line}: ${parts.join(", ")}` : `Line ${ev.line}`,
      callStack: ev.stack,
      dataStructureState: (stackVar ? asList(vars[stackVar]) : queueVar ? asList(vars[queueVar]) : undefined) ?? undefined,
      graphState: graph
        ? {
            nodes: Object.keys(graph).map((id) => ({ id, label: id })),
            edges: Object.entries(graph).flatMap(([from, tos]) =>
              (Array.isArray(tos) ? tos : []).map((to) => ({ from, to: String(to) })),
            ),
            visited: (visitedList ?? []).map(String),
            current: nodeVar ? String(vars[nodeVar]) : null,
            queueOrStack: ((queueVar ? asList(vars[queueVar]) : stackVar ? asList(vars[stackVar]) : []) ?? []).map(String),
          }
        : undefined,
    });
    prevVars = vars;
    prevArray = arr;
  }

  if (steps.length) {
    const last = steps[steps.length - 1];
    steps.push({ ...last, stepIndex: steps.length, type: "complete", highlighting: {}, description: "Finished" });
  }

  const diagram: DiagramType = sawGraph ? "graph" : prevArray.length ? "bar" : sawStack ? "stack" : sawQueue ? "queue" : "generic";
  return { steps, diagram, logs: [] };
}

/** Full pipeline used by the Tracer. */
export async function traceJavaScript(code: string, inputs: TraceInputs): Promise<LiveTrace & { error?: string }> {
  let instrumented: InstrumentResult;
  try {
    instrumented = instrument(code);
  } catch (err) {
    const e = err as { message?: string; loc?: { line: number } };
    return { steps: [], diagram: "generic", logs: [], error: `Syntax error${e.loc ? ` on line ${e.loc.line}` : ""}: ${e.message}` };
  }
  if (!instrumented.entry) {
    return { steps: [], diagram: "generic", logs: [], error: "Define a function to trace, e.g. function solve(nums) { … }" };
  }
  const args = bindArguments(instrumented.entry.params, inputs);
  const run = await runInstrumented(instrumented.code, instrumented.entry, args);
  const arrayParam = instrumented.entry.params.find((_, i) => Array.isArray(args[i])) ?? null;
  const graphParam = instrumented.entry.params.find((p) => GRAPH_HINT.test(p)) ?? null;
  const trace = toTraceSteps(run.events, arrayParam, graphParam);
  return { ...trace, result: run.result, logs: run.logs, error: run.error };
}
