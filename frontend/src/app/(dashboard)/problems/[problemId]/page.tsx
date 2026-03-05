"use client";

import React, { useEffect, useState } from "react";
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
import { LeetCodeEditor } from "@/components/dashboard/LeetCodeEditor";
import AIMentorHint from "@/components/dashboard/AIMentorHint";
import AICodeArchitect from "@/components/dashboard/AICodeArchitect";
import ProblemNotes from "@/components/dashboard/ProblemNotes";
import { SolutionHistory } from "@/components/dashboard/SolutionHistory";

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

  useEffect(() => {
    if (problemId) {
      loadProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

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
        <div className="h-full max-w-450 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-white/10">
          {/* Left Panel - Problem Description */}
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <div
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: problemDetails.content }}
            />
          </div>

          {/* Right Panel - Code Editor & Tools */}
          <div className="h-full overflow-y-auto p-6 space-y-6">
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
