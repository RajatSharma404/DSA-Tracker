"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Code2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { TraceStep, SupportedLanguage, AlgorithmType } from "../types";
import { soundEffects } from "@/lib/soundEffects";

interface TraceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  algoType: AlgorithmType;
  algoDisplayName: string;
  language: SupportedLanguage;
  code: string;
  inputArray: number[];
  targetValue: number;
  allSteps: TraceStep[];
  currentStepIndex: number;
}

export function TraceShareModal({
  isOpen,
  onClose,
  algoType,
  algoDisplayName,
  language,
  code,
  inputArray,
  targetValue,
  allSteps,
  currentStepIndex,
}: TraceShareModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSteps = allSteps.length;
  const comparisons = allSteps.filter((s) => s.type === "compare").length;
  const swaps = allSteps.filter((s) => s.type === "swap").length;

  const generateMarkdown = () => {
    return `### AlgoTrace Execution Summary: ${algoDisplayName}
- **Language**: \`${language}\`
- **Initial Input**: \`[${inputArray.join(", ")}]\`
- **Target / Pivot**: \`${targetValue}\`
- **Total Execution Steps**: ${totalSteps}
- **Total Comparisons**: ${comparisons}
- **Total Swaps**: ${swaps}

\`\`\`${language}
${code}
\`\`\`
*Generated via DSA Pro AlgoTracer 2.0*`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    soundEffects.playSuccess();
    setCopiedFormat("markdown");
    toast.success("Markdown summary copied to clipboard!");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyJson = () => {
    const json = JSON.stringify(
      {
        algorithm: algoType,
        displayName: algoDisplayName,
        language,
        input: inputArray,
        target: targetValue,
        totalSteps,
        currentStep: currentStepIndex,
        code,
      },
      null,
      2,
    );
    navigator.clipboard.writeText(json);
    soundEffects.playSuccess();
    setCopiedFormat("json");
    toast.success("JSON Trace snapshot copied to clipboard!");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-medium)] p-6 shadow-2xl z-10 space-y-6 text-[var(--text-primary)] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">
                Export AlgoTrace Session
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Share execution statistics & code snapshot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Execution Summary Stats Box */}
        <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
              Steps
            </span>
            <div className="text-lg font-black text-[var(--accent-primary)] mt-0.5">
              {totalSteps}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
              Compares
            </span>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {comparisons}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
              Swaps
            </span>
            <div className="text-lg font-black text-rose-400 mt-0.5">
              {swaps}
            </div>
          </div>
        </div>

        {/* Preview snippet */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 font-mono text-xs space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase">
            <span>Algorithm: {algoDisplayName}</span>
            <span>Lang: {language}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">
            Input: [{inputArray.join(", ")}]
          </p>
        </div>

        {/* Export Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md"
          >
            {copiedFormat === "markdown" ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
            <span>Copy Markdown</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {copiedFormat === "json" ? (
              <Check size={14} />
            ) : (
              <Code2 size={14} />
            )}
            <span>Copy JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
