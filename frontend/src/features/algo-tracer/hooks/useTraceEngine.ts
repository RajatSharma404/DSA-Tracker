import { useState, useCallback, useEffect, useRef } from "react";
import { TraceStep, AlgorithmType, DiagramType, SupportedLanguage } from "../types";
import { executeAlgorithmTrace } from "../utils/sandboxRunner";
import { traceJavaScript } from "../utils/liveTracer";

interface UseTraceEngineProps {
  initialCode: string;
  initialArrayInput: number[];
  initialTarget?: number;
  initialGraphInput?: string;
  algoType?: AlgorithmType;
  language?: SupportedLanguage;
}

/**
 * "live": the user's JavaScript was actually executed and traced.
 * "template": a scripted animation of the detected algorithm (Python/C++,
 * which can't run in the browser).
 */
export type TraceMode = "live" | "template";

const parseGraph = (raw?: string): Record<string, Array<string | number>> => {
  try {
    const g = JSON.parse(raw || "{}");
    return g && typeof g === "object" ? g : {};
  } catch {
    return {};
  }
};

export function useTraceEngine({
  initialCode,
  initialArrayInput,
  initialTarget = 8,
  initialGraphInput,
  algoType,
  language = "javascript",
}: UseTraceEngineProps) {
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<TraceMode>(language === "javascript" ? "live" : "template");
  const [diagram, setDiagram] = useState<DiagramType | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const runId = useRef(0);

  const runTrace = useCallback(
    async (
      code: string,
      arrInput: number[],
      targetInput: number = 8,
      graphInput?: string,
      forcedAlgoType?: AlgorithmType,
      lang: SupportedLanguage = language,
    ): Promise<TraceStep[]> => {
      const id = ++runId.current;
      setIsTracing(true);
      setError(null);
      try {
        if (lang === "javascript") {
          const live = await traceJavaScript(code, { array: arrInput, target: targetInput, graph: parseGraph(graphInput) });
          if (id !== runId.current) return [];
          setMode("live");
          setDiagram(live.diagram);
          setLogs(live.logs);
          if (live.result !== undefined && live.steps.length) {
            const last = live.steps[live.steps.length - 1];
            last.description = `Finished · returned ${JSON.stringify(live.result)?.slice(0, 120)}`;
          }
          setError(live.error ?? null);
          setSteps(live.steps);
          return live.steps;
        }

        const result = executeAlgorithmTrace({
          code,
          arrayInput: arrInput,
          targetInput,
          graphInput,
          algoType: forcedAlgoType || algoType,
        });
        setMode("template");
        setDiagram(null);
        setLogs([]);
        setError(result.error ?? null);
        setSteps(result.steps);
        return result.steps;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to trace code execution.");
        setSteps([]);
        return [];
      } finally {
        if (id === runId.current) setIsTracing(false);
      }
    },
    [algoType, language],
  );

  // Initial trace on mount
  useEffect(() => {
    runTrace(initialCode, initialArrayInput, initialTarget, initialGraphInput, algoType, language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { steps, isTracing, error, runTrace, mode, diagram, logs };
}
