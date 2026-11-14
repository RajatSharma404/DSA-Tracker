"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const { steps, isTracing, error, runTrace, mode, diagram, logs } = useTraceEngine({
    initialCode: code,
    initialArrayInput: arrayInput,
    initialTarget: targetInput,
    initialGraphInput: graphInput,
    algoType: detection.type,
    language,
  });

  // The code the visible trace was produced from (to flag stale traces).
  const [tracedCode, setTracedCode] = useState<string>(code);
  const handleRunTrace = useCallback(() => {
    setTracedCode(code);
    runTrace(code, arrayInput, targetInput, graphInput, detection.type, language);
  }, [code, arrayInput, targetInput, graphInput, detection.type, language, runTrace]);

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

    setTracedCode(preset.codes[language] || preset.codes.javascript);
    runTrace(
      preset.codes[language] || preset.codes.javascript,
      preset.defaultInput.array || arrayInput,
      preset.defaultInput.target ?? targetInput,
      preset.defaultInput.graph ?? graphInput,
      preset.id,
      language,
    ).then(() => reset());
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
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden p-2 sm:p-3 space-y-2 bg-[var(--bg-primary)] text-[var(--text-primary)] select-none">
      {/* Toolbar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Tracer</h1>
          <div role="radiogroup" aria-label="Language" className="flex rounded-lg bg-[var(--bg-tertiary)] p-0.5">
            {(
              [
                { id: "javascript", label: "JavaScript" },
                { id: "python", label: "Python" },
                { id: "cpp", label: "C++" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                role="radio"
                aria-checked={language === lang.id}
                onClick={() => {
                  if (lang.id === language) return;
                  setLanguage(lang.id);
                  const preset = STARTER_PRESETS.find((p) => p.id === detection.type) ?? STARTER_PRESETS[0];
                  const nextCode = preset.codes[lang.id] || preset.codes.javascript;
                  setCode(nextCode);
                  setTracedCode(nextCode);
                  runTrace(nextCode, arrayInput, targetInput, graphInput, preset.id, lang.id).then(() => reset());
                }}
                className={`rounded-md px-3 py-1 text-xs transition-colors cursor-pointer ${
                  language === lang.id
                    ? "bg-[var(--bg-card)] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) handleSelectPreset(e.target.value as AlgorithmType);
              e.target.value = "";
            }}
            defaultValue=""
            aria-label="Load an example"
            className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1 text-xs text-[var(--text-secondary)] outline-none cursor-pointer"
          >
            <option value="" disabled>
              Load an example…
            </option>
            {STARTER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {code !== tracedCode && (
            <button onClick={handleRunTrace} className="text-amber-500 hover:underline underline-offset-2 cursor-pointer">
              Code changed: Run & Trace to update
            </button>
          )}
          {mode === "live" ? (
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]" title="Your code is executed in a sandbox and every step is recorded">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Running your code
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]" title="Python and C++ can't run in the browser, so this is a scripted animation of the detected algorithm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Template animation: {detection.displayName}
            </span>
          )}
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
            currentStep={currentStep}
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
            diagramType={diagram ?? detection.suggestedDiagram}
            logs={logs}
            theory={detection.theory}
            error={error}
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
        allSteps={steps}
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
        algoType={detection.type}
        algoDisplayName={detection.displayName}
        language={language}
        inputArray={arrayInput}
        targetValue={targetInput}
      />
    </div>
  );
}

export default AlgoTracer;
