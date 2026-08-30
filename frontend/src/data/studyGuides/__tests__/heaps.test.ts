import { describe, it, expect } from "vitest";
import { heapsGuide } from "../heaps";

describe("Study Guide: Heaps", () => {
  it("should validate Heaps guide structure and metadata", () => {
    expect(heapsGuide.topicName).toBeDefined();
    expect(heapsGuide.tagline).toBeDefined();
    expect(heapsGuide.emoji).toBeDefined();
    expect(Array.isArray(heapsGuide.sections)).toBe(true);
    expect(Array.isArray(heapsGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(heapsGuide.complexityTable)).toBe(true);
    expect(Array.isArray(heapsGuide.keyTakeaways)).toBe(true);
  });
});
