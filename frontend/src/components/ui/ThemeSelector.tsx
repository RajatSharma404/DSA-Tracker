"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTheme, THEME_OPTIONS, type ThemeOption } from "@/components/providers/ThemeProvider";

interface ThemeSelectorProps {
  variant?: "dropdown" | "pills" | "grid";
  placement?: "top" | "bottom";
  className?: string;
}

/** The palette rendered as its real colours: background, surface, ink, accent. */
function Swatch({ option, size = "md" }: { option: ThemeOption; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-14" : size === "md" ? "h-4 w-10" : "h-3 w-7";
  return (
    <span
      className={`flex shrink-0 overflow-hidden rounded-[5px] ring-1 ring-[var(--border-medium)] ${h} ${size === "lg" ? "w-full" : ""}`}
      aria-hidden
    >
      {option.swatches.map((c) => (
        <span key={c} className="flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

const GROUPS: Array<{ label: string; dark: boolean }> = [
  { label: "Dark", dark: true },
  { label: "Light", dark: false },
];

export function ThemeSelector({ variant = "dropdown", placement = "bottom", className = "" }: ThemeSelectorProps) {
  const { theme, setTheme, currentThemeOption } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
  }, [open]);

  if (variant === "grid") {
    return (
      <div className={`space-y-6 ${className}`}>
        {GROUPS.map((g) => (
          <div key={g.label}>
            <h3 className="mb-2 text-xs font-medium text-[var(--text-muted)]">{g.label}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {THEME_OPTIONS.filter((o) => o.isDark === g.dark).map((o) => {
                const active = o.id === theme;
                return (
                  <button
                    key={o.id}
                    onClick={() => setTheme(o.id)}
                    aria-pressed={active}
                    className={`group rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      active
                        ? "border-[var(--accent-primary)] bg-[var(--bg-hover)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <Swatch option={o} size="lg" />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{o.name}</span>
                      {active && <Check size={15} className="text-[var(--accent-primary)]" />}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{o.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {THEME_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            aria-pressed={o.id === theme}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs cursor-pointer ${
              o.id === theme
                ? "border-[var(--accent-primary)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            <Swatch option={o} size="sm" />
            <span className="truncate">{o.name}</span>
          </button>
        ))}
      </div>
    );
  }

  const onListKey = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change Theme Preset"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <Swatch option={currentThemeOption} size="sm" />
        <span className="flex-1 truncate">{currentThemeOption.name}</span>
        <ChevronsUpDown size={14} className="text-[var(--text-muted)]" />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Theme"
          onKeyDown={onListKey}
          className={`absolute left-0 z-50 w-64 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] p-1.5 shadow-[var(--shadow-lg)] ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {GROUPS.map((g) => (
            <div key={g.label} className="py-1">
              <div className="px-2 pb-1 text-[11px] font-medium text-[var(--text-muted)]">{g.label}</div>
              {THEME_OPTIONS.filter((o) => o.isDark === g.dark).map((o) => (
                <button
                  key={o.id}
                  role="option"
                  aria-selected={o.id === theme}
                  onClick={() => {
                    setTheme(o.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] text-[var(--text-secondary)] outline-none hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:text-[var(--text-primary)] cursor-pointer"
                >
                  <Swatch option={o} />
                  <span className="flex-1 truncate">{o.name}</span>
                  {o.id === theme && <Check size={14} className="text-[var(--accent-primary)]" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
