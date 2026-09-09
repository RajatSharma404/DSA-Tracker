import { describe, it, expect } from "vitest";
import { CHART_TOKENS } from "../chartTokens";

describe("CHART_TOKENS", () => {
  it("should define all required brand accent colors", () => {
    expect(CHART_TOKENS.accent).toBe("#00f0ff");
    expect(CHART_TOKENS.accentMuted).toContain("rgba(");
    expect(CHART_TOKENS.accentGlow).toContain("rgba(");
  });

  it("should define difficulty tier tokens corresponding to Easy, Medium, and Hard", () => {
    expect(CHART_TOKENS.easy).toBe("#10b981");
    expect(CHART_TOKENS.medium).toBe("#f59e0b");
    expect(CHART_TOKENS.hard).toBe("#f43f5e");
  });

  it("should define structural grid and axis colors", () => {
    expect(CHART_TOKENS.grid).toContain("rgba(");
    expect(CHART_TOKENS.axis).toBe("#64748b");
    expect(CHART_TOKENS.text).toBe("#94a3b8");
    expect(CHART_TOKENS.referenceLine).toBe("#ec4899");
    expect(CHART_TOKENS.cardBg).toBe("#0d0d14");
    expect(CHART_TOKENS.tooltipBg).toBe("#12121a");
  });
});
