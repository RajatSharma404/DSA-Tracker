/**
 * Chart Tokens System
 * Maps CSS token variables into standardized hex and rgba color definitions
 * for Recharts components (which require absolute color values in SVG props).
 */

export const CHART_TOKENS = {
  // Brand Accent (matches var(--accent) / var(--accent-primary))
  accent: "#00f0ff",
  accentMuted: "rgba(0, 240, 255, 0.4)",
  accentGlow: "rgba(0, 240, 255, 0.18)",

  // Difficulty Tier Tokens
  easy: "#10b981", // Emerald 500 (Easy green token)
  medium: "#f59e0b", // Amber 500 (Medium yellow token)
  hard: "#f43f5e", // Rose 500 (Hard red token)

  // Chart Structural Elements (Grids, Axes, Reference lines)
  grid: "rgba(255, 255, 255, 0.08)",
  axis: "#64748b",
  text: "#94a3b8",
  referenceLine: "#ec4899", // High-contrast benchmark guide
  cardBg: "#0d0d14",
  tooltipBg: "#12121a",
  tooltipBorder: "rgba(255, 255, 255, 0.12)",
} as const;
