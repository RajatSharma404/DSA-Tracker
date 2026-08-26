"use client";

import React, { useEffect, useState } from "react";
import { X, Keyboard, Command, Sparkles } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

interface ShortcutGroup {
  category: string;
  shortcuts: Array<{ key: string; description: string }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: "Vim Fast Navigation (Two-Stroke Chords)",
    shortcuts: [
      { key: "g d", description: "Jump to Dashboard Overview" },
      { key: "g r", description: "Jump to Visual Roadmap Graph" },
      { key: "g t", description: "Jump to Topics & Curriculum" },
      { key: "g s", description: "Jump to Problem Search Bank" },
      { key: "g p", description: "Jump to 1v1 PvP Colosseum" },
      { key: "g a", description: "Jump to AlgoTracer Visualizer" },
      { key: "g f", description: "Jump to Spaced Repetition Flashcards" },
      { key: "g c", description: "Open Global Command Palette" },
    ],
  },
  {
    category: "Global Shortcuts & Palette",
    shortcuts: [
      { key: "⌘ K / Ctrl K", description: "Open Command Palette & Quick Actions" },
      { key: "?", description: "Open / Close Keyboard Shortcuts Cheat Sheet" },
      { key: "Esc", description: "Close active modals, drawers, or exit Focus Mode" },
    ],
  },
  {
    category: "Problem Solving Workspace",
    shortcuts: [
      { key: "Esc", description: "Toggle Zen / Fullscreen Focus Mode" },
      { key: "Ctrl + Enter", description: "Submit Code Solution" },
      { key: "Ctrl + '", description: "Run Sample Test Cases" },
    ],
  },
  {
    category: "Spaced Repetition & Flashcards",
    shortcuts: [
      { key: "Space", description: "Flip 3D Flashcard front / back" },
      { key: "1", description: "Grade: Forgot (Reset interval to 1 day)" },
      { key: "2", description: "Grade: Hard (Short interval step)" },
      { key: "3", description: "Grade: Good (Standard 2.5x expansion)" },
      { key: "4", description: "Grade: Easy (Maximum interval leap)" },
      { key: "← / →", description: "Navigate previous / next flashcard" },
    ],
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        soundEffects.playToggle();
        if (isOpen) {
          onClose();
        } else {
          // Open
          window.dispatchEvent(new CustomEvent("dsa-open-shortcuts"));
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-xs">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] font-display">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Speed shortcuts across the DSA Tracker ecosystem
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer border border-[var(--border-subtle)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcut Groups */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] font-mono">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs"
                  >
                    <span className="text-[var(--text-secondary)] font-medium">
                      {s.description}
                    </span>
                    <kbd className="px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono font-bold text-[11px] text-[var(--text-primary)] shadow-xs">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)] font-mono">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">?</kbd> anytime to toggle this modal
        </div>
      </div>
    </div>
  );
}
