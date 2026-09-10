import { GoogleGenAI } from "@google/genai";
import {
  getAIHint as getFallbackHint,
  getPatternExplanation as getFallbackPattern,
  getAICodeReview as getFallbackReview,
  evaluateCode as getFallbackEvaluation,
  getAlgoTracing as getFallbackTrace,
} from "../aiService";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!geminiClient) {
    try {
      geminiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }

  return geminiClient;
}

/**
 * Generates an algorithmic hint using Google Gemini, falling back to static heuristics.
 */
export async function generateAIHint(
  problemTitle: string,
  topicName: string,
  difficulty: string,
): Promise<string> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a staff-level DSA interview coach. Provide a concise, progressive hint for solving the LeetCode problem "${problemTitle}" (Topic: ${topicName}, Difficulty: ${difficulty}).
Focus on the key intuition or invariant. Do NOT write the entire solution. Keep the response under 150 words in clean Markdown.`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (error: any) {
      console.warn("Gemini hint generation failed, using heuristic fallback:", error?.message);
    }
  }

  return getFallbackHint(problemTitle, topicName, difficulty);
}

/**
 * Generates an algorithmic pattern explanation using Google Gemini, falling back to static heuristics.
 */
export async function generatePatternExplanation(
  topicName: string,
): Promise<string> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Explain the "${topicName}" algorithmic pattern for technical coding interviews.
Cover:
1. Core Mental Model & Intuition
2. Key Recognition Signals (when to apply it)
3. Standard Time/Space Complexity
4. Common Pitfalls & Edge Cases
Keep it structured, practical, and concise in Markdown.`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (error: any) {
      console.warn("Gemini pattern explanation failed, using heuristic fallback:", error?.message);
    }
  }

  return getFallbackPattern(topicName);
}

/**
 * Generates a comprehensive code review using Google Gemini, falling back to static heuristics.
 */
export async function generateAICodeReview(
  code: string,
  problemTitle: string,
  topicName: string,
): Promise<any> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are an expert software engineer reviewing a DSA solution for "${problemTitle}" (${topicName}).
Code:
\`\`\`
${code}
\`\`\`

Provide a constructive code review:
1. Time and Space Complexity (Big-O analysis)
2. Edge cases handled and any missed
3. Idiomatic language practices and memory efficiency
4. Optimization suggestions
Format nicely in Markdown.`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (error: any) {
      console.warn("Gemini code review failed, using heuristic fallback:", error?.message);
    }
  }

  return getFallbackReview(code, problemTitle, topicName);
}

/**
 * Evaluates DSA code solution using Google Gemini, falling back to static heuristics.
 */
