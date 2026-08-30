import { describe, it, expect } from "vitest";
import { jsBasicsGuide } from "../jsBasics";

describe("Study Guide: JavaScript Basics", () => {
  it("should validate JavaScript Basics guide structure and metadata", () => {
    expect(jsBasicsGuide.topicName).toBeDefined();
    expect(jsBasicsGuide.tagline).toBeDefined();
    expect(jsBasicsGuide.emoji).toBeDefined();
    expect(Array.isArray(jsBasicsGuide.sections)).toBe(true);
    expect(Array.isArray(jsBasicsGuide.patternTriggers)).toBe(true);
    expect(Array.isArray(jsBasicsGuide.complexityTable)).toBe(true);
    expect(Array.isArray(jsBasicsGuide.keyTakeaways)).toBe(true);
  });
});
