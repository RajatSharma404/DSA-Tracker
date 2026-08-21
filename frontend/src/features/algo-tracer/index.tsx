"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Zap, CheckCircle2, Sliders } from "lucide-react";
import { SupportedLanguage, AlgorithmType, TraceSession } from "./types";
import { STARTER_PRESETS } from "./data/starterCodes";
import { useAlgoDetector } from "./hooks/useAlgoDetector";
import { useTraceEngine } from "./hooks/useTraceEngine";
import { usePlayback } from "./hooks/usePlayback";
import { EditorPanel } from "./components/EditorPanel";
import { TracePanel } from "./components/TracePanel";
import { ControlsBar } from "./components/ControlsBar";
import { InputDrawer } from "./components/InputDrawer";
import { toast } from "sonner";

interface AlgoTracerProps {
  problemId?: string;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  initialInput?: number[];
  initialTarget?: number;
}

const STORAGE_KEY_PREFIX = "algo-tracer-session";

export function AlgoTracer({
  problemId,
  initialCode,
  initialLanguage = "javascript",
  initialInput = [5, 3, 8, 1, 9, 2, 4],
  initialTarget = 8,
}: AlgoTracerProps) {
  const storageKey = problemId
    ? `${STORAGE_KEY_PREFIX}:${problemId}`
    : `${STORAGE_KEY_PREFIX}:global`;

  const defaultStarter = STARTER_PRESETS[0];

  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(
    initialCode || defaultStarter.codes.javascript,
  );
  const [arrayInput, setArrayInput] = useState<number[]>(initialInput);
  const [targetInput, setTargetInput] = useState<number>(initialTarget);
  const [graphInput, setGraphInput] = useState<string>(
    '{"0":[1,2],"1":[0,3,4],"2":[0,5],"3":[1],"4":[1],"5":[2]}',
  );

  // Split-pane layout ratio (Left Editor % vs Right Trace %)
  const [splitRatio, setSplitRatio] = useState<number>(48);
  const [isResizing, setIsResizing] = useState(false);
  const [isInputDrawerOpen, setIsInputDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Algorithm Detection
  const detection = useAlgoDetector(code);

  // Trace Engine
  const { steps, isTracing, runTrace } = useTraceEngine({
    initialCode: code,
    initialArrayInput: arrayInput,
    initialTarget: targetInput,
    initialGraphInput: graphInput,
    algoType: detection.type,
  });

  const handleRunTrace = useCallback(() => {
    runTrace(code, arrayInput, targetInput, graphInput, detection.type);
    toast.success(`Trace generated for ${detection.displayName}!`);
  }, [code, arrayInput, targetInput, graphInput, detection.type, runTrace]);

  // Playback hook
  const {
    currentStepIndex,
    isPlaying,
    speedDelay,
    setSpeedDelay,
    goToStep,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    reset,
    togglePlay,
  } = usePlayback({
    totalSteps: steps.length,
    onRunTrace: handleRunTrace,
  });

  // Restore saved session from localStorage on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const session: TraceSession = JSON.parse(savedRaw);
        if (session.code) setCode(session.code);
        if (session.language) setLanguage(session.language);
        if (session.customInput) {
          const parsed = JSON.parse(session.customInput);
          if (Array.isArray(parsed)) setArrayInput(parsed);
        }
        if (session.targetValue) setTargetInput(Number(session.targetValue));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persist session to localStorage
  useEffect(() => {
    try {
      const session: TraceSession = {
        problemId,
        code,
        language,
        customInput: JSON.stringify(arrayInput),
        targetValue: String(targetInput),
        graphInput,
        lastStepIndex: currentStepIndex,
        algoType: detection.type,
      };
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [code, language, arrayInput, targetInput, graphInput, currentStepIndex, detection.type, problemId, storageKey]);

  // Drag handle resizer
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      const clamped = Math.max(30, Math.min(70, percent));
      setSplitRatio(clamped);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: AlgorithmType) => {
    const preset = STARTER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setCode(preset.codes[language] || preset.codes.javascript);
    if (preset.defaultInput.array) {
      setArrayInput(preset.defaultInput.array);
    }
    if (preset.defaultInput.target !== undefined) {
      setTargetInput(preset.defaultInput.target);
    }
    if (preset.defaultInput.graph) {
      setGraphInput(preset.defaultInput.graph);
    }

    setTimeout(() => {
      runTrace(
        preset.codes[language] || preset.codes.javascript,
        preset.defaultInput.array || arrayInput,
        preset.defaultInput.target ?? targetInput,
        preset.defaultInput.graph ?? graphInput,
        preset.id,
      );
      reset();
    }, 100);
  };

  const handleClearCode = () => {
    setCode("");
    reset();
  };

  const handleRandomize = () => {
    const newArr = Array.from({ length: arrayInput.length || 7 }, () =>
      Math.floor(Math.random() * 80) + 5,
    );
    setArrayInput(newArr);
    runTrace(code, newArr, targetInput, graphInput, detection.type);
    reset();
  };

  const currentStep = steps[currentStepIndex] || steps[0];
  const isGraphAlgo = detection.suggestedDiagram === "graph";

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden p-2 sm:p-3 space-y-2 bg-[#06060c] text-white select-none">
      {/* ROW 1: SLIM TOPBAR (44px, fixed) */}
      <header className="h-11 px-3.5 rounded-2xl bg-[#0a0a14] border border-white/10 flex items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          {/* Brand Tag */}
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-white">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap size={13} />
            </span>
            <span className="hidden sm:inline">AlgoTrace</span>
            <span className="text-cyan-400 font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
              PRO
            </span>
          </div>

          {/* Language Selector Tabs */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/5 rounded-xl p-0.5 font-mono text-[11px]">
            {(
              [
                { id: "javascript", label: "JS" },
                { id: "python", label: "Python" },
                { id: "cpp", label: "C++" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id);
                  const foundPreset = STARTER_PRESETS.find(
                    (p) => p.id === detection.type,
                  );
                  if (foundPreset && foundPreset.codes[lang.id]) {
                    setCode(foundPreset.codes[lang.id]);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  language === lang.id
                    ? "bg-cyan-500 text-black font-extrabold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Template Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleSelectPreset(e.target.value as AlgorithmType);
              }
            }}
            defaultValue=""
            className="bg-[#12121e] border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-gray-300 outline-none cursor-pointer hidden md:block"
          >
            <option value="" disabled>
              Load Template ▾
            </option>
            {STARTER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {/* Detected Algo */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{detection.displayName}</span>
          </div>

          {/* Extension Ready */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            <CheckCircle2 size={12} />
            <span>Extension Ready</span>
          </div>
        </div>
      </header>

      {/* ROW 2: MAIN WORKSPACE (calc(100vh - 44px - 56px), NO SCROLL) */}
      <div
        ref={containerRef}
        className={`flex-1 min-h-0 flex flex-col lg:flex-row gap-0 overflow-hidden ${
          isResizing ? "select-none" : ""
        }`}
      >
        {/* Left Side: Monaco Editor (~48%) */}
        <div
          className="h-full min-h-0 lg:pr-1.5 flex flex-col"
          style={{ width: `calc(${splitRatio}% - 3px)` }}
        >
          <EditorPanel
            code={code}
            setCode={setCode}
            language={language}
            onRunTrace={handleRunTrace}
            onClear={handleClearCode}
            isTracing={isTracing}
            activeLine={currentStep?.line}
          />
        </div>

        {/* Vertical Resize Drag Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          onMouseDown={() => setIsResizing(true)}
          className="hidden lg:flex w-1.5 shrink-0 cursor-col-resize items-center justify-center group my-2"
        >
          <div className="h-20 w-1 rounded-full bg-white/10 group-hover:bg-cyan-400 transition-colors" />
        </div>

        {/* Right Side: Trace Visualizer (~52%) */}
        <div
          className="h-full min-h-0 lg:pl-1.5 flex flex-col mt-2 lg:mt-0"
          style={{ width: `calc(${100 - splitRatio}% - 3px)` }}
        >
          <TracePanel
            currentStep={currentStep}
            allSteps={steps}
            currentStepIndex={currentStepIndex}
            diagramType={detection.suggestedDiagram}
            theory={detection.theory}
          />
        </div>
      </div>

      {/* COLLAPSIBLE SLIDE-UP INPUT DRAWER (slides up above controls) */}
      {isInputDrawerOpen && (
        <InputDrawer
          isOpen={isInputDrawerOpen}
          onClose={() => setIsInputDrawerOpen(false)}
          arrayInput={arrayInput}
          setArrayInput={setArrayInput}
          targetInput={targetInput}
          setTargetInput={setTargetInput}
          graphInput={graphInput}
          setGraphInput={setGraphInput}
          onRerun={handleRunTrace}
          showGraphInput={isGraphAlgo}
        />
      )}

      {/* ROW 3: CONTROLS BAR (56px fixed height) */}
      <ControlsBar
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextStep}
        onPrev={prevStep}
        onFirst={firstStep}
        onLast={lastStep}
        onReset={reset}
        onRandomize={handleRandomize}
        speedDelay={speedDelay}
        setSpeedDelay={setSpeedDelay}
        onScrub={goToStep}
        codeToCopy={code}
        isInputDrawerOpen={isInputDrawerOpen}
        onToggleInputDrawer={() => setIsInputDrawerOpen(!isInputDrawerOpen)}
      />
    </div>
  );
}

export default AlgoTracer;
