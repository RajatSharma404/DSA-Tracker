import { describe, it, expect } from "vitest";
import { cppBasicsGuide } from "../cppBasics";

describe("Study Guide: C++ Basics", () => {
  it("should validate C++ Basics guide structure and metadata", () => {
    expect(cppBasicsGuide.topicName).toBeDefined();
    expect(cppBasicsGuide.tagline).toBeDefined();
    expect(cppBasicsGuide.emoji).toBeDefined();
    expect(Array.isArray(cppBasicsGuide.sections)).toBe(true);
    expect(Array.isArray(cppBasicsGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(cppBasicsGuide.complexityTable)).toBe(true);
    expect(Array.isArray(cppBasicsGuide.keyTakeaways)).toBe(true);
  });
});
