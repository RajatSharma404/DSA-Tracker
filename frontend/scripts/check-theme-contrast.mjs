import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, "../src/app/globals.css");
const css = fs.readFileSync(cssPath, "utf-8");

function hexToRgb(hex) {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance({ r, g, b }) {
  const rL = sRgbToLinear(r);
  const gL = sRgbToLinear(g);
  const bL = sRgbToLinear(b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hexToRgb(hex1));
  const l2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Extract theme blocks
const themes = ["oled", "cyberpunk", "matrix", "tokyonight", "nordic", "light"];
const report = [];
let failures = 0;

for (const theme of themes) {
  const regex = new RegExp(`\\[data-theme=["']${theme}["']\\],[\\s\\S]*?\\.theme-${theme}\\s*\\{([\\s\\S]*?)\\}`, "m");
  const match = css.match(regex);
  if (!match) continue;

  const block = match[1];
  const getVal = (prop) => {
    const pMatch = block.match(new RegExp(`${prop}:\\s*(#[a-fA-F0-9]{3,6})`));
    return pMatch ? pMatch[1] : null;
  };

  const bgPrimary = getVal("--bg-primary");
  const bgCard = getVal("--bg-card");
  const textPrimary = getVal("--text-primary");
  const textSecondary = getVal("--text-secondary");

  if (!bgPrimary || !bgCard || !textPrimary || !textSecondary) {
    continue;
  }

  const pairs = [
    { label: "text-primary on bg-primary", fg: textPrimary, bg: bgPrimary },
    { label: "text-primary on bg-card", fg: textPrimary, bg: bgCard },
    { label: "text-secondary on bg-primary", fg: textSecondary, bg: bgPrimary },
    { label: "text-secondary on bg-card", fg: textSecondary, bg: bgCard },
  ];

  for (const pair of pairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passed = ratio >= 4.5;
    if (!passed) failures++;
    report.push({
      theme,
      pair: pair.label,
      fg: pair.fg,
      bg: pair.bg,
      ratio: ratio.toFixed(2) + ":1",
      passed,
    });
  }
}

console.log("=== THEME COLOR CONTRAST WCAG 2.1 AA AUDIT (Threshold >= 4.5:1) ===");
console.table(report);
if (failures === 0) {
  console.log(`\nAll ${report.length} theme token pairs PASS WCAG 2.1 AA contrast requirements!`);
  process.exit(0);
} else {
  console.error(`\nFound ${failures} contrast violations.`);
  process.exit(1);
}

