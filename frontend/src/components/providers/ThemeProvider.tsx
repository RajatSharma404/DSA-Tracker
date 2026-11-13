"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  LIGHT_THEMES,
  type ThemeMode,
  type ThemeOption,
} from "@/lib/themes";

export { THEME_OPTIONS, LIGHT_THEMES, THEME_STORAGE_KEY };
export type { ThemeMode, ThemeOption };

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

  const applyTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
    document.documentElement.style.colorScheme = LIGHT_THEMES.includes(newTheme)
      ? "light"
      : "dark";
  };

  const setTheme = (newTheme: ThemeMode) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        applyTheme(newTheme);
      });
    } else {
      applyTheme(newTheme);
    }
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
