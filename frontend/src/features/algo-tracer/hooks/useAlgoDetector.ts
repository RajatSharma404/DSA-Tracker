import { useMemo } from "react";
import { detectAlgorithm } from "../utils/algoPatterns";
import { AlgoDetectionResult } from "../types";

export function useAlgoDetector(code: string): AlgoDetectionResult {
  return useMemo(() => {
    return detectAlgorithm(code);
  }, [code]);
}
