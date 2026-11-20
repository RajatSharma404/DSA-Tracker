import { describe, it, expect } from "vitest";
import { loadCourses, parseCourse } from "../services/courseLoader";

describe("course files", () => {
  it("every course in data/courses parses, with code and a quiz per module", () => {
    const courses = loadCourses();
    expect(courses.length).toBeGreaterThan(0);
    for (const course of courses) {
      expect(course.slug).toMatch(/^[a-z0-9-]+$/);
      for (const m of course.modules) {
        expect(m.blocks.some((b) => b.type === "CODE")).toBe(true);
        expect(m.blocks.some((b) => b.type === "QUIZ")).toBe(true);
        for (const p of m.problems) expect(p).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("the Advanced DSA course has its 14 modules", () => {
    const adv = loadCourses().find((c) => c.slug === "advanced-dsa");
    expect(adv?.modules.map((m) => m.slug)).toEqual([
      "dsu", "fenwick-tree", "segment-tree", "sparse-table", "monotonic-stack", "string-matching",
      "rolling-hash", "shortest-paths", "topo-scc", "mst", "lca", "bitmask-dp", "tree-dp", "digit-dp",
    ]);
  });
});

describe("parseCourse", () => {
  const head = "---\nslug: t\ntitle: T\n---\n";

  it("reads blocks, quiz answers and problems", () => {
    const c = parseCourse(
      head +
        "# m | Module | Sum\nminutes: 12\nobjective: Learn it\n" +
        "::: code cpp | Demo\nint x;\n:::\n" +
        "::: quiz\nquestion: Q?\n- no\n- yes *\nexplanation: because\n:::\n" +
        "::: problems\ntwo-sum\n:::\n",
    );
    const m = c.modules[0];
    expect(m).toMatchObject({ slug: "m", title: "Module", summary: "Sum", minutes: 12, objectives: ["Learn it"], problems: ["two-sum"] });
    expect(m.blocks[0]).toEqual({ type: "CODE", language: "cpp", title: "Demo", code: "int x;" });
    expect(m.blocks[1]).toMatchObject({ type: "QUIZ", options: ["no", "yes"], correctAnswerIndex: 1 });
  });

  it("rejects a quiz without a marked answer and unclosed blocks", () => {
    expect(() => parseCourse(head + "# m | M\n::: quiz\nquestion: Q\n- a\n- b\n:::\n")).toThrow(/marked/);
    expect(() => parseCourse(head + "# m | M\n::: note\nnever closed\n")).toThrow(/unclosed/);
  });
});
