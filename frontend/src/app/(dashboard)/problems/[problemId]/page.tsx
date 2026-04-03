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
} from "lucide-react";
import Link from "next/link";

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
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmissionSuccess = async () => {
    if (problem) {
      await dsaApi.updateProgress(problem.id, "DONE", 0);
    }
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
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
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
        <div className="max-w-450 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
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
          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              <ExternalLink size={16} />
              View on LeetCode
            </a>
          )}
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
          <div
            className="h-full overflow-y-auto p-6 space-y-6"
            style={{ width: `calc(${leftPanelWidth}% - 2px)` }}
          >
            <div
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: problemDetails.content }}
            />
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize problem and editor panels"
            onMouseDown={() => setIsResizing(true)}
            className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-white/10 hover:bg-blue-500/40 active:bg-blue-500/60 transition-colors"
          />

          {/* Right Panel - Code Editor & Tools */}
          <div
            className="h-full overflow-y-auto p-6 space-y-6 border-t lg:border-t-0 lg:border-l border-white/10"
            style={{ width: `calc(${100 - leftPanelWidth}% - 2px)` }}
          >
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("solve")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "notes"
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                <BookOpen size={16} />
                Notes
              </button>
            </div>

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
