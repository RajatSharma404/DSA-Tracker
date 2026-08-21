"use client";

import React from "react";
import { TheoryData } from "../types";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

interface TheoryPanelProps {
  theory?: TheoryData;
  activeTheoryStep?: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function TheoryPanel({
  theory,
  activeTheoryStep = 0,
  isOpen,
  onToggleOpen,
}: TheoryPanelProps) {
  if (!theory) return null;

  const handleToggle = () => {
    soundEffects.playOpen();
    onToggleOpen();
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl overflow-hidden transition-all">
      {/* Header Bar (slim 36px) */}
      <button
        onClick={handleToggle}
        className="w-full h-9 px-3.5 py-1.5 flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left shrink-0"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-[var(--accent-primary)]" />
          <span className="text-[11px] font-mono uppercase font-black tracking-wider text-[var(--accent-primary)]">
            {theory.category}
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="text-[13.5px] font-black text-[var(--text-primary)] font-display">
            {theory.name} Theory
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs font-mono">
          <span>{isOpen ? "Hide Theory" : "Show Theory"}</span>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Body with increased typography and clarity */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5 border-t border-[var(--border-subtle)] flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [-ms-overflow-style:none]">
          {/* Definition */}
          <p className="text-[var(--text-secondary)] leading-relaxed font-normal text-[13px] sm:text-[14px]">
            {theory.definition}
          </p>

          {/* Complexity Cards */}
          <div className="grid grid-cols-4 gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <span className="text-[var(--text-muted)] font-bold text-[11px]">Best</span>
              <span className="text-sm sm:text-[15px] font-black text-emerald-400 mt-0.5">
                {theory.complexity.best}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <span className="text-[var(--text-muted)] font-bold text-[11px]">Average</span>
              <span className="text-sm sm:text-[15px] font-black text-[var(--accent-primary)] mt-0.5">
                {theory.complexity.average}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <span className="text-[var(--text-muted)] font-bold text-[11px]">Worst</span>
              <span className="text-sm sm:text-[15px] font-black text-rose-400 mt-0.5">
                {theory.complexity.worst}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <span className="text-[var(--text-muted)] font-bold text-[11px]">Space</span>
              <span className="text-sm sm:text-[15px] font-black text-purple-300 mt-0.5">
                {theory.complexity.space}
              </span>
            </div>
          </div>

          {/* How It Works List with Live Step Sync */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--accent-primary)] font-mono">
              Step-by-Step Logic
            </span>
            <div className="space-y-1.5">
              {theory.howItWorks.map((stepDesc, idx) => {
                const isActive = activeTheoryStep === idx;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-start gap-2.5 ${
                      isActive
                        ? "bg-[var(--accent-primary)]/15 text-[var(--text-primary)] font-bold border border-[var(--accent-primary)]/40"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black font-mono shrink-0 mt-0.5 ${
                        isActive
                          ? "bg-[var(--accent-primary)] text-black"
                          : "bg-[var(--bg-card)] text-[var(--text-muted)]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed font-medium">
                      {stepDesc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
