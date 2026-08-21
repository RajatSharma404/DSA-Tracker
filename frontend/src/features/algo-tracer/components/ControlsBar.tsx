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
  Keyboard,
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
      toast.success("Code copied to clipboard!");
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#090910] border border-white/10 p-4 sm:p-5 space-y-3.5 shadow-2xl">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Buttons Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onFirst}
            disabled={currentStepIndex === 0}
            title="First Step"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            title="Previous Step (Left Arrow)"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={onTogglePlay}
            title="Play / Pause (Space)"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? "Pause" : "Play Trace"}</span>
          </button>

          <button
            onClick={onNext}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Next Step (Right Arrow)"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={onLast}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Last Step"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3.5 py-2 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-400">
            <Gauge size={13} className="text-cyan-400" />
            <span>Speed:</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { label: "0.5x", delay: 1200 },
              { label: "1x", delay: 600 },
              { label: "2x", delay: 300 },
              { label: "4x", delay: 100 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setSpeedDelay(spd.delay)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speedDelay === spd.delay
                    ? "bg-cyan-500 text-black font-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Reset to Step 0 (R)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-gray-300 hover:text-white transition-all cursor-pointer border border-white/5"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            onClick={onRandomize}
            title="Generate New Random Array"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer border border-white/5"
          >
            <Shuffle size={13} />
            <span>New Array</span>
          </button>

          {codeToCopy && (
            <button
              onClick={handleCopyCode}
              title="Copy Code to Clipboard"
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer border border-white/5"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Scrubber Bar & Step Counter */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span className="font-bold text-white">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
          </span>
          <span className="text-cyan-400 font-bold">{progressPercent}%</span>
        </div>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            const targetStep = Math.round(ratio * (totalSteps - 1));
            onScrub(targetStep);
          }}
          className="w-full h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer relative group transition-all hover:h-2.5"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-150"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Helper Line */}
      <div className="flex items-center justify-center gap-4 pt-1 text-[10px] font-mono text-gray-400">
        <span className="flex items-center gap-1">
          <Keyboard size={11} className="text-gray-400" />
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold">Space</kbd> Play/Pause
        </span>
        <span>•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold">← / →</kbd> Step
        </span>
        <span>•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold">R</kbd> Reset
        </span>
        <span>•</span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold">Ctrl+Enter</kbd> Run
        </span>
      </div>
    </div>
  );
}
