"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { dsaApi, Problem } from "@/lib/api";
import { useFeature } from "@/components/providers/FeaturesProvider";
import {
  ArrowLeft,
  ExternalLink,
  Timer,
  Focus,
  CheckCircle2,
  Keyboard,
  Minimize2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { soundEffects } from "@/lib/soundEffects";
import { sanitizeHtml } from "@/lib/sanitize";

interface LeetCodeProblemDetails {
  questionId?: string;
  title?: string;
  content?: string;
  topicTags?: Array<{ name: string; slug?: string }>;
  codeSnippets?: Array<{ lang: string; langSlug: string; code: string }>;
  sampleTestCase?: string;
  hints?: string[];
  stats?: string;
  similarQuestions?: string;
  solution?: { id: string; canSeeDetail: boolean; paidOnly: boolean; hasVideoSolution: boolean };
}

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

const WhyDidIForgetModal = dynamic(
  () => import("@/components/dashboard/WhyDidIForgetModal"),
  { ssr: false }
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
  const isTracerEnabled = useFeature("algotracer");
  const problemId = params?.problemId as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<LeetCodeProblemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const [showForgotModal, setShowForgotModal] = useState(false);
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
      setErrorMessage(null);

      const problemData = await dsaApi.getProblem(problemId);
      setProblem(problemData);

      if (problemData.link) {
        const slug = extractSlugFromLink(problemData.link);
        if (slug) {
          const details = await dsaApi.getProblemDetails(slug);
          setProblemDetails(details);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to load problem:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage(
          (error.response.data as { error?: string })?.error ||
            "This problem belongs to a locked floor. Complete the previous floor to unlock it.",
        );
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage("Problem not found.");
      } else {
        setErrorMessage("Failed to load problem details. Please try again.");
      }
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
      setProblem((prev) => (prev ? { ...prev, status: "DONE" } : null));
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
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <ShieldAlert size={32} />
        </div>
        <p className="text-[var(--text-primary)] font-semibold text-base">
          {errorMessage || "Problem not found or LeetCode link missing"}
        </p>
        <Link
          href="/topics"
          className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          ← Back to Topics
        </Link>
      </div>
    );
  }

  const problemSlug = extractSlugFromLink(problem.link || "");

  return (
    <div className="h-full flex flex-col w-full min-w-0">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] px-5 py-3">
        <div className="mx-auto flex max-w-450 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">{problem.title}</h1>
                <span className={`text-xs font-medium ${
                  problem.difficulty === "EASY" ? "text-emerald-500" : problem.difficulty === "HARD" ? "text-rose-500" : "text-amber-500"
                }`}>
                  {problem.difficulty[0] + problem.difficulty.slice(1).toLowerCase()}
                </span>
              </div>
              {problemDetails?.topicTags?.length ? (
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {problemDetails.topicTags.map((tag) => tag.name).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[13px]">
            <span className="mr-2 flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)] tabular" title="Time on this problem">
              <Timer size={13} /> {formatElapsed(elapsedSeconds)}
            </span>
            <button
              onClick={() => setShowForgotModal(true)}
              className="rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="See why this problem slipped from memory"
            >
              Why did I forget?
            </button>
            {isTracerEnabled && (
              <Link href="/tracer" className="rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
                Tracer
              </Link>
            )}
            {problem.link && (
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                LeetCode <ExternalLink size={12} />
              </a>
            )}
            <button
              onClick={() => {
                const next = !focusMode;
                setFocusMode(next);
                if (next) {
                  setActiveTab("solve");
                  trackEvent("problem_focus_mode_enabled", { problemId });
                }
              }}
              aria-pressed={focusMode}
              title="Hide the description and tools"
              className={`ml-1 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 cursor-pointer ${
                focusMode
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                  : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {focusMode ? <Minimize2 size={13} /> : <Focus size={13} />}
              {focusMode ? "Exit focus" : "Focus"}
            </button>
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
                className="prose prose-sm prose-theme max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(problemDetails?.content || "<p>Loading problem description...</p>") }}
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
            {/* Tabs */}
            {!focusMode && (
              <div role="tablist" aria-label="Workspace" className="-mx-1 flex gap-5 overflow-x-auto border-b border-[var(--border-subtle)] px-1 no-scrollbar">
                {([
                  ["solve", "Code"],
                  ...(isTracerEnabled ? ([["trace", "Trace"]] as const) : []),
                  ["hints", "Hints"],
                  ["architect", "Review my code"],
                  ["notes", "Notes"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={activeTab === id}
                    onClick={() => setActiveTab(id as typeof activeTab)}
                    className={`-mb-px shrink-0 border-b-2 pb-2.5 text-sm transition-colors cursor-pointer ${
                      activeTab === id
                        ? "border-[var(--accent-primary)] font-medium text-[var(--text-primary)]"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {focusMode && (
              <p className="text-xs text-[var(--text-muted)]">
                Focus mode. Press <kbd className="rounded border border-[var(--border-subtle)] px-1 font-mono">Esc</kbd> to bring the description back.
              </p>
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

            {activeTab === "trace" && isTracerEnabled && (
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

      {showForgotModal && (
        <WhyDidIForgetModal
          problemId={problem.id}
          problemTitle={problem.title}
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </div>
  );
}
