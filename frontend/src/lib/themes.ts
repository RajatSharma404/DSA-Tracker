/**
 * Theme registry shared by the server (pre-paint boot script) and the client.
 * Every theme is an established, published palette — see app/globals.css for
 * the exact values.
 */

export type ThemeMode =
  | "graphite"
  | "mocha"
  | "rosepine"
  | "nord"
  | "tokyonight"
  | "gruvbox"
  | "light"
  | "latte"
  | "dawn";

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  /** Where the palette comes from */
  source: string;
  description: string;
  bgPreview: string;
  accentPreview: string;
  borderPreview: string;
  /** A few swatches for the picker */
  swatches: string[];
  isDark: boolean;
}

export const DEFAULT_THEME: ThemeMode = "graphite";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "graphite",
    name: "Graphite",
    source: "Radix Colors",
    description: "Neutral slate greys with a quiet indigo accent",
    bgPreview: "#111113",
    accentPreview: "#9eb1ff",
    borderPreview: "#2e3135",
    swatches: ["#111113", "#212225", "#b0b4ba", "#9eb1ff"],
    isDark: true,
  },
  {
    id: "mocha",
    name: "Catppuccin Mocha",
    source: "Catppuccin",
    description: "Soft pastel accents on a deep, warm base",
    bgPreview: "#1e1e2e",
    accentPreview: "#cba6f7",
    borderPreview: "#45475a",
    swatches: ["#1e1e2e", "#313244", "#cba6f7", "#89b4fa"],
    isDark: true,
  },
  {
    id: "rosepine",
    name: "Rosé Pine",
    source: "Rosé Pine",
    description: "Muted plum night with rose and foam highlights",
    bgPreview: "#191724",
    accentPreview: "#ebbcba",
    borderPreview: "#403d52",
    swatches: ["#191724", "#26233a", "#ebbcba", "#9ccfd8"],
    isDark: true,
  },
  {
    id: "nord",
    name: "Nord",
    source: "Nord",
    description: "Arctic polar night with frost blue accents",
    bgPreview: "#2e3440",
    accentPreview: "#88c0d0",
    borderPreview: "#4c566a",
    swatches: ["#2e3440", "#434c5e", "#88c0d0", "#81a1c1"],
    isDark: true,
  },
  {
    id: "tokyonight",
    name: "Tokyo Night",
    source: "Tokyo Night",
    description: "Cool night-city blues and lavender",
    bgPreview: "#1a1b26",
    accentPreview: "#7aa2f7",
    borderPreview: "#3b4261",
    swatches: ["#1a1b26", "#292e42", "#7aa2f7", "#bb9af7"],
    isDark: true,
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    source: "Gruvbox",
    description: "Retro, warm and earthy with a golden accent",
    bgPreview: "#282828",
    accentPreview: "#fabd2f",
    borderPreview: "#504945",
    swatches: ["#282828", "#3c3836", "#fabd2f", "#8ec07c"],
    isDark: true,
  },
  {
    id: "light",
    name: "Daylight",
    source: "Radix Colors",
    description: "Crisp slate on white with an indigo accent",
    bgPreview: "#f9f9fb",
    accentPreview: "#3e63dd",
    borderPreview: "#d9d9e0",
    swatches: ["#ffffff", "#f0f0f3", "#1c2024", "#3e63dd"],
    isDark: false,
  },
  {
    id: "latte",
    name: "Catppuccin Latte",
    source: "Catppuccin",
    description: "Pastel light theme with a mauve accent",
    bgPreview: "#eff1f5",
    accentPreview: "#8839ef",
    borderPreview: "#ccd0da",
    swatches: ["#eff1f5", "#dce0e8", "#4c4f69", "#8839ef"],
    isDark: false,
  },
  {
    id: "dawn",
    name: "Rosé Pine Dawn",
    source: "Rosé Pine",
    description: "Warm parchment with pine and rose ink",
    bgPreview: "#faf4ed",
    accentPreview: "#286983",
    borderPreview: "#dfdad9",
    swatches: ["#faf4ed", "#f2e9e1", "#575279", "#286983"],
    isDark: false,
  },
];

/** Previously shipped theme ids -> closest established palette. */
export const LEGACY_THEME_MAP: Record<string, ThemeMode> = {
  oled: "graphite",
  cyberpunk: "mocha",
  matrix: "gruvbox",
  nordic: "nord",
  aurora: "rosepine",
  paper: "dawn",
};

export const THEME_STORAGE_KEY = "dsa_tracker_theme";
export const LIGHT_THEMES: ThemeMode[] = THEME_OPTIONS.filter((t) => !t.isDark).map((t) => t.id);

export const resolveThemeId = (value: string | null | undefined): ThemeMode => {
  if (!value) return DEFAULT_THEME;
  if (THEME_OPTIONS.some((t) => t.id === value)) return value as ThemeMode;
  return LEGACY_THEME_MAP[value] ?? DEFAULT_THEME;
};

/**
 * Inline script for <head>: applies the saved theme before first paint so
 * there is no flash on reload. Mirrors resolveThemeId.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var ids=${JSON.stringify(
  THEME_OPTIONS.map((t) => t.id),
)};var legacy=${JSON.stringify(LEGACY_THEME_MAP)};var light=${JSON.stringify(
  THEME_OPTIONS.filter((t) => !t.isDark).map((t) => t.id),
)};var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(ids.indexOf(t)<0)t=legacy[t]||"${DEFAULT_THEME}";var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=light.indexOf(t)<0?"dark":"light";}catch(e){}})();`;
