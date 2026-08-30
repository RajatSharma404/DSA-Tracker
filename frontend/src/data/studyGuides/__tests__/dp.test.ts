import { describe, it, expect } from "vitest";
import { dpGuide } from "../dp";

describe("Study Guide: Dynamic Programming", () => {
  it("should validate Dynamic Programming guide structure and metadata", () => {
    expect(dpGuide.topicName).toBeDefined();
    expect(dpGuide.tagline).toBeDefined();
    expect(dpGuide.emoji).toBeDefined();
    expect(Array.isArray(dpGuide.sections)).toBe(true);
    expect(Array.isArray(dpGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(dpGuide.complexityTable)).toBe(true);
    expect(Array.isArray(dpGuide.keyTakeaways)).toBe(true);
  });
});
