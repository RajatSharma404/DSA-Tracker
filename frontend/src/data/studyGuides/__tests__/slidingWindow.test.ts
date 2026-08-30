import { describe, it, expect } from "vitest";
import { slidingWindowGuide } from "../slidingWindow";

describe("Study Guide: Sliding Window", () => {
  it("should validate Sliding Window guide structure and metadata", () => {
    expect(slidingWindowGuide.topicName).toBeDefined();
    expect(slidingWindowGuide.tagline).toBeDefined();
    expect(slidingWindowGuide.emoji).toBeDefined();
    expect(Array.isArray(slidingWindowGuide.sections)).toBe(true);
    expect(Array.isArray(slidingWindowGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(slidingWindowGuide.complexityTable)).toBe(true);
    expect(Array.isArray(slidingWindowGuide.keyTakeaways)).toBe(true);
  });
});
