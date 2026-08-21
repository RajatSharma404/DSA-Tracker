import React from "react";
import { TheoryData } from "../types";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
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
    <div className="h-full flex flex-col rounded-2xl bg-[#0e0e1a] border border-cyan-500/20 shadow-xl overflow-hidden transition-all">
      {/* Header Bar (slim 36px) */}
      <button
        onClick={onToggleOpen}
        className="w-full h-9 px-3.5 py-1.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left shrink-0"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-cyan-400" />
          <span className="text-[11px] font-mono uppercase font-black tracking-wider text-cyan-400">
            {theory.category}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-[13.5px] font-black text-white">{theory.name} Theory</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-300 text-xs font-mono">
          <span>{isOpen ? "Hide Theory" : "Show Theory"}</span>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Body with increased typography and clarity */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5 border-t border-white/5 flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [-ms-overflow-style:none]">
          {/* Definition */}
          <p className="text-gray-200 leading-relaxed font-normal text-[13px] sm:text-[14px]">
            {theory.definition}
          </p>

          {/* Complexity Cards */}
          <div className="grid grid-cols-4 gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-300 font-bold text-[11px]">Best</span>
              <span className="text-sm sm:text-[15px] font-black text-emerald-400 mt-0.5">
                {theory.complexity.best}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-300 font-bold text-[11px]">Average</span>
              <span className="text-sm sm:text-[15px] font-black text-cyan-300 mt-0.5">
                {theory.complexity.average}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-300 font-bold text-[11px]">Worst</span>
              <span className="text-sm sm:text-[15px] font-black text-rose-400 mt-0.5">
                {theory.complexity.worst}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-gray-300 font-bold text-[11px]">Space</span>
              <span className="text-sm sm:text-[15px] font-black text-purple-300 mt-0.5">
                {theory.complexity.space}
              </span>
            </div>
          </div>

          {/* How It Works List with Live Step Sync */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 font-mono">
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
                        ? "bg-cyan-500/20 text-cyan-100 font-bold border border-cyan-500/40"
                        : "bg-black/30 text-gray-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black font-mono shrink-0 mt-0.5 ${
                        isActive ? "bg-cyan-400 text-black" : "bg-white/10 text-gray-300"
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
