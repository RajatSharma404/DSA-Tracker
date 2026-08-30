import { describe, it, expect } from "vitest";
import { hashingGuide } from "../hashing";

describe("Study Guide: Hashing", () => {
  it("should validate Hashing guide structure and metadata", () => {
    expect(hashingGuide.topicName).toBeDefined();
    expect(hashingGuide.tagline).toBeDefined();
    expect(hashingGuide.emoji).toBeDefined();
    expect(Array.isArray(hashingGuide.sections)).toBe(true);
    expect(Array.isArray(hashingGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(hashingGuide.complexityTable)).toBe(true);
    expect(Array.isArray(hashingGuide.keyTakeaways)).toBe(true);
  });
});
