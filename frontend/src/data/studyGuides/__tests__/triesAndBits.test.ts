import { describe, it, expect } from "vitest";
import { triesGuide, bitManipulationGuide } from "../triesAndBits";

describe("Study Guide: Tries and Bit Manipulation", () => {
  it("should validate tries guide structure", () => {
    expect(triesGuide.topicName).toBeDefined();
    expect(triesGuide.sections.length).toBeGreaterThan(0);
    expect(triesGuide.patternTriggers.length).toBeGreaterThan(0);
  });

  it("should validate bit manipulation guide structure", () => {
    expect(bitManipulationGuide.topicName).toBeDefined();
    expect(bitManipulationGuide.sections.length).toBeGreaterThan(0);
    expect(bitManipulationGuide.patternTriggers.length).toBeGreaterThan(0);
  });
});