export async function evaluateCodeWithGemini(
  code: string,
  problemTitle: string,
  topicName: string,
  difficulty: string,
  language?: string,
): Promise<any> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Analyze this DSA solution for problem "${problemTitle}" (${topicName}, ${difficulty}, Language: ${language || "C++"}).
Code:
\`\`\`
${code}
\`\`\`

Respond ONLY with valid JSON matching this exact structure:
{
  "complexity": {
    "time": "O(...)",
    "timeExplanation": "...",
    "space": "O(...)",
    "spaceExplanation": "...",
    "isOptimal": true or false,
    "optimalNote": "..."
  },
  "cleanCode": [
    { "suggestion": "...", "example": "..." }
  ],
  "edgeCases": [
    { "case": "...", "handled": true or false, "note": "..." }
  ],
  "score": 85,
  "verdict": "OPTIMAL" or "SUBOPTIMAL" or "NEEDS_IMPROVEMENT"
}`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const rawText = response.text?.trim();
      if (rawText) {
        // Strip markdown backticks if returned
        const cleaned = rawText.replace(/^```json\s*|^```\s*|```$/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.complexity && parsed.score !== undefined) {
          return parsed;
        }
      }
    } catch (error: any) {
      console.warn("Gemini evaluateCode failed, using heuristic fallback:", error?.message);
    }
  }

  return getFallbackEvaluation(code, problemTitle, topicName, difficulty, language);
}

/**
 * Generates dynamic step-by-step algorithm execution trace using Google Gemini,
 * falling back to specialized pattern heuristics (Trees, Graphs, DP, Arrays)
 * if Gemini is offline or unconfigured.
 */
export async function generateAlgoTrace(
  code: string,
  problemTitle: string,
): Promise<{
  sampleInput: string;
  expectedOutput: string;
  approach: string;
  steps: Array<{
    step: number;
    phase: string;
    codeLine: string;
    narrative: string;
    thinking: string;
    variables: Array<{ name: string; value: string; changed: boolean }>;
    dataStructure: {
      type: string;
      label: string;
      items: Array<{
        value: string;
        state: "default" | "active" | "highlight" | "done" | "compare";
      }>;
    };
  }>;
}> {
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are an algorithmic execution simulator for technical coding interviews.
Trace the step-by-step execution of this code for problem "${problemTitle}".
Code:
\`\`\`
${code}
\`\`\`

Pick a small, illustrative test input and generate 3 to 6 high-signal execution steps showing state transitions.
Respond ONLY with valid JSON matching this exact structure:
{
  "sampleInput": "...",
  "expectedOutput": "...",
  "approach": "High-level summary of algorithm, invariants, and time/space complexity",
  "steps": [
    {
      "step": 1,
      "phase": "INIT",
      "codeLine": "The specific line executed",
      "narrative": "What happens in plain English",
      "thinking": "The mental model / invariant check",
      "variables": [
        { "name": "varName", "value": "varValue", "changed": true }
      ],
      "dataStructure": {
        "type": "array",
        "label": "Human readable name of the primary structure (e.g. Recursion Stack, DP Table, Hash Map, Node Pointer)",
        "items": [
          { "value": "element", "state": "default" }
        ]
      }
    }
  ]
}
Note: "phase" must be one of "INIT", "PROCESS", "CHECK", "FOUND", "RETURN", "LOOP".
Each item "state" must be one of "default", "active", "highlight", "done", "compare".
Do not include any conversational preamble or markdown code blocks, just raw JSON.`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      const rawText = response.text?.trim();
      if (rawText) {
        const cleaned = rawText.replace(/^```json\s*|^```\s*|```$/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (
          parsed &&
          typeof parsed.sampleInput === "string" &&
          Array.isArray(parsed.steps) &&
          parsed.steps.length > 0
        ) {
          const validStates = new Set(["default", "active", "highlight", "done", "compare"]);
          const sanitizedSteps = parsed.steps.map((s: any, idx: number) => ({
            step: typeof s.step === "number" ? s.step : idx + 1,
            phase: typeof s.phase === "string" ? s.phase.toUpperCase() : "PROCESS",
            codeLine: typeof s.codeLine === "string" ? s.codeLine : "",
            narrative: typeof s.narrative === "string" ? s.narrative : "",
            thinking: typeof s.thinking === "string" ? s.thinking : "",
            variables: Array.isArray(s.variables)
              ? s.variables.map((v: any) => ({
                  name: String(v.name || ""),
                  value: String(v.value ?? ""),
                  changed: Boolean(v.changed),
                }))
              : [],
            dataStructure: {
              type: String(s.dataStructure?.type || "array"),
              label: String(s.dataStructure?.label || "Data Structure"),
              items: Array.isArray(s.dataStructure?.items)
                ? s.dataStructure.items.map((item: any) => ({
                    value: String(item.value ?? ""),
                    state: validStates.has(item.state) ? (item.state as any) : "default",
                  }))
                : [],
            },
          }));

          return {
            sampleInput: parsed.sampleInput,
            expectedOutput: String(parsed.expectedOutput || ""),
            approach: String(parsed.approach || ""),
            steps: sanitizedSteps,
          };
        }
      }
    } catch (error: any) {
      console.warn("Gemini algo tracing failed, using heuristic fallback:", error?.message);
    }
  }

  return getFallbackTrace(code, problemTitle);
}

