export interface ComplexityEstimate {
  time: string;
  space: string;
  confidence: "low" | "medium";
  method: "ast" | "heuristic";
  notes: string[];
}

