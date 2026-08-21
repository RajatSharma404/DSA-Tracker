import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  Copy,
  Gauge,
  ChevronsLeft,
  ChevronsRight,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";

interface ControlsBarProps {
  currentStepIndex: number;
  totalSteps: number;
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
}

export function ControlsBar({
  currentStepIndex,
  totalSteps,
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
}: ControlsBarProps) {
  const progressPercent =
    totalSteps > 1
      ? Math.round((currentStepIndex / (totalSteps - 1)) * 100)
      : totalSteps === 1
        ? 100
        : 0;

  const handleCopyCode = () => {
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      toast.success("Code copied!");
    }
  };

  return (
    <div className="w-full h-14 px-3 sm:px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-xl shrink-0">
      {/* Playback Cluster */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={onFirst}
          disabled={currentStepIndex === 0}
          title="First Step"
          className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          title="Previous (←)"
          className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
        >
          <SkipBack size={14} />
        </button>

        <button
          onClick={onTogglePlay}
          title="Play / Pause (Space)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <button
          onClick={onNext}
          disabled={currentStepIndex >= totalSteps - 1}
          title="Next (→)"
          className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
        >
          <SkipForward size={14} />
        </button>

        <button
          onClick={onLast}
          disabled={currentStepIndex >= totalSteps - 1}
          title="Last Step"
          className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-20 border border-[var(--border-subtle)]"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Center: Step & Progress Scrubber */}
      <div className="flex-1 max-w-xl mx-2 flex items-center gap-3">
        <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)] shrink-0">
          {totalSteps > 0 ? currentStepIndex + 1 : 0}/{totalSteps}
        </span>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            const targetStep = Math.round(ratio * (totalSteps - 1));
            onScrub(targetStep);
          }}
          className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden cursor-pointer relative group transition-all hover:h-2.5 border border-[var(--border-subtle)]"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-150 shadow-[0_0_8px_var(--accent-glow)]"
          />
        </div>

        <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold shrink-0">
          {progressPercent}%
        </span>
      </div>

      {/* Right: Speed & Action Buttons */}
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
              onClick={() => setSpeedDelay(spd.delay)}
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
          onClick={onToggleInputDrawer}
          title="Configure Input Array / Parameters"
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
            isInputDrawerOpen
              ? "bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)]"
              : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
          }`}
        >
          <Sliders size={13} className={isInputDrawerOpen ? "text-[var(--accent-primary)]" : ""} />
          <span>Input</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset (R)"
          className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
        >
          <RotateCcw size={13} />
        </button>

        {/* Randomize */}
        <button
          onClick={onRandomize}
          title="Randomize Array"
          className="p-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--accent-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
        >
          <Shuffle size={13} />
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
  );
}
