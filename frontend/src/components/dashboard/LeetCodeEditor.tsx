"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Zap,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import {
  FlowchartPanel,
  FlowchartData,
  FlowchartNode,
} from "@/components/FlowchartPanel";
import { generateAstFlowchart } from "@/lib/astFlowchartEngine";
import { dsaApi } from "@/lib/api";
import {
  submitViaExtension,
  getExtensionHealth,
  ExtensionHealthState,
} from "@/lib/extensionBridge";

interface LeetCodeEditorProps {
  problemSlug: string;
  problemTitle: string;
  problemId: string;
  onSubmissionSuccess?: (timeSpent: number) => void;
}

interface LanguageConfig {
  label: string;
  monacoLang: string;
  leetcodeLang: string;
}

const LANGUAGES: Record<string, LanguageConfig> = {
  cpp: { label: "C++", monacoLang: "cpp", leetcodeLang: "cpp" },
  c: { label: "C", monacoLang: "c", leetcodeLang: "c" },
  java: { label: "Java", monacoLang: "java", leetcodeLang: "java" },
  python3: { label: "Python3", monacoLang: "python", leetcodeLang: "python3" },
};

interface EvaluationResult {
  isCorrect: boolean;
  verdict: string;
  verdictMessage: string;
  failingCase?: {
    input: string | null;
    expected: string | null;
    actual: string | null;
  };
  complexity: {
    time: string;
    timeExplanation: string;
    space: string;
    spaceExplanation: string;
  };
  optimalComplexity: {
    time: string;
    space: string;
    isCurrentOptimal: boolean;
    explanation: string;
  };
  betterApproaches: Array<{
    name: string;
    timeComplexity: string;
    spaceComplexity: string;
    description: string;
    pseudocode: string;
  }>;
  edgeCases: Array<{
    case: string;
    handled: boolean;
  }>;
  score: number;
  feedback: string;
}

interface LeetCodeSubmissionState {
  verdict: string;
  accepted: boolean;
  details?: string;
  runtime?: string | null;
  memory?: string | null;
  runtimePercentile?: number | null;
  memoryPercentile?: number | null;
  totalCorrect?: number | null;
  totalTestcases?: number | null;
}

