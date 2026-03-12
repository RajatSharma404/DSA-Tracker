"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { dsaApi } from "@/lib/api";

interface LeetCodeEditorProps {
  problemSlug: string;
  problemTitle: string;
  problemId: string;
  onSubmissionSuccess?: () => void;
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

export function LeetCodeEditor({
  problemSlug,
  problemTitle,
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
      problemData.codeSnippets?.forEach((snippet: any) => {
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
    setIsSubmitting(true);
    setEvaluation(null);

    try {
      const langConfig = LANGUAGES[selectedLang];
      const result = await dsaApi.evaluateCode(
        problemId,
        code,
        langConfig.leetcodeLang,
      );

      const evalResult = result.evaluation;
      setEvaluation(evalResult);

      // Save solution to backend
      try {
        await dsaApi.saveSolution({
          problemId,
          code,
          language: langConfig.leetcodeLang,
          isCorrect: evalResult?.isCorrect || false,
          score: evalResult?.score || 0,
          verdict: evalResult?.verdict || "UNKNOWN",
          timeComplexity: evalResult?.complexity?.time || null,
          spaceComplexity: evalResult?.complexity?.space || null,
          isOptimal: evalResult?.optimalComplexity?.isCurrentOptimal || false,
        });
        // Update local saved code cache
        setSavedCode((prev) => ({ ...prev, [selectedLang]: code }));
      } catch (saveErr) {
        console.error("Failed to save solution:", saveErr);
      }

      if (evalResult?.isCorrect && onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (error: any) {
      console.error("Evaluation error:", error);
      setEvaluation({
        isCorrect: false,
        verdict: "RUNTIME_ERROR",
        verdictMessage:
          error.response?.data?.error ||
          "Failed to evaluate code. Please try again.",
        score: 0,
        complexity: {
          time: "N/A",
          timeExplanation: "",
          space: "N/A",
          spaceExplanation: "",
        },
        optimalComplexity: {
          time: "N/A",
          space: "N/A",
          isCurrentOptimal: false,
          explanation: "",
        },
        betterApproaches: [],
        edgeCases: [],
        feedback: "",
      });
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
      <div className="flex items-center justify-center h-150 bg-[#0a0a0a] rounded-3xl border border-white/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-white" size={32} />
          <p className="text-gray-400 text-sm">Loading code templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {Object.entries(LANGUAGES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleLanguageChange(key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedLang === key
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex gap-2 items-center bg-linear-to-r from-violet-500 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
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

      {/* Editor */}
      <div className="h-125 overflow-hidden">
        <Editor
          height="100%"
          theme="vs-dark"
          language={LANGUAGES[selectedLang].monacoLang}
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
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
