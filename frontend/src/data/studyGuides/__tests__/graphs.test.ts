import { describe, it, expect } from "vitest";
import { graphsGuide } from "../graphs";

describe("Study Guide: Graphs", () => {
  it("should validate Graphs guide structure and metadata", () => {
    expect(graphsGuide.topicName).toBeDefined();
    expect(graphsGuide.tagline).toBeDefined();
    expect(graphsGuide.emoji).toBeDefined();
    expect(Array.isArray(graphsGuide.sections)).toBe(true);
    expect(Array.isArray(graphsGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(graphsGuide.complexityTable)).toBe(true);
    expect(Array.isArray(graphsGuide.keyTakeaways)).toBe(true);
  });
});
