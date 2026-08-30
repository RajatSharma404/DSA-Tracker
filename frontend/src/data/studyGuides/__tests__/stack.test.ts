import { describe, it, expect } from "vitest";
import { stackGuide } from "../stack";

describe("Study Guide: Stack", () => {
  it("should validate Stack guide structure and metadata", () => {
    expect(stackGuide.topicName).toBeDefined();
    expect(stackGuide.tagline).toBeDefined();
    expect(stackGuide.emoji).toBeDefined();
    expect(Array.isArray(stackGuide.sections)).toBe(true);
    expect(Array.isArray(stackGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(stackGuide.complexityTable)).toBe(true);
    expect(Array.isArray(stackGuide.keyTakeaways)).toBe(true);
  });
});
