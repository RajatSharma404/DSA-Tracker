import { describe, it, expect } from "vitest";
import { arraysGuide } from "../arrays";

describe("Study Guide: Arrays", () => {
  it("should validate Arrays guide structure and metadata", () => {
    expect(arraysGuide.topicName).toBeDefined();
    expect(arraysGuide.tagline).toBeDefined();
    expect(arraysGuide.emoji).toBeDefined();
    expect(Array.isArray(arraysGuide.sections)).toBe(true);
    expect(Array.isArray(arraysGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(arraysGuide.complexityTable)).toBe(true);
    expect(Array.isArray(arraysGuide.keyTakeaways)).toBe(true);
  });
});