export function LeetCodeEditor({
  problemSlug,
  problemId,
  onSubmissionSuccess,
}: LeetCodeEditorProps) {
  const [selectedLang, setSelectedLang] = useState<string>("cpp");
  const [code, setCode] = useState<string>("# Write your code here\n");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loadingSnippets, setLoadingSnippets] = useState(true);
  const [codeSnippets, setCodeSnippets] = useState<Record<string, string>>({});
  const [showApproaches, setShowApproaches] = useState(false);
  const [showEdgeCases, setShowEdgeCases] = useState(false);
  const [savedCode, setSavedCode] = useState<Record<string, string>>({});
  const [leetcodeSubmission, setLeetcodeSubmission] =
    useState<LeetCodeSubmissionState | null>(null);
  const [submitPath, setSubmitPath] = useState<
    "IDLE" | "EXTENSION" | "UNAVAILABLE"
  >("IDLE");
  const [extensionHealth, setExtensionHealth] =
    useState<ExtensionHealthState>("NOT_INSTALLED");
  const [startTime] = useState<number>(Date.now());

  // CodeVis Flowchart state & Monaco refs
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [mobileFlowchartOpen, setMobileFlowchartOpen] = useState(true);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Language mapping for CodeVis API (Python -> python, C -> c, C++ -> cpp)
  const getCodeVisLanguage = (langKey: string): string => {
    switch (langKey) {
      case "python3":
        return "python";
      case "c":
        return "c";
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      default:
        return langKey;
    }
  };

  const handleVisualizeFlow = async () => {
    try {
      setIsVisualizing(true);
      const mappedLang = getCodeVisLanguage(selectedLang);
      let resultData: FlowchartData | null = null;

      try {
        const response = await fetch(
          "https://codevis-backend.onrender.com/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lang: mappedLang,
              code: code,
            }),
          }
        );

        if (response.ok) {
          resultData = await response.json();
        }
      } catch (netErr) {
        console.warn(
          "Remote CodeVis API unreachable, falling back to local AST engine:",
          netErr instanceof Error ? netErr.message : String(netErr)
        );
      }

      if (!resultData || !resultData.nodes || resultData.nodes.length === 0) {
        resultData = generateAstFlowchart(code, mappedLang);
      }

      if (resultData && resultData.nodes && resultData.nodes.length > 0) {
        setFlowchartData(resultData);
        setMobileFlowchartOpen(true);
      } else {
        toast.error("Flowchart generation failed. Check your code syntax.");
      }
    } catch (err) {
      console.warn(
        "Flowchart generation error:",
        err instanceof Error ? err.message : String(err)
      );
      toast.error("Flowchart generation failed. Check your code syntax.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleCloseFlowchart = () => {
    if (editorRef.current && decorationsRef.current.length > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        []
      );
    }
    setFlowchartData(null);
  };

  const handleNodeClick = (node: FlowchartNode) => {
    const startLine =
      node.startLine ?? node.line ?? (node.lines && node.lines[0]);
    const endLine =
      node.endLine ?? node.line ?? (node.lines && node.lines[node.lines.length - 1]) ?? startLine;

    if (startLine && editorRef.current && monacoRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monacoRef.current.Range(
              startLine,
              1,
              endLine || startLine,
              1
            ),
            options: {
              isWholeLine: true,
              className: "codevis-highlight",
            },
          },
        ]
      );
      editorRef.current.revealLineInCenter(startLine);
    }
  };

  // Load problem details and code snippets, then override with saved code
  const loadProblemSnippets = useCallback(async () => {
    try {
      setLoadingSnippets(true);

      // Load snippets and saved solutions in parallel
      const [problemData, solutions] = await Promise.all([
        dsaApi.getProblemDetails(problemSlug),
        dsaApi.getSolutionHistory(problemId).catch(() => []),
      ]);

      const snippets: Record<string, string> = {};
      problemData.codeSnippets?.forEach((snippet: { langSlug: string; code: string }) => {
        const langKey = Object.keys(LANGUAGES).find(
          (key) => LANGUAGES[key].leetcodeLang === snippet.langSlug,
        );
        if (langKey) {
          snippets[langKey] = snippet.code;
        }
      });
      setCodeSnippets(snippets);

      // Build a map of latest saved code per language
      const saved: Record<string, string> = {};
      if (Array.isArray(solutions)) {
        for (const sol of solutions) {
          const langKey = Object.keys(LANGUAGES).find(
            (key) => LANGUAGES[key].leetcodeLang === sol.language,
          );
          if (langKey && !saved[langKey]) {
            saved[langKey] = sol.code;
          }
        }
      }
      setSavedCode(saved);

      // Prefer saved code, fall back to snippet
      if (saved[selectedLang]) {
        setCode(saved[selectedLang]);
      } else if (snippets[selectedLang]) {
        setCode(snippets[selectedLang]);
      }
    } catch (error) {
      console.error("Failed to load problem snippets:", error);
    } finally {
      setLoadingSnippets(false);
    }
  }, [problemSlug, problemId, selectedLang]);

  useEffect(() => {
    loadProblemSnippets();
  }, [loadProblemSnippets]);

  useEffect(() => {
    let mounted = true;
    const refreshHealth = async () => {
      const health = await getExtensionHealth();
      if (!mounted) return;
      setExtensionHealth(health.state);
    };
    refreshHealth();
    const timer = window.setInterval(refreshHealth, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    // Prefer saved code for this language, then snippet
    if (savedCode[lang]) {
      setCode(savedCode[lang]);
    } else if (codeSnippets[lang]) {
      setCode(codeSnippets[lang]);
    }
    setEvaluation(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setEvaluation(null);
    setLeetcodeSubmission(null);
    setSubmitPath("IDLE");

    const langConfig = LANGUAGES[selectedLang];

    // LeetCode's judge is the source of truth; the AI review runs alongside it
    // (previously a false negative from the AI blocked the real submission).
    const leetcodePromise =
      extensionHealth === "READY"
        ? submitViaExtension({
            problemSlug,
            code,
            language: langConfig.leetcodeLang,
            timeoutMs: 60_000,
          })
            .then((r) => {
              setSubmitPath("EXTENSION");
              const state: LeetCodeSubmissionState = {
                verdict: r.verdict,
                accepted: r.accepted,
                details: r.details,
                runtime: r.runtime,
                memory: r.memory,
                runtimePercentile: r.runtimePercentile,
                memoryPercentile: r.memoryPercentile,
                totalCorrect: r.totalCorrect,
                totalTestcases: r.totalTestcases,
              };
              setLeetcodeSubmission(state);
              if (r.accepted) toast.success(`Accepted on LeetCode${r.runtime ? ` · ${r.runtime}` : ""}`);
              else toast.error(`LeetCode: ${r.verdict}`);
              return state;
            })
            .catch((err: unknown) => {
              setSubmitPath("UNAVAILABLE");
              const message = err instanceof Error ? err.message : String(err);
              const state: LeetCodeSubmissionState = {
                verdict: "SUBMIT_FAILED",
                accepted: false,
                details: /timed out/i.test(message)
                  ? "The extension didn't answer. Make sure it's enabled, then refresh this page."
                  : message,
              };
              setLeetcodeSubmission(state);
              return state;
            })
        : Promise.resolve<LeetCodeSubmissionState | null>(null);

    const evaluationPromise = dsaApi
      .evaluateCode(problemId, code, langConfig.leetcodeLang)
      .then((r) => {
        setEvaluation(r.evaluation);
        return r.evaluation as EvaluationResult;
      })
      .catch((error: unknown) => {
        const errObj = error as { message?: string; response?: { data?: { error?: string } } };
        console.error("Evaluation error:", error);
        const fallback: EvaluationResult = {
          isCorrect: false,
          verdict: "RUNTIME_ERROR",
          verdictMessage:
            errObj.response?.data?.error || errObj.message || "AI review unavailable. Please try again.",
          score: 0,
          complexity: { time: "N/A", timeExplanation: "", space: "N/A", spaceExplanation: "" },
          optimalComplexity: { time: "N/A", space: "N/A", isCurrentOptimal: false, explanation: "" },
          betterApproaches: [],
          edgeCases: [],
          feedback: "",
        };
        setEvaluation(fallback);
        return null;
      });

    try {
      const [leet, evalResult] = await Promise.all([leetcodePromise, evaluationPromise]);
      const accepted = leet?.accepted ?? false;
      const isCorrect = accepted || Boolean(evalResult?.isCorrect);

      try {
        await dsaApi.saveSolution({
          problemId,
          code,
          language: langConfig.leetcodeLang,
          isCorrect,
          score: evalResult?.score ?? (accepted ? 100 : 0),
          verdict: accepted ? "ACCEPTED" : evalResult?.verdict || leet?.verdict || "UNKNOWN",
          timeComplexity: evalResult?.complexity?.time || null,
          spaceComplexity: evalResult?.complexity?.space || null,
          isOptimal: evalResult?.optimalComplexity?.isCurrentOptimal || false,
        });
        setSavedCode((prev) => ({ ...prev, [selectedLang]: code }));
      } catch (saveErr) {
        console.error("Failed to save solution:", saveErr);
      }

      // The extension already reported the accepted submission to the API.
      if (accepted && onSubmissionSuccess) {
        const duration = Math.round((Date.now() - startTime) / 60000);
        onSubmissionSuccess(Math.max(1, duration));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "ACCEPTED":
        return "text-green-400";
      case "WRONG_ANSWER":
        return "text-red-400";
      case "TIME_LIMIT_EXCEEDED":
        return "text-yellow-400";
      case "COMPILATION_ERROR":
      case "RUNTIME_ERROR":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case "ACCEPTED":
        return "bg-green-500/10 border-green-500/20";
      case "WRONG_ANSWER":
        return "bg-red-500/10 border-red-500/20";
      case "TIME_LIMIT_EXCEEDED":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "COMPILATION_ERROR":
      case "RUNTIME_ERROR":
        return "bg-orange-500/10 border-orange-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "ACCEPTED":
        return <CheckCircle2 size={24} />;
      case "WRONG_ANSWER":
        return <XCircle size={24} />;
      case "TIME_LIMIT_EXCEEDED":
        return <Clock size={24} />;
      default:
        return <AlertCircle size={24} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-400";
    if (score >= 50) return "stroke-yellow-400";
    return "stroke-red-400";
  };

  if (loadingSnippets) {
    return (
      <div className="flex items-center justify-center h-150 bg-[var(--bg-secondary)] rounded-3xl border border-white/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-white" size={32} />
          <p className="text-gray-400 text-sm">Loading code templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-[var(--bg-secondary)] rounded-3xl border border-white/10 overflow-hidden relative">
      {/* Accessible skip link pair */}
      <a
        href="#monaco-code-editor"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-black text-xs font-bold shadow-lg"
      >
        Skip to code editor
      </a>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {Object.entries(LANGUAGES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleLanguageChange(key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedLang === key
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
              >
                {config.label}
              </button>
            ))}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${submitPath === "EXTENSION"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : extensionHealth === "READY"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-gray-600/40 bg-gray-700/20 text-gray-300"
              }`}
          >
            {submitPath === "EXTENSION"
              ? "Extension: Connected"
              : extensionHealth === "READY"
                ? "Extension: Connected"
                : "Extension: Unavailable"}
          </div>
        </div>

        <div id="editor-controls" className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleVisualizeFlow}
            disabled={isVisualizing}
            className="flex gap-2 items-center px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
            title="Generate visual control flow diagram using CodeVis"
          >
            {isVisualizing ? (
              <>
                <Loader2 size={15} className="animate-spin text-cyan-400" />
                <span>Visualizing...</span>
              </>
            ) : (
              <>
                <Workflow size={15} />
                <span>🔀 Visualize Flow</span>
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex gap-2 items-center bg-linear-to-r from-violet-500 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play size={16} />
                Submit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Flowchart Arena */}
      <div
        role="region"
        aria-label="Code Editor Region"
        className={`flex flex-col md:flex-row overflow-hidden border-b border-white/5 transition-all relative ${
          flowchartData ? "md:h-140" : "h-125"
        }`}
      >
        {/* Editor Container */}
        <div
          id="monaco-code-editor"
          tabIndex={-1}
          className={`h-full overflow-hidden transition-all relative ${
            flowchartData
              ? "w-full md:w-1/2 h-100 md:h-full border-b md:border-b-0 md:border-r border-white/10"
              : "w-full h-full"
          }`}
        >
          <a
            href="#editor-controls"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-white/20 text-white text-xs font-bold"
          >
            Skip code editor
          </a>
          <Editor
            height="100%"
            theme="vs-dark"
            language={LANGUAGES[selectedLang].monacoLang}
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
            }}
            options={{
              accessibilitySupport: "auto",
              ariaLabel: "Code Editor text area",
              minimap: { enabled: !flowchartData },
              fontSize: flowchartData ? 13 : 14,
              fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: true,
              lineNumbers: "on",
              automaticLayout: true,
              tabSize: selectedLang === "python3" ? 4 : 2,
            }}
          />
        </div>

        {/* Desktop Flowchart Panel (>= 768px) */}
        {flowchartData && (
          <div className="hidden md:block md:w-1/2 h-full overflow-hidden">
            <FlowchartPanel
              data={flowchartData}
              onClose={handleCloseFlowchart}
              onNodeClick={handleNodeClick}
            />
          </div>
        )}
      </div>

      {/* Mobile Flowchart Accordion (< 768px) */}
      {flowchartData && (
        <div className="md:hidden flex flex-col border-b border-white/10 bg-[var(--bg-secondary)]">
          <button
            type="button"
            onClick={() => setMobileFlowchartOpen(!mobileFlowchartOpen)}
            className="flex items-center justify-between px-5 py-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <Workflow size={15} />
              <span>🔀 Control Flow Diagram</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-normal">
                {mobileFlowchartOpen ? "Tap to collapse" : "Tap to expand"}
              </span>
              {mobileFlowchartOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </button>

          {mobileFlowchartOpen && (
            <div className="h-105 overflow-hidden border-t border-white/10">
              <FlowchartPanel
                data={flowchartData}
                onClose={handleCloseFlowchart}
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab Key & Keyboard Navigation Accessibility Note */}
      <div className="px-5 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
        <span>Keyboard: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Ctrl+M</kbd> inside editor to toggle Tab key focus trap.</span>
        <span className="hidden sm:inline">Use Tab / Shift+Tab to navigate controls</span>
      </div>

      {/* Evaluation Result */}
      {evaluation && (
        <div className="border-t border-white/5 shrink-0">
          {/* Verdict Header */}
          <div
            className={`px-6 py-4 ${getVerdictBg(evaluation.verdict)} border-b border-white/5`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={getVerdictColor(evaluation.verdict)}>
                  {getVerdictIcon(evaluation.verdict)}
                </div>
                <div>
                  <div
                    className={`font-bold text-lg ${getVerdictColor(evaluation.verdict)}`}
                  >
                    {evaluation.verdict.replace(/_/g, " ")}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {evaluation.verdictMessage}
                  </div>
                </div>
              </div>

              {/* Score Circle */}
              {evaluation.score > 0 && (
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white/10"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(evaluation.score / 100) * 150.8} 150.8`}
                      className={getScoreRingColor(evaluation.score)}
                    />
                  </svg>
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(evaluation.score)}`}
                  >
                    {evaluation.score}
                  </div>
                </div>
              )}
            </div>

            {evaluation.feedback && (
              <div className="mt-3 text-sm text-gray-300 italic bg-white/5 px-4 py-2 rounded-lg">
                {evaluation.feedback}
              </div>
            )}
          </div>

          {leetcodeSubmission && (
            <div
              className={`px-6 py-4 border-b border-[var(--border-subtle)] text-sm ${
                leetcodeSubmission.accepted ? "bg-emerald-500/[0.06]" : "bg-red-500/[0.05]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  LeetCode judge
                </span>
                <span
                  className={`font-bold ${leetcodeSubmission.accepted ? "text-emerald-400" : "text-red-400"}`}
                >
                  {leetcodeSubmission.verdict}
                </span>
                {leetcodeSubmission.totalTestcases ? (
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {leetcodeSubmission.totalCorrect ?? 0}/{leetcodeSubmission.totalTestcases} tests
                  </span>
                ) : null}
              </div>
              {leetcodeSubmission.accepted && (leetcodeSubmission.runtime || leetcodeSubmission.memory) && (
                <div className="mt-3 grid grid-cols-2 gap-3 max-w-md">
                  {[
                    { label: "Runtime", value: leetcodeSubmission.runtime, pct: leetcodeSubmission.runtimePercentile },
                    { label: "Memory", value: leetcodeSubmission.memory, pct: leetcodeSubmission.memoryPercentile },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{m.label}</div>
                      <div className="font-mono font-bold text-[var(--text-primary)]">{m.value ?? "—"}</div>
                      {typeof m.pct === "number" && (
                        <>
                          <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--accent-primary)]"
                              style={{ width: `${Math.min(100, Math.max(0, m.pct))}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] text-[var(--text-muted)]">beats {m.pct.toFixed(1)}%</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {leetcodeSubmission.details ? (
                <pre className="mt-3 text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 max-h-48 overflow-auto">
                  {leetcodeSubmission.details}
                </pre>
              ) : null}
            </div>
          )}

          {/* Failing Test Case */}
          {evaluation.failingCase && evaluation.failingCase.input && (
            <div className="px-6 py-4 border-b border-white/5 bg-red-500/5">
              <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                <XCircle size={14} /> Failing Test Case
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="text-gray-500 mb-1">Input</div>
                  <pre className="text-gray-200 whitespace-pre-wrap">
                    {evaluation.failingCase.input}
                  </pre>
                </div>
                {evaluation.failingCase.expected && (
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-gray-500 mb-1">Expected</div>
                    <pre className="text-green-400 whitespace-pre-wrap">
                      {evaluation.failingCase.expected}
                    </pre>
                  </div>
                )}
                {evaluation.failingCase.actual && (
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-gray-500 mb-1">Your Output</div>
                    <pre className="text-red-400 whitespace-pre-wrap">
                      {evaluation.failingCase.actual}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complexity Analysis */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Complexity */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-blue-400" /> Your Complexity
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Time</span>
                    <span className="text-white font-mono text-sm font-bold">
                      {evaluation.complexity.time}
                    </span>
                  </div>
                  {evaluation.complexity.timeExplanation && (
                    <p className="text-gray-500 text-xs">
                      {evaluation.complexity.timeExplanation}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400 text-xs">Space</span>
                    <span className="text-white font-mono text-sm font-bold">
                      {evaluation.complexity.space}
                    </span>
                  </div>
                  {evaluation.complexity.spaceExplanation && (
                    <p className="text-gray-500 text-xs">
                      {evaluation.complexity.spaceExplanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Optimal Complexity */}
              <div
                className={`rounded-xl p-4 ${evaluation.optimalComplexity.isCurrentOptimal ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}
              >
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Target
                    size={14}
                    className={
                      evaluation.optimalComplexity.isCurrentOptimal
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  />
                  Optimal Complexity
                  {evaluation.optimalComplexity.isCurrentOptimal && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Your solution is optimal!
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Time</span>
                    <span className="text-white font-mono text-sm font-bold">
                      {evaluation.optimalComplexity.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Space</span>
                    <span className="text-white font-mono text-sm font-bold">
                      {evaluation.optimalComplexity.space}
                    </span>
                  </div>
                  {!evaluation.optimalComplexity.isCurrentOptimal &&
                    evaluation.optimalComplexity.explanation && (
                      <p className="text-yellow-300/70 text-xs mt-2">
                        {evaluation.optimalComplexity.explanation}
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Better Approaches */}
          {evaluation.betterApproaches &&
            evaluation.betterApproaches.length > 0 && (
              <div className="border-b border-white/5">
                <button
                  onClick={() => setShowApproaches(!showApproaches)}
                  className="w-full px-6 py-3 flex items-center justify-between text-sm font-bold text-white hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-yellow-400" />
                    Better Approaches ({evaluation.betterApproaches.length})
                  </span>
                  {showApproaches ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {showApproaches && (
                  <div className="px-6 pb-4 space-y-3">
                    {evaluation.betterApproaches.map((approach, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-bold text-purple-300">
                            {approach.name}
                          </h5>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-400 font-mono">
                              {approach.timeComplexity}
                            </span>
                            <span className="text-blue-400 font-mono">
                              {approach.spaceComplexity}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">
                          {approach.description}
                        </p>
                        {approach.pseudocode && (
                          <pre className="bg-black/30 p-3 rounded-lg text-xs text-gray-300 overflow-auto whitespace-pre-wrap font-mono">
                            {approach.pseudocode}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Edge Cases */}
          {evaluation.edgeCases && evaluation.edgeCases.length > 0 && (
            <div className="border-b border-white/5">
              <button
                onClick={() => setShowEdgeCases(!showEdgeCases)}
                className="w-full px-6 py-3 flex items-center justify-between text-sm font-bold text-white hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  Edge Cases ({evaluation.edgeCases.length})
                </span>
                {showEdgeCases ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {showEdgeCases && (
                <div className="px-6 pb-4">
                  <div className="space-y-2">
                    {evaluation.edgeCases.map((ec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm"
                      >
                        {ec.handled ? (
                          <CheckCircle2
                            size={14}
                            className="text-green-400 shrink-0"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            className="text-red-400 shrink-0"
                          />
                        )}
                        <span
                          className={
                            ec.handled ? "text-gray-300" : "text-red-300"
                          }
                        >
                          {ec.case}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${ec.handled ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          {ec.handled ? "Handled" : "Not Handled"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
