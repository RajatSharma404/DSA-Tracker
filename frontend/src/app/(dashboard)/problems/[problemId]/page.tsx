"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { dsaApi, Problem } from "@/lib/api";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  BookOpen,
  Code2,
  TrendingUp,
  Timer,
  Focus,
  CheckCircle2,
  Activity,
  Keyboard,
  Minimize2,
  Maximize2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { soundEffects } from "@/lib/soundEffects";

const LeetCodeEditor = dynamic(
  () =>
    import("@/components/dashboard/LeetCodeEditor").then(
      (mod) => mod.LeetCodeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-104 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

const AIMentorHint = dynamic(
  () => import("@/components/dashboard/AIMentorHint"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

const AICodeArchitect = dynamic(
  () => import("@/components/dashboard/AICodeArchitect"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

const ProblemNotes = dynamic(
  () => import("@/components/dashboard/ProblemNotes"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

const SolutionHistory = dynamic(
  () =>
    import("@/components/dashboard/SolutionHistory").then(
      (mod) => mod.SolutionHistory,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

const AlgoTracer = dynamic(
  () => import("@/features/algo-tracer").then((mod) => mod.AlgoTracer),
  {
    ssr: false,
    loading: () => (
      <div className="h-120 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] font-mono text-xs">
        Loading AlgoTracer 2.0 Engine...
      </div>
    ),
  },
);

export default function ProblemSolvePage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params?.problemId as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "solve" | "hints" | "architect" | "notes" | "trace"
  >("solve");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<{
    submittedAt: string;
    timeSpent: number;
  } | null>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 1000)),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (problemId) {
      loadProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // Global Keyboard Shortcuts (Escape to toggle focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
        soundEffects.playToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (event: MouseEvent) => {
      if (!splitContainerRef.current) return;

      const rect = splitContainerRef.current.getBoundingClientRect();
      const nextLeftPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(30, Math.min(70, nextLeftPercent));
      setLeftPanelWidth(clamped);
    };

    const handleUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizing]);

  const loadProblem = async () => {
    try {
      setLoading(true);

      const problemData = await dsaApi.getProblem(problemId);
      setProblem(problemData);

      if (problemData.link) {
        const slug = extractSlugFromLink(problemData.link);
        if (slug) {
          const details = await dsaApi.getProblemDetails(slug);
          setProblemDetails(details);
        }
      }
    } catch (error) {
      console.error("Failed to load problem:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractSlugFromLink = (link: string): string | null => {
    const match = link.match(/leetcode\.com\/problems\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const handleSubmissionSuccess = async (timeSpent: number) => {
    if (problem) {
      soundEffects.playSuccess();
      const previousStatus = problem.status;
      setProblem((prev) => (prev ? { ...prev, status: "DONE" as any } : null));
      const submittedAt = new Date().toISOString();
      setLastSubmission({ submittedAt, timeSpent });
      trackEvent("problem_submitted", {
        problemId: problem.id,
        timeSpent,
        focusMode,
      });

      try {
        await dsaApi.updateProgress(problem.id, "DONE", timeSpent);
      } catch (err) {
        console.error("Failed to save submission progress:", err);
        setProblem((prev) => (prev ? { ...prev, status: previousStatus } : null));
      }
    }
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "HARD":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-[var(--text-muted)] bg-[var(--bg-secondary)] border-[var(--border-subtle)]";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-80 rounded-xl bg-[var(--bg-secondary)]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[75vh] rounded-4xl bg-[var(--bg-secondary)]" />
          <div className="h-[75vh] rounded-4xl bg-[var(--bg-secondary)]" />
        </div>
      </div>
    );
  }

  if (!problem || !problemDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
        <p className="text-[var(--text-muted)] font-medium">
          Problem not found or LeetCode link missing
        </p>
        <Link
          href="/topics"
          className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-xs uppercase tracking-wider"
        >
          ← Back to Topics
        </Link>
      </div>
    );
  }

  const problemSlug = extractSlugFromLink(problem.link || "");

  return (
    <div className="h-full flex flex-col w-full min-w-0">
      {/* Header Bar */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-4">
        <div className="max-w-450 mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                soundEffects.playClick();
                router.back();
              }}
              aria-label="Go back"
              className="p-2 hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl transition-colors cursor-pointer border border-[var(--border-subtle)]"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">
                  {problem.title}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono ${getDifficultyColor(
                    problem.difficulty,
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {problemDetails.topicTags
                  ?.map((tag: any) => tag.name)
                  .join(", ")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto font-mono">
            <div className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
              <Timer size={12} className="text-[var(--accent-primary)]" />
              <span>Session {formatElapsed(elapsedSeconds)}</span>
            </div>

            <Link
              href="/tracer"
              onClick={() => soundEffects.playClick()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] transition-colors text-xs font-bold font-mono"
            >
              <Activity size={14} />
              <span>Open in Tracer</span>
            </Link>

            <button
              onClick={() => {
                soundEffects.playToggle();
                const next = !focusMode;
                setFocusMode(next);
                if (next) {
                  setActiveTab("solve");
                  trackEvent("problem_focus_mode_enabled", { problemId });
                }
              }}
              aria-pressed={focusMode}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-xs font-bold border cursor-pointer ${
                focusMode
                  ? "bg-[var(--accent-primary)] text-black border-[var(--accent-primary)] shadow-md"
                  : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
              }`}
            >
              {focusMode ? <Minimize2 size={14} /> : <Focus size={14} />}
              <span>{focusMode ? "Exit Focus" : "Focus Mode"}</span>
            </button>

            {problem.link && (
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open problem on LeetCode"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl border border-[var(--border-subtle)] transition-colors text-xs font-bold"
              >
                <ExternalLink size={13} />
                <span>LeetCode</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split Arena */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={splitContainerRef}
          className={`h-full max-w-450 mx-auto flex flex-col lg:flex-row gap-0 ${
            isResizing ? "select-none" : ""
          }`}
        >
          {/* Left Panel - Problem Description */}
          {!focusMode && (
            <div
              className="h-full overflow-y-auto p-6 space-y-6"
              style={{ width: `calc(${leftPanelWidth}% - 2px)` }}
            >
              <div
                className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: problemDetails.content }}
              />
            </div>
          )}

          {!focusMode && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize problem and editor panels"
              onMouseDown={() => setIsResizing(true)}
              className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-[var(--border-subtle)] hover:bg-[var(--accent-primary)] active:bg-[var(--accent-primary)] transition-colors"
            />
          )}

          {/* Right Panel - Code Editor & Tools */}
          <div
            className="h-full overflow-y-auto p-6 space-y-6 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)]"
            style={
              focusMode
                ? { width: "100%" }
                : { width: `calc(${100 - leftPanelWidth}% - 2px)` }
            }
          >
            {/* Tab Navigation */}
            {!focusMode && (
              <div
                role="tablist"
                aria-label="Problem workspace tabs"
                className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-4"
              >
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("solve");
                  }}
                  role="tab"
                  aria-selected={activeTab === "solve"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "solve"
                      ? "bg-[var(--accent-primary)] text-black shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <Code2 size={15} />
                  <span>Code Editor</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("trace");
                  }}
                  role="tab"
                  aria-selected={activeTab === "trace"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "trace"
                      ? "bg-cyan-500 text-black font-bold shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <Activity size={15} />
                  <span>AlgoTracer 2.0</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("hints");
                  }}
                  role="tab"
                  aria-selected={activeTab === "hints"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "hints"
                      ? "bg-[var(--accent-primary)] text-black shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <Sparkles size={15} />
                  <span>AI Hints</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("architect")}
                  }
                  role="tab"
                  aria-selected={activeTab === "architect"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "architect"
                      ? "bg-[var(--accent-primary)] text-black shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <TrendingUp size={15} />
                  <span>Code Review</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveTab("notes");
                  }}
                  role="tab"
                  aria-selected={activeTab === "notes"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-[var(--accent-primary)] text-black shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Notes</span>
                </button>
              </div>
            )}

            {focusMode && (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                  Zen Focus Session
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Distraction-free coding mode is active. Session elapsed:{" "}
                  {formatElapsed(elapsedSeconds)}. Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs">Esc</kbd> to exit.
                </p>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === "solve" && problemSlug && (
              <>
                <LeetCodeEditor
                  problemSlug={problemSlug}
                  problemTitle={problem.title}
                  problemId={problem.id}
                  onSubmissionSuccess={handleSubmissionSuccess}
                />
                <div className="mt-6">
                  <SolutionHistory problemId={problem.id} />
                </div>
                {lastSubmission && (
                  <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <CheckCircle2 size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest font-mono">
                        Submission Logged
                      </p>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Nice work. You completed this attempt in about{" "}
                      {lastSubmission.timeSpent} minutes.
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Next best move: review one due problem in spaced repetition, then attempt a weakness-targeted challenge.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/review"
                        onClick={() => soundEffects.playClick()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
                      >
                        Open Review Queue
                      </Link>
                      <Link
                        href="/recommendations"
                        onClick={() => soundEffects.playClick()}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        Practice Weak Topic
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "trace" && (
              <div className="pt-2">
                <AlgoTracer problemId={problem.id} />
              </div>
            )}

            {activeTab === "hints" && (
              <AIMentorHint
                problemId={problem.id}
                problemTitle={problem.title}
              />
            )}

            {activeTab === "architect" && (
              <AICodeArchitect
                problemId={problem.id}
                problemTitle={problem.title}
              />
            )}

            {activeTab === "notes" && <ProblemNotes problemId={problem.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
