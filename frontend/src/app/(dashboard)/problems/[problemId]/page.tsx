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
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const LeetCodeEditor = dynamic(
  () =>
    import("@/components/dashboard/LeetCodeEditor").then(
      (mod) => mod.LeetCodeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-104 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const AIMentorHint = dynamic(
  () => import("@/components/dashboard/AIMentorHint"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const AICodeArchitect = dynamic(
  () => import("@/components/dashboard/AICodeArchitect"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const ProblemNotes = dynamic(
  () => import("@/components/dashboard/ProblemNotes"),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
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
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
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
    "solve" | "hints" | "architect" | "notes"
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

      // Get problem from our database
      const problemData = await dsaApi.getProblem(problemId);
      setProblem(problemData);

      // Extract slug from LeetCode link
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
      await dsaApi.updateProgress(problem.id, "DONE", timeSpent);
      const submittedAt = new Date().toISOString();
      setLastSubmission({ submittedAt, timeSpent });
      trackEvent("problem_submitted", {
        problemId: problem.id,
        timeSpent,
        focusMode,
      });
    }
  };

  const elapsedMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
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
        return "text-green-400 bg-green-400/10";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-400/10";
      case "HARD":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-80 rounded-xl bg-white/8" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[75vh] rounded-4xl bg-white/6" />
          <div className="h-[75vh] rounded-4xl bg-white/6" />
        </div>
      </div>
    );
  }

  if (!problem || !problemDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">
          Problem not found or LeetCode link missing
        </p>
        <Link href="/topics" className="text-blue-400 hover:underline">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  const problemSlug = extractSlugFromLink(problem.link || "");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a] px-6 py-4">
        <div className="max-w-450 mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2 hover:bg-white/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{problem.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {problemDetails.topicTags
                  ?.map((tag: any) => tag.name)
                  .join(", ")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-2">
              <Timer size={12} />
              Session {formatElapsed(elapsedSeconds)}
            </div>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                focusMode
                  ? "bg-white text-black border-white"
                  : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <Focus size={16} />
              {focusMode ? "Focus On" : "Focus Mode"}
            </button>
            {problem.link && (
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open problem on LeetCode"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <ExternalLink size={16} />
                LeetCode
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                className="prose prose-invert prose-sm max-w-none"
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
              className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-white/10 hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors"
            />
          )}

          {/* Right Panel - Code Editor & Tools */}
          <div
            className="h-full overflow-y-auto p-6 space-y-6 border-t lg:border-t-0 lg:border-l border-white/10"
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
                className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
              >
                <button
                  onClick={() => setActiveTab("solve")}
                  role="tab"
                  aria-selected={activeTab === "solve"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    activeTab === "solve"
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Code2 size={16} />
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveTab("hints")}
                  role="tab"
                  aria-selected={activeTab === "hints"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    activeTab === "hints"
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Sparkles size={16} />
                  AI Hints
                </button>
                <button
                  onClick={() => setActiveTab("architect")}
                  role="tab"
                  aria-selected={activeTab === "architect"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    activeTab === "architect"
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <TrendingUp size={16} />
                  Code Review
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  role="tab"
                  aria-selected={activeTab === "notes"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                    activeTab === "notes"
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <BookOpen size={16} />
                  Notes
                </button>
              </div>
            )}

            {focusMode && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Focus Session
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Distraction-free coding mode is active. Session timer:{" "}
                  {formatElapsed(elapsedSeconds)}.
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
                  <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                    <div className="flex items-center gap-2 text-green-300 mb-1">
                      <CheckCircle2 size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Submission Logged
                      </p>
                    </div>
                    <p className="text-sm text-gray-200">
                      Nice work. You completed this attempt in about{" "}
                      {lastSubmission.timeSpent} minutes.
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Next best move: review one due problem, then attempt one
                      weakness-targeted problem.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/review"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                      >
                        Open Review Queue
                      </Link>
                      <Link
                        href="/recommendations"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                      >
                        Practice Weak Topic
                      </Link>
                    </div>
                  </div>
                )}
              </>
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
