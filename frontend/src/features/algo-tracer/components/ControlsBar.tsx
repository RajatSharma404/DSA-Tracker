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
    <div className="w-full h-14 px-3 sm:px-4 rounded-2xl bg-[#090910] border border-white/10 flex items-center justify-between gap-3 shadow-xl shrink-0">
      {/* Playback Cluster */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={onFirst}
          disabled={currentStepIndex === 0}
          title="First Step"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          title="Previous (←)"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
        >
          <SkipBack size={14} />
        </button>

        <button
          onClick={onTogglePlay}
          title="Play / Pause (Space)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <button
          onClick={onNext}
          disabled={currentStepIndex >= totalSteps - 1}
          title="Next (→)"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
        >
          <SkipForward size={14} />
        </button>

        <button
          onClick={onLast}
          disabled={currentStepIndex >= totalSteps - 1}
          title="Last Step"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Center: Step & Progress Scrubber */}
      <div className="flex-1 max-w-xl mx-2 flex items-center gap-3">
        <span className="text-[11px] font-mono font-bold text-gray-300 shrink-0">
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
          className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer relative group transition-all hover:h-2.5"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-150"
          />
        </div>

        <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
          {progressPercent}%
        </span>
      </div>

      {/* Right: Speed & Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed presets */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white/5 border border-white/5 p-0.5 rounded-xl">
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
                  ? "bg-cyan-500 text-black font-black"
                  : "text-gray-400 hover:text-white"
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
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
          }`}
        >
          <Sliders size={13} className={isInputDrawerOpen ? "text-cyan-400" : ""} />
          <span>Input</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset (R)"
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
        >
          <RotateCcw size={13} />
        </button>

        {/* Randomize */}
        <button
          onClick={onRandomize}
          title="Randomize Array"
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer border border-white/5"
        >
          <Shuffle size={13} />
        </button>

        {codeToCopy && (
          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 hidden md:block"
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
