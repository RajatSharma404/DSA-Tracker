"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  Copy,
  ChevronsLeft,
  ChevronsRight,
  Sliders,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { TraceStep, SupportedLanguage, AlgorithmType } from "../types";
import { TraceShareModal } from "./TraceShareModal";
import { soundEffects } from "@/lib/soundEffects";

interface ControlsBarProps {
  currentStepIndex: number;
  totalSteps: number;
  allSteps?: TraceStep[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  onReset: () => void;
  onRandomize: () => void;
  speedDelay: number;
  setSpeedDelay: (delay: number) => void;
  onScrub: (index: number) => void;
  codeToCopy?: string;
  isInputDrawerOpen: boolean;
  onToggleInputDrawer: () => void;
  algoType?: AlgorithmType;
  algoDisplayName?: string;
  language?: SupportedLanguage;
  inputArray?: number[];
  targetValue?: number;
}

export function ControlsBar({
  currentStepIndex,
  totalSteps,
  allSteps = [],
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onFirst,
  onLast,
  onReset,
  onRandomize,
  speedDelay,
  setSpeedDelay,
  onScrub,
  codeToCopy,
  isInputDrawerOpen,
  onToggleInputDrawer,
  algoType = "bubble-sort",
  algoDisplayName = "Bubble Sort",
  language = "javascript",
  inputArray = [],
  targetValue = 0,
}: ControlsBarProps) {
  const [hoverStep, setHoverStep] = useState<{
    index: number;
    title: string;
    pct: number;
  } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const progressPercent =
    totalSteps > 1
      ? Math.round((currentStepIndex / (totalSteps - 1)) * 100)
      : totalSteps === 1
        ? 100
        : 0;

  // Compute key milestone markers across all steps
  const milestoneMarkers = useMemo(() => {
    if (allSteps.length === 0) return [];

    return allSteps
      .map((step, idx) => {
        let label = "";
        let color = "";

        if (step.type === "swap") {
          label = "Swap";
          color = "bg-rose-400";
        } else if (step.type === "found") {
          label = "Found Target";
          color = "bg-emerald-400";
        } else if (step.type === "split") {
          label = "Divide";
          color = "bg-cyan-400";
        } else if (step.type === "merge") {
          label = "Merge";
          color = "bg-indigo-400";
        } else if (step.type === "push") {
          label = "Push";
          color = "bg-purple-400";
        } else if (step.type === "pop") {
          label = "Pop";
          color = "bg-amber-400";
        } else if (step.type === "complete") {
          label = "Sorted / Done";
          color = "bg-emerald-400";
        }

        if (!label) return null;

        const pct =
          totalSteps > 1 ? (idx / (totalSteps - 1)) * 100 : 0;

        return {
          stepIndex: idx,
          label,
          color,
          pct,
          description: step.description,
        };
      })
      .filter(Boolean) as Array<{
      stepIndex: number;
      label: string;
      color: string;
      pct: number;
      description: string;
    }>;
  }, [allSteps, totalSteps]);

  const handleCopyCode = () => {
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      soundEffects.playClick();
      toast.success("Code copied!");
    }
  };

  return (
    <>
      <div className="w-full h-14 px-3 sm:px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-xl shrink-0">
        {/* Playback Cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              onFirst();
            }}
            disabled={currentStepIndex === 0}
            title="First Step"
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
          >
            <ChevronsLeft size={14} />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onPrev();
            }}
            disabled={currentStepIndex === 0}
            title="Previous (←)"
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onTogglePlay();
            }}
            title="Play / Pause (Space)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onNext();
            }}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Next (→)"
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onLast();
            }}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Last Step"
            className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
          >
            <ChevronsRight size={14} />
          </button>
        </div>

        {/* Center: Step Scrubber with Key Milestone Markers */}
        <div className="flex-1 max-w-xl mx-2 flex items-center gap-3 relative">
          <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)] shrink-0">
            {totalSteps > 0 ? currentStepIndex + 1 : 0}/{totalSteps}
          </span>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const targetStep = Math.round(ratio * (totalSteps - 1));
              soundEffects.playClick();
              onScrub(targetStep);
            }}
            className="flex-1 h-3 rounded-full bg-[var(--bg-tertiary)] overflow-visible cursor-pointer relative group transition-all hover:h-3.5 border border-[var(--border-subtle)]"
          >
            {/* Progress Fill */}
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-150 shadow-[0_0_8px_var(--accent-glow)]"
            />

            {/* Milestone Event Pins */}
            {milestoneMarkers.map((marker) => (
              <div
                key={marker.stepIndex}
                style={{ left: `${marker.pct}%` }}
                onMouseEnter={() =>
                  setHoverStep({
                    index: marker.stepIndex,
                    title: `${marker.label}: ${marker.description.slice(0, 45)}...`,
                    pct: marker.pct,
                  })
                }
                onMouseLeave={() => setHoverStep(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  soundEffects.playClick();
                  onScrub(marker.stepIndex);
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${marker.color} ring-2 ring-[var(--bg-card)] shadow-xs transition-transform hover:scale-150 z-10`}
              />
            ))}

            {/* Hover Tooltip */}
            {hoverStep && (
              <div
                style={{
                  left: `${hoverStep.pct}%`,
                  transform: "translateX(-50%) translateY(-130%)",
                }}
                className="absolute top-0 z-30 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] text-[10px] font-mono text-[var(--text-primary)] shadow-xl whitespace-nowrap pointer-events-none"
              >
                Step {hoverStep.index + 1}: {hoverStep.title}
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Right: Speed, Input Drawer, Reset, Randomize, Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Speed presets */}
          <div className="hidden sm:flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-0.5 rounded-xl">
            {[
              { label: "0.5x", delay: 1200 },
              { label: "1x", delay: 600 },
              { label: "2x", delay: 300 },
              { label: "4x", delay: 100 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => {
                  soundEffects.playClick();
                  setSpeedDelay(spd.delay);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speedDelay === spd.delay
                    ? "bg-[var(--accent-primary)] text-black font-black"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Input Drawer Toggle */}
          <button
            onClick={() => {
              soundEffects.playOpen();
              onToggleInputDrawer();
            }}
            title="Configure Input Array / Parameters"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
              isInputDrawerOpen
                ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)]"
                : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
            }`}
          >
            <Sliders
              size={13}
              className={isInputDrawerOpen ? "text-[var(--accent-primary)]" : ""}
            />
            <span>Input</span>
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onReset();
            }}
            title="Reset (R)"
            className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <RotateCcw size={13} />
          </button>

          {/* Randomize */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onRandomize();
            }}
            title="Randomize Array"
            className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--accent-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <Shuffle size={13} />
          </button>

          {/* Export / Share Trace */}
          <button
            onClick={() => {
              soundEffects.playOpen();
              setIsShareModalOpen(true);
            }}
            title="Export & Share Trace Session"
            className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <Share2 size={13} />
          </button>

          {codeToCopy && (
            <button
              onClick={handleCopyCode}
              title="Copy Code"
              className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)] hidden md:block"
            >
              <Copy size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <TraceShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        algoType={algoType}
        algoDisplayName={algoDisplayName}
        language={language}
        code={codeToCopy || ""}
        inputArray={inputArray}
        targetValue={targetValue}
        allSteps={allSteps}
        currentStepIndex={currentStepIndex}
      />
    </>
  );
}
