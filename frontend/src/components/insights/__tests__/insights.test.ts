import { describe, it, expect } from "vitest";
import { buildCalendarGrid } from "../LeetCodeLivePanel";
import { buildStrands } from "../DsaDna";
import { NAV_SECTIONS, isNavItemActive } from "@/lib/navigation";
import { THEME_OPTIONS, LIGHT_THEMES, THEME_BOOT_SCRIPT, resolveThemeId } from "@/lib/themes";

describe("buildCalendarGrid", () => {
  it("lays out 53 full weeks and sums LeetCode's unix-second buckets", () => {
    const today = new Date("2026-11-13T10:00:00Z");
    const ts = (iso: string) => String(Date.parse(iso) / 1000);
    const grid = buildCalendarGrid(
      { [ts("2026-11-13T00:00:00Z")]: 3, [ts("2026-11-12T00:00:00Z")]: 1, [ts("2020-01-01T00:00:00Z")]: 9 },
      today,
    );
    expect(grid.cells).toHaveLength(53 * 7);
    expect(grid.total).toBe(4); // out-of-range day ignored
    expect(grid.max).toBe(3);
    expect(grid.cells.find((c) => c.date === "2026-11-13")?.count).toBe(3);
    // grid columns start on Sunday
    expect(new Date(`${grid.cells[0].date}T00:00:00Z`).getUTCDay()).toBe(0);
  });
});

describe("buildStrands", () => {
  const topics = [
    { name: "Arrays", progressPercentage: 100 },
    { name: "Graphs", progressPercentage: 0 },
    { name: "DP", progressPercentage: 50 },
  ];

  it("is deterministic for the same seed and varies with the seed", () => {
    expect(buildStrands(topics, 42)).toEqual(buildStrands(topics, 42));
    expect(buildStrands(topics, 42)[0].path).not.toEqual(buildStrands(topics, 99999)[0].path);
  });

  it("gives higher-progress topics longer strands", () => {
    const [full, empty] = buildStrands(topics, 7);
    const dist = (p: [number, number]) => Math.hypot(p[0] - 210, p[1] - 210);
    expect(dist(full.tip)).toBeGreaterThan(dist(empty.tip));
  });
});

describe("navigation + themes registry", () => {
  it("has unique hrefs and includes the Insights Lab", () => {
    const hrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain("/insights");
  });

  it("matches nested routes but not prefixes of other routes", () => {
    expect(isNavItemActive("/review", "/review")).toBe(true);
    expect(isNavItemActive("/learn/arrays/x", "/learn")).toBe(true);
    expect(isNavItemActive("/topics", "/")).toBe(false);
  });

  it("ships established palettes and maps legacy theme ids", () => {
    expect(THEME_OPTIONS.map((t) => t.id)).toEqual(
      expect.arrayContaining(["graphite", "mocha", "rosepine", "nord", "latte", "dawn"]),
    );
    expect(LIGHT_THEMES).toEqual(["light", "latte", "dawn"]);
    expect(resolveThemeId("oled")).toBe("graphite");
    expect(resolveThemeId("paper")).toBe("dawn");
    expect(resolveThemeId("nonsense")).toBe("graphite");
    expect(THEME_BOOT_SCRIPT).toContain('"oled":"graphite"');
  });
});
