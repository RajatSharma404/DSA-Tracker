import { useState, useCallback, useEffect } from "react";
import { TraceStep, AlgorithmType } from "../types";
import { executeAlgorithmTrace } from "../utils/sandboxRunner";
import { toast } from "sonner";

interface UseTraceEngineProps {
  initialCode: string;
  initialArrayInput: number[];
  initialTarget?: number;
  initialGraphInput?: string;
  algoType?: AlgorithmType;
}

export function useTraceEngine({
  initialCode,
  initialArrayInput,
  initialTarget = 8,
  initialGraphInput,
  algoType,
}: UseTraceEngineProps) {
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTrace = useCallback(
    (
      code: string,
      arrInput: number[],
      targetInput: number = 8,
      graphInput?: string,
      forcedAlgoType?: AlgorithmType,
    ) => {
      setIsTracing(true);
      setError(null);

      try {
        const result = executeAlgorithmTrace({
          code,
          arrayInput: arrInput,
          targetInput,
          graphInput,
          algoType: forcedAlgoType || algoType,
        });

        if (result.error) {
          setError(result.error);
        }

        setSteps(result.steps);
        return result.steps;
      } catch (err: any) {
        const msg = err?.message || "Failed to trace code execution.";
        setError(msg);
        toast.error(msg);
        return [];
      } finally {
        setIsTracing(false);
      }
    },
    [algoType],
  );

  // Initial trace generation on mount
  useEffect(() => {
    runTrace(
      initialCode,
      initialArrayInput,
      initialTarget,
      initialGraphInput,
      algoType,
    );
  }, []);

  return {
    steps,
    isTracing,
    error,
    runTrace,
  };
}
