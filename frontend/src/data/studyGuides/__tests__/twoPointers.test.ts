import { describe, it, expect } from "vitest";
import { twoPointersGuide } from "../twoPointers";

describe("Study Guide: Two Pointers", () => {
  it("should validate Two Pointers guide structure and metadata", () => {
    expect(twoPointersGuide.topicName).toBeDefined();
    expect(twoPointersGuide.tagline).toBeDefined();
    expect(twoPointersGuide.emoji).toBeDefined();
    expect(Array.isArray(twoPointersGuide.sections)).toBe(true);
    expect(Array.isArray(twoPointersGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(twoPointersGuide.complexityTable)).toBe(true);
    expect(Array.isArray(twoPointersGuide.keyTakeaways)).toBe(true);
  });
});
