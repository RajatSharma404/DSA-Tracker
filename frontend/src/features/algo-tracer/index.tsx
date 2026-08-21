"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Sparkles, Code2, Sliders, ExternalLink, Zap } from "lucide-react";
import { SupportedLanguage, AlgorithmType, DiagramType, TraceSession } from "./types";
import { STARTER_PRESETS } from "./data/starterCodes";
import { useAlgoDetector } from "./hooks/useAlgoDetector";
import { useTraceEngine } from "./hooks/useTraceEngine";
import { usePlayback } from "./hooks/usePlayback";
import { EditorPanel } from "./components/EditorPanel";
import { TracePanel } from "./components/TracePanel";
import { ControlsBar } from "./components/ControlsBar";
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
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isResizing, setIsResizing] = useState(false);
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
    <div className="space-y-6 w-full animate-in fade-in duration-500 min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={13} />
            <span>AlgoTrace Pro Execution Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            AlgoTrace Interactive Stepper
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Write any algorithm in the editor, instrument its execution state step-by-step, and watch the live diagram, theory, and highlighted code synchronized in real time.
          </p>
        </div>

        {/* Auto-Detection Badge */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/5 font-mono text-xs self-start sm:self-auto">
          <span className="text-gray-400">Detected:</span>
          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/30">
            {detection.displayName}
          </span>
        </div>
      </div>

      {/* Main Split-View Workspace */}
      <div
        ref={containerRef}
        className={`flex flex-col lg:flex-row gap-0 rounded-[2.5rem] border border-white/10 bg-[#07070d] p-4 sm:p-6 shadow-2xl overflow-hidden ${
          isResizing ? "select-none" : ""
        }`}
      >
        {/* Left Side: Editor & Inputs */}
        <div
          className="w-full lg:pr-3"
          style={{ width: `calc(${splitRatio}% - 4px)` }}
        >
          <EditorPanel
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={(newLang) => {
              setLanguage(newLang);
              const foundPreset = STARTER_PRESETS.find(
                (p) => p.id === detection.type,
              );
              if (foundPreset && foundPreset.codes[newLang]) {
                setCode(foundPreset.codes[newLang]);
              }
            }}
            onRunTrace={handleRunTrace}
            onClear={handleClearCode}
            isTracing={isTracing}
            activeLine={currentStep?.line}
            arrayInput={arrayInput}
            setArrayInput={setArrayInput}
            targetInput={targetInput}
            setTargetInput={setTargetInput}
            graphInput={graphInput}
            setGraphInput={setGraphInput}
            onSelectPreset={handleSelectPreset}
            showGraphInput={isGraphAlgo}
          />
        </div>

        {/* Horizontal Drag Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and trace panels"
          onMouseDown={() => setIsResizing(true)}
          className="hidden lg:flex w-2 shrink-0 cursor-col-resize items-center justify-center group my-2"
        >
          <div className="h-24 w-1 rounded-full bg-white/10 group-hover:bg-cyan-400 transition-colors" />
        </div>

        {/* Right Side: Trace Visualizer & Theory */}
        <div
          className="w-full lg:pl-3 mt-6 lg:mt-0"
          style={{ width: `calc(${100 - splitRatio}% - 4px)` }}
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

      {/* Bottom Controls Bar (Full Width) */}
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
      />
    </div>
  );
}

export default AlgoTracer;
