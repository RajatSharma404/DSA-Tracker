"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode =
  | "oled"
  | "cyberpunk"
  | "matrix"
  | "tokyonight"
  | "nordic"
  | "light";

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
    id: "light",
    name: "Enterprise Light",
    description: "Clean enterprise white with crisp slate and indigo",
    bgPreview: "#f8fafc",
    accentPreview: "#4f46e5",
    borderPreview: "rgba(79, 70, 229, 0.3)",
    isDark: false,
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "dsa_tracker_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("oled");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      const activeTheme =
        savedTheme && THEME_OPTIONS.some((option) => option.id === savedTheme)
          ? savedTheme
          : "oled";
      setThemeState(activeTheme);
      document.documentElement.setAttribute("data-theme", activeTheme);
      document.body.setAttribute("data-theme", activeTheme);
    } catch {
      document.documentElement.setAttribute("data-theme", "oled");
      document.body.setAttribute("data-theme", "oled");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  const currentThemeOption =
    THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeOption }}>
      <div
        className={`theme-${theme} ${mounted ? "theme-mounted" : ""} w-full h-full min-w-0 flex flex-col`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
