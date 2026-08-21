"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, THEME_OPTIONS, ThemeMode } from "@/components/providers/ThemeProvider";
import { Palette, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

interface ThemeSelectorProps {
  variant?: "dropdown" | "pills" | "grid";
  placement?: "top" | "bottom";
  className?: string;
}

export function ThemeSelector({
  variant = "dropdown",
  placement = "bottom",
  className = "",
}: ThemeSelectorProps) {
  const { theme, setTheme, currentThemeOption } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {THEME_OPTIONS.map((option) => {
          const active = option.id === theme;
          return (
            <button
              key={option.id}
              onClick={() => {
                soundEffects.playClick();
                setTheme(option.id);
              }}
              className={`p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                active
                  ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30 bg-[var(--bg-card)] shadow-lg"
                  : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {/* Color Swatch Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: option.bgPreview }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: option.accentPreview }}
                    />
                  </div>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">
                    {option.name}
                  </span>
                </div>
                {active && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-mono">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                {option.description}
              </p>

              {/* Visual Preview Bar */}
              <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden flex border border-white/10">
                <div className="h-full w-1/3" style={{ backgroundColor: option.bgPreview }} />
                <div className="h-full w-1/3" style={{ backgroundColor: option.accentPreview }} />
                <div className="h-full w-1/3" style={{ backgroundColor: option.borderPreview }} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {THEME_OPTIONS.map((option) => {
          const active = option.id === theme;
          return (
            <button
              key={option.id}
              onClick={() => {
                soundEffects.playClick();
                setTheme(option.id);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] shadow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20"
                style={{ backgroundColor: option.accentPreview }}
              />
              <span>{option.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const isPlacementTop = placement === "top";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => {
          soundEffects.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-all cursor-pointer shadow-xs group font-mono"
        title="Change Theme Preset"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:rotate-12 transition-transform duration-200" />
          <span className="truncate">{currentThemeOption.name}</span>
        </div>
        {isPlacementTop ? (
          <ChevronUp className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-56 p-1.5 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150 ${
            isPlacementTop
              ? "bottom-full mb-2 slide-in-from-bottom-2"
              : "top-full mt-2 slide-in-from-top-2"
          }`}
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center justify-between border-b border-[var(--border-subtle)] mb-1 font-mono">
            <span>Theme Presets</span>
            <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
          </div>
          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {THEME_OPTIONS.map((option) => {
              const active = option.id === theme;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setTheme(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    active
                      ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-xs shrink-0"
                      style={{ backgroundColor: option.accentPreview }}
                    />
                    <span className="truncate">{option.name}</span>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
