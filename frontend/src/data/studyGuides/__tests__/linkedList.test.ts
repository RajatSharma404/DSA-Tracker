import { describe, it, expect } from "vitest";
import { linkedListGuide } from "../linkedList";

describe("Study Guide: Linked List", () => {
  it("should validate Linked List guide structure and metadata", () => {
    expect(linkedListGuide.topicName).toBeDefined();
    expect(linkedListGuide.tagline).toBeDefined();
    expect(linkedListGuide.emoji).toBeDefined();
    expect(Array.isArray(linkedListGuide.sections)).toBe(true);
    expect(Array.isArray(linkedListGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(linkedListGuide.complexityTable)).toBe(true);
    expect(Array.isArray(linkedListGuide.keyTakeaways)).toBe(true);
  });
});
