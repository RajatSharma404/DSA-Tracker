import { describe, it, expect } from "vitest";
import { instrument, buildProgram, bindArguments, toTraceSteps, type RawEvent, type RunResult } from "../liveTracer";
import { STARTER_PRESETS } from "../../data/starterCodes";

/** Runs the worker program synchronously with a fake `self` (no real Worker in jsdom). */
const run = (code: string, args: unknown[], maxSteps = 3000): RunResult & { entry: string } => {
  const { code: instrumented, entry } = instrument(code);
  if (!entry) throw new Error("no entry");
  const self: { onmessage?: (e: { data: { args: unknown[] } }) => void; postMessage: (m: RunResult) => void } = {
    postMessage: () => {},
  };
  let out: RunResult = { events: [], logs: [] };
  self.postMessage = (m) => (out = m);
  new Function("self", buildProgram(instrumented, entry, maxSteps))(self);
  self.onmessage!({ data: { args } });
  return { ...out, entry: entry.name };
};

const inputs = { array: [5, 3, 8, 1, 9, 2, 4], target: 8, graph: { "0": [1, 2], "1": [0, 3], "2": [0], "3": [1] } };

describe("liveTracer", () => {
  it("runs user code for real: an insertion sort (not a built-in template) sorts the input", () => {
    const code = `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    let key = a[i], j = i - 1;
    while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
    a[j + 1] = key;
  }
  return a;
}`;
    const r = run(code, [[...inputs.array]]);
    expect(r.error).toBeUndefined();
    expect(r.result).toEqual([1, 2, 3, 4, 5, 8, 9]);
    const lines = new Set(r.events.filter((e) => e.k === "line").map((e) => e.line));
    expect([...lines].every((l) => l >= 2 && l <= 7)).toBe(true);
    const trace = toTraceSteps(r.events as RawEvent[], "a", null);
    expect(trace.diagram).toBe("bar");
    expect(trace.steps.some((s) => s.type === "swap" && s.highlighting.swapping!.length > 0)).toBe(true);
    expect(trace.steps.at(-1)!.arrayState).toEqual([1, 2, 3, 4, 5, 8, 9]);
  });

  it("stops infinite loops at the step limit", () => {
    const r = run("function f(a) { let i = 0; while (true) { i++; } }", [[1]], 200);
    expect(r.error).toContain("__STEP_LIMIT__");
    expect(r.events.length).toBeGreaterThan(100);
  });

  it("records calls and returns for recursion", () => {
    const r = run("function fib(n) { if (n < 2) return n; return fib(n - 1) + fib(n - 2); }", [5]);
    expect(r.result).toBe(5);
    expect(r.events.filter((e) => e.k === "call").length).toBe(15);
    expect(Math.max(...r.events.map((e) => e.stack.length))).toBe(5);
  });

  it("handles single-statement bodies, else-if chains, labels and arrow callbacks", () => {
    const code = `function f(a) {
  let s = 0;
  outer: for (const x of a) { for (let k = 0; k < 3; k++) { if (k === 1) continue outer; s += x; } }
  for (let i = 0; i < a.length; i++) if (a[i] > 4) s++; else if (a[i] < 2) s--; else s += 0;
  a.forEach((x) => { s += x; });
  return s;
}`;
    expect(run(code, [[5, 1, 3]]).result).toBe(9 + 1 - 1 + 9);
  });

  it("supports LeetCode-style `var f = function (nums, target)` entries", () => {
    const r = run("var twoSum = function(nums, target) { const m = new Map(); for (let i = 0; i < nums.length; i++) { if (m.has(target - nums[i])) return [m.get(target - nums[i]), i]; m.set(nums[i], i); } };", [[2, 7, 11, 15], 9]);
    expect(r.result).toEqual([0, 1]);
  });

  it("binds arguments from parameter names", () => {
    expect(bindArguments(["nums", "target"], inputs)).toEqual([inputs.array, 8]);
    expect(bindArguments(["arr", "low", "high"], inputs)).toEqual([inputs.array, undefined, undefined]);
    expect(bindArguments(["graph", "start"], inputs)).toEqual([inputs.graph, "0"]);
  });

  it("reports syntax errors with a line number", () => {
    expect(() => instrument("function f(a) {\n  let x = ;\n}")).toThrow();
  });

  it("traces every built-in JavaScript template without errors", () => {
    for (const preset of STARTER_PRESETS) {
      const code = preset.codes.javascript;
      const { entry } = instrument(code);
      expect(entry, preset.id).not.toBeNull();
      const args = bindArguments(entry!.params, {
        ...inputs,
        array: preset.defaultInput.array ?? inputs.array,
        target: preset.defaultInput.target ?? inputs.target,
      });
      const r = run(code, args);
      expect(r.error, `${preset.id}: ${r.error}`).toBeUndefined();
      expect(r.events.length, preset.id).toBeGreaterThan(0);
    }
  });
});
