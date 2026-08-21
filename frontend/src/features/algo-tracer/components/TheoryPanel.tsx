import React, { useState } from "react";
import { TheoryData } from "../types";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  HardDrive,
} from "lucide-react";

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

  return (
    <div className="rounded-2xl bg-[#0e0e1a] border border-cyan-500/20 shadow-xl shrink-0 overflow-hidden transition-all">
      {/* Header Bar (slim 32px) */}
      <button
        onClick={onToggleOpen}
        className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={13} className="text-cyan-400" />
          <span className="text-[10px] font-mono uppercase font-black tracking-wider text-cyan-400">
            {theory.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-xs font-black text-white">{theory.name} Theory</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono">
          <span>{isOpen ? "Hide Theory" : "Show Theory"}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Internally Scrollable Body (capped at max-h-48) */}
      {isOpen && (
        <div className="p-3 space-y-3 border-t border-white/5 text-xs max-h-44 overflow-y-auto [scrollbar-width:thin] [-ms-overflow-style:none]">
          {/* Definition */}
          <p className="text-gray-300 leading-relaxed font-medium text-[11px]">
            {theory.definition}
          </p>

          {/* Complexity Cards */}
          <div className="grid grid-cols-4 gap-2 font-mono text-[10px]">
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-400 font-bold">Best</span>
              <span className="text-xs font-black text-emerald-400 mt-0.5">
                {theory.complexity.best}
              </span>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-400 font-bold">Average</span>
              <span className="text-xs font-black text-cyan-300 mt-0.5">
                {theory.complexity.average}
              </span>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-400 font-bold">Worst</span>
              <span className="text-xs font-black text-rose-400 mt-0.5">
                {theory.complexity.worst}
              </span>
            </div>
            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-400 font-bold">Space</span>
              <span className="text-xs font-black text-purple-300 mt-0.5">
                {theory.complexity.space}
              </span>
            </div>
          </div>

          {/* How It Works List with Live Step Sync */}
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 font-mono">
              Step-by-Step Logic
            </span>
            <div className="space-y-1">
              {theory.howItWorks.map((stepDesc, idx) => {
                const isActive = activeTheoryStep === idx;

                return (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded-lg transition-all flex items-start gap-2 ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40"
                        : "bg-black/30 text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black font-mono shrink-0 ${
                        isActive ? "bg-cyan-400 text-black" : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-[11px] leading-snug">{stepDesc}</p>
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
