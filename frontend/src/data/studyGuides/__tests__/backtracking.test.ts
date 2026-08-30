import { describe, it, expect } from "vitest";
import { backtrackingGuide } from "../backtracking";

describe("Study Guide: Backtracking", () => {
  it("should validate Backtracking guide structure and metadata", () => {
    expect(backtrackingGuide.topicName).toBeDefined();
    expect(backtrackingGuide.tagline).toBeDefined();
    expect(backtrackingGuide.emoji).toBeDefined();
    expect(Array.isArray(backtrackingGuide.sections)).toBe(true);
    expect(Array.isArray(backtrackingGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(backtrackingGuide.complexityTable)).toBe(true);
    expect(Array.isArray(backtrackingGuide.keyTakeaways)).toBe(true);
  });
});
