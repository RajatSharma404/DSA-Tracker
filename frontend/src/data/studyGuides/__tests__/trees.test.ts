import { describe, it, expect } from "vitest";
import { treesGuide } from "../trees";

describe("Study Guide: Trees", () => {
  it("should validate Trees guide structure and metadata", () => {
    expect(treesGuide.topicName).toBeDefined();
    expect(treesGuide.tagline).toBeDefined();
    expect(treesGuide.emoji).toBeDefined();
    expect(Array.isArray(treesGuide.sections)).toBe(true);
    expect(Array.isArray(treesGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(treesGuide.complexityTable)).toBe(true);
    expect(Array.isArray(treesGuide.keyTakeaways)).toBe(true);
  });
});
