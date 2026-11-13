/** Theme registry shared by server (layout boot script) and client code. */

export type ThemeMode =
  | "oled"
  | "cyberpunk"
  | "matrix"
  | "tokyonight"
  | "nordic"
  | "aurora"
  | "light"
  | "paper";

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  bgPreview: string;
  accentPreview: string;
  borderPreview: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "oled",
    name: "OLED Midnight",
    description: "Pure pitch black with neon cyan & violet accents",
    bgPreview: "#000000",
    accentPreview: "#00f0ff",
    borderPreview: "rgba(0, 240, 255, 0.3)",
    isDark: true,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    description: "Neon yellow & electric magenta on deep navy",
    bgPreview: "#080d1a",
    accentPreview: "#facc15",
    borderPreview: "rgba(250, 204, 21, 0.3)",
    isDark: true,
  },
  {
    id: "matrix",
    name: "Matrix Emerald",
    description: "Dark matrix terminal green & mint code aesthetic",
    bgPreview: "#031716",
    accentPreview: "#10b981",
    borderPreview: "rgba(16, 185, 129, 0.3)",
    isDark: true,
  },
  {
    id: "tokyonight",
    name: "Tokyo Night",
    description: "Deep twilight purple & electric rose highlights",
    bgPreview: "#1a1b26",
    accentPreview: "#a855f7",
    borderPreview: "rgba(168, 85, 247, 0.3)",
    isDark: true,
  },
  {
    id: "nordic",
    name: "Nordic Slate",
    description: "Slate blue with icy teal and arctic cyan elements",
    bgPreview: "#0f172a",
    accentPreview: "#38bdf8",
    borderPreview: "rgba(56, 189, 248, 0.3)",
    isDark: true,
  },
  {
    id: "aurora",
    name: "Aurora Borealis",
    description: "Polar night sky with drifting teal & magenta aurora glow",
    bgPreview: "#060912",
    accentPreview: "#2dd4bf",
    borderPreview: "rgba(45, 212, 191, 0.3)",
    isDark: true,
  },
  {
    id: "light",
    name: "Enterprise Light",
    description: "Clean enterprise white with crisp slate and indigo",
    bgPreview: "#f8fafc",
    accentPreview: "#4f46e5",
    borderPreview: "rgba(79, 70, 229, 0.3)",
    isDark: false,
  },
  {
    id: "paper",
    name: "Sepia Paper",
    description: "Warm notebook paper, ink-dark text and terracotta accents",
    bgPreview: "#f5efe3",
    accentPreview: "#c2410c",
    borderPreview: "rgba(194, 65, 12, 0.3)",
    isDark: false,
  },
];

export const THEME_STORAGE_KEY = "dsa_tracker_theme";
export const LIGHT_THEMES: ThemeMode[] = THEME_OPTIONS.filter((t) => !t.isDark).map((t) => t.id);

/**
 * Inline script for <head>: applies the saved theme before first paint so
 * there is no dark→light flash on reload.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var ids=${JSON.stringify(
  THEME_OPTIONS.map((t) => t.id),
)};var light=${JSON.stringify(
  THEME_OPTIONS.filter((t) => !t.isDark).map((t) => t.id),
)};var t=localStorage.getItem("dsa_tracker_theme");if(ids.indexOf(t)<0)t="oled";var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=light.indexOf(t)<0?"dark":"light";}catch(e){}})();`;
