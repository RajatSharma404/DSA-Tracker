import React, { useState } from "react";
import { TheoryData } from "../types";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Cpu,
  Clock,
  HardDrive,
} from "lucide-react";

interface TheoryPanelProps {
  theory?: TheoryData;
  activeTheoryStep?: number;
}

export function TheoryPanel({ theory, activeTheoryStep = 0 }: TheoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!theory) return null;

  return (
    <div className="rounded-3xl bg-[#0e0e1a] border border-cyan-500/20 shadow-2xl overflow-hidden transition-all">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BookOpen size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-cyan-400">
                {theory.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-xs font-black text-white">{theory.name} Theory</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-[11px] font-mono">{isOpen ? "Hide Theory" : "Show Theory"}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 space-y-5 border-t border-white/5 text-xs">
          {/* Definition */}
          <p className="text-gray-300 leading-relaxed font-medium">
            {theory.definition}
          </p>

          {/* Complexity & Properties Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                <Clock size={11} className="text-emerald-400" /> Best Time
              </span>
              <span className="text-sm font-black text-emerald-400 mt-1">
                {theory.complexity.best}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                <Clock size={11} className="text-cyan-400" /> Avg Time
              </span>
              <span className="text-sm font-black text-cyan-300 mt-1">
                {theory.complexity.average}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                <Clock size={11} className="text-rose-400" /> Worst Time
              </span>
              <span className="text-sm font-black text-rose-400 mt-1">
                {theory.complexity.worst}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                <HardDrive size={11} className="text-purple-400" /> Space
              </span>
              <span className="text-sm font-black text-purple-300 mt-1">
                {theory.complexity.space}
              </span>
            </div>
          </div>

          {/* Properties Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono flex items-center gap-1.5">
              Stable:{" "}
              {theory.properties.isStable ? (
                <strong className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Yes
                </strong>
              ) : (
                <strong className="text-rose-400 flex items-center gap-1">
                  <XCircle size={12} /> No
                </strong>
              )}
            </span>

            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono flex items-center gap-1.5">
              In-Place:{" "}
              {theory.properties.isInPlace ? (
                <strong className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Yes
                </strong>
              ) : (
                <strong className="text-rose-400 flex items-center gap-1">
                  <XCircle size={12} /> No
                </strong>
              )}
            </span>

            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-gray-300">
              DS: <strong className="text-cyan-400">{theory.properties.dataStructure}</strong>
            </span>
          </div>

          {/* How It Works List with Live Step Sync */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 font-mono">
              How It Works (Synchronized Steps)
            </span>
            <div className="space-y-1.5">
              {theory.howItWorks.map((stepDesc, idx) => {
                const isActive = activeTheoryStep === idx;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl transition-all flex items-start gap-2.5 ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/40 shadow-sm"
                        : "bg-black/30 text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono shrink-0 ${
                        isActive ? "bg-cyan-400 text-black" : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-xs leading-relaxed">{stepDesc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Used When */}
          {theory.bestUsedWhen && theory.bestUsedWhen.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
                <Lightbulb size={12} /> When to use
              </span>
              <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs pl-1">
                {theory.bestUsedWhen.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
