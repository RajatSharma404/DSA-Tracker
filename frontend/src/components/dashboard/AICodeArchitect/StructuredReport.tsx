/**
 * Structured Code Review Report Component
 */

"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  ShieldCheck,
  Code,
  Lightbulb,
  Zap,
} from "lucide-react";
import { DESIGN_TOKENS, getStatusStyle } from "@/lib/design-tokens";

export interface StructuredReview {
  verdict: "OPTIMAL" | "GOOD" | "NEEDS WORK";
  summary: string;
  efficiency: {
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    isOptimal: boolean;
    optimalNote: string;
  };
  logic: {
    isCorrect: boolean;
    explanation: string;
    edgeCases: Array<{ case: string; handled: boolean; note: string }>;
  };
  cleanCode: Array<{ suggestion: string; example: string }>;
  proTip: string;
}

export function StructuredReport({ data }: { data: StructuredReview }) {
  const status = getStatusStyle(data.verdict);

  return (
    <div className="space-y-5 min-w-0">
      {/* Verdict + Summary */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 ${status.bg} ${status.border}`}
      >
        <div
          className={`p-3 rounded-xl shrink-0 border ${status.bg} ${status.icon} ${status.border}`}
        >
          {data.verdict === "OPTIMAL" && <CheckCircle2 size={16} />}
          {data.verdict === "GOOD" && <Zap size={16} />}
          {data.verdict === "NEEDS WORK" && <AlertTriangle size={16} />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${status.text}`}
            >
              {data.verdict}
            </span>
          </div>
          <p className="text-sm text-gray-200 font-medium leading-relaxed break-word">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Efficiency Section */}
      <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-blue-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Efficiency &Complexity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Time */}
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-cyan-400" />
              <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-widest">
                Time
              </span>
            </div>
            <p className="text-lg font-black text-white font-mono mb-1">
              {data.efficiency.timeComplexity}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed break-word">
              {data.efficiency.timeExplanation}
            </p>
          </div>
          {/* Space */}
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={12} className="text-purple-400" />
              <span className="text-[9px] font-black text-purple-400/70 uppercase tracking-widest">
                Space
              </span>
            </div>
            <p className="text-lg font-black text-white font-mono mb-1">
              {data.efficiency.spaceComplexity}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed break-word">
              {data.efficiency.spaceExplanation}
            </p>
          </div>
        </div>

        {/* Optimal Badge */}
        <div
          className={`p-3 rounded-xl border flex items-start gap-3 ${data.efficiency.isOptimal ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"}`}
        >
          {data.efficiency.isOptimal ? (
            <CheckCircle2
              size={14}
              className="text-green-400 shrink-0 mt-0.5"
            />
          ) : (
            <AlertTriangle
              size={14}
              className="text-amber-400 shrink-0 mt-0.5"
            />
          )}
          <p
            className={`text-[11px] font-medium leading-relaxed break-word ${data.efficiency.isOptimal ? "text-green-300/80" : "text-amber-300/80"}`}
          >
            {data.efficiency.optimalNote}
          </p>
        </div>
      </div>

      {/* Logic & Edge Cases */}
      <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Logic & Edge Cases
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-start gap-3 ${data.logic.isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}
        >
          {data.logic.isCorrect ? (
            <CheckCircle2
              size={14}
              className="text-green-400 shrink-0 mt-0.5"
            />
          ) : (
            <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          )}
          <p
            className={`text-[11px] font-medium leading-relaxed break-word ${data.logic.isCorrect ? "text-green-300/80" : "text-red-300/80"}`}
          >
            {data.logic.explanation}
          </p>
        </div>

        {/* Edge Cases Table */}
        <div className="space-y-2">
          {data.logic.edgeCases.map((ec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-white/2 rounded-xl border border-white/5"
            >
              <div className="shrink-0 mt-0.5">
                {ec.handled ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-red-500" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block">
                  {ec.case}
                </span>
                <span className="text-[10px] text-gray-500 break-word">
                  {ec.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Code Suggestions */}
      {data.cleanCode && data.cleanCode.length > 0 && (
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Code size={14} className="text-pink-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Clean Code Suggestions
            </span>
          </div>
          {data.cleanCode.map((cc, i) => (
            <div
              key={i}
              className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2"
            >
              <p className="text-[12px] text-gray-200 font-medium break-word">
                {cc.suggestion}
              </p>
              {cc.example && (
                <code className="block text-[11px] font-mono text-pink-300/80 bg-pink-500/5 px-3 py-2 rounded-lg border border-pink-500/10 break-all whitespace-pre-wrap">
                  {cc.example}
                </code>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pro Tip */}
      <div className="p-5 bg-linear-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Lightbulb size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest block mb-1">
              Interviewer Pro-Tip
            </span>
            <p className="text-sm text-amber-200/80 font-medium leading-relaxed italic break-word">
              {data.proTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
