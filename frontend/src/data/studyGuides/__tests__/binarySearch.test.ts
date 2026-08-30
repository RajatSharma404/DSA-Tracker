import { describe, it, expect } from "vitest";
import { binarySearchGuide } from "../binarySearch";

describe("Study Guide: Binary Search", () => {
  it("should validate Binary Search guide structure and metadata", () => {
    expect(binarySearchGuide.topicName).toBeDefined();
    expect(binarySearchGuide.tagline).toBeDefined();
    expect(binarySearchGuide.emoji).toBeDefined();
    expect(Array.isArray(binarySearchGuide.sections)).toBe(true);
    expect(Array.isArray(binarySearchGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(binarySearchGuide.complexityTable)).toBe(true);
    expect(Array.isArray(binarySearchGuide.keyTakeaways)).toBe(true);
  });
});
