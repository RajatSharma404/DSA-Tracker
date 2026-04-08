"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { dsaApi, Topic, Problem } from "@/lib/api";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Sparkles,
  Loader2,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDifficultyStyle } from "@/lib/design-tokens";

const AIMentorHint = dynamic(
  () => import("@/components/dashboard/AIMentorHint"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const AICodeArchitect = dynamic(
  () => import("@/components/dashboard/AICodeArchitect"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const ProblemNotes = dynamic(
  () => import("@/components/dashboard/ProblemNotes"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

const TopicStudyGuide = dynamic(
  () => import("@/components/dashboard/TopicStudyGuide"),
  {
    ssr: false,
    loading: () => (
      <div className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/3" />
    ),
  },
);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await dsaApi.getTopics();
        setTopics(data);
      } catch (err) {
        console.error("Failed to load topics", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-4 max-w-4xl space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-56 rounded-full bg-white/5" />
          <div className="h-4 w-96 max-w-full rounded-full bg-white/5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-2xl border border-white/5 bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in mt-4 fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">DSA Topics</h1>
        <p className="text-gray-400">
          Master these topics sequentially to build a strong foundation.
        </p>
      </div>

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <TopicAccordion
            key={topic.id}
            topic={topic}
            index={index}
            isExpanded={expandedTopic === topic.id}
            onToggle={() =>
              setExpandedTopic(expandedTopic === topic.id ? null : topic.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

function TopicAccordion({
  topic,
  index,
  isExpanded,
  onToggle,
}: {
  topic: Topic;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardTransform, setCardTransform] = useState(
    "perspective(2200px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
  );
  const [cardGlow, setCardGlow] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isExpanded && problems.length === 0) {
      setLoading(true);
      dsaApi
        .getTopicProblems(topic.id)
        .then(setProblems)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isExpanded, topic.id, problems.length]);

  const handleProgressUpdate = async (
    problemId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    // Optimistic UI update
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId ? { ...p, status: newStatus as any } : p,
      ),
    );

    try {
      await dsaApi.updateProgress(problemId, newStatus as any, 0);
    } catch (err) {
      console.error("Failed to update progress:", err);
      // Revert on error
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId ? { ...p, status: currentStatus as any } : p,
        ),
      );
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / rect.width) * 0.8;
    const rotateX = -((y - rect.height / 2) / rect.height) * 0.6;

    setCardTransform(
      `perspective(2200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`,
    );
    setCardGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const resetCardTilt = () => {
    setCardTransform(
      "perspective(2200px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    );
    setCardGlow({ x: 50, y: 50 });
  };

  return (
    <div
      onMouseMove={handleCardMouseMove}
      onMouseLeave={resetCardTilt}
      className="relative bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-all duration-300 will-change-transform"
      style={{
        transform: cardTransform,
        transformStyle: "flat",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at ${cardGlow.x}% ${cardGlow.y}%, rgba(96,165,250,0.04), transparent 34%)`,
        }}
      />
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} topic ${topic.name}`}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="relative z-10 flex items-center justify-between p-5 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#222] text-sm font-medium text-gray-400 shadow-inner shadow-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">{topic.name}</h3>
            {topic.description && (
              <p className="text-sm text-gray-400 mt-1">{topic.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-300">
              {topic.progressPercentage}%
            </span>
            <div className="w-24 h-1.5 bg-[#222] rounded-full mt-2 hidden sm:block">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${topic.progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-gray-500">
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="relative border-t border-[#222] bg-[#0a0a0a] p-2 sm:p-4 space-y-4 overflow-hidden min-w-0 animate-in fade-in duration-400">
          <div className="pointer-events-none absolute -top-20 -left-16 w-56 h-56 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 w-56 h-56 rounded-full bg-emerald-500/5 blur-3xl" />
          <TopicStudyGuide topicName={topic.name} />
          <TopicStrategy topicId={topic.id} />
          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm animate-pulse">
              Loading problems...
            </div>
          ) : (
            <div className="space-y-2">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={cn(
                    "relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-transparent transition-all transform-gpu hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.35)]",
                    problem.status === "DONE"
                      ? "bg-[#111]/50 opacity-70"
                      : "bg-[#111] hover:border-[#333]",
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_45%)]" />
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProgressUpdate(problem.id, problem.status);
                      }}
                      aria-label={
                        problem.status === "DONE"
                          ? "Mark as not done"
                          : "Mark as done"
                      }
                      className="mt-1 sm:mt-0 shrink-0 transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-lg"
                    >
                      {problem.status === "DONE" ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle
                          size={20}
                          className="text-gray-500 hover:text-white transition-colors"
                        />
                      )}
                    </button>
                    <div>
                      <span
                        className={cn(
                          "font-medium tracking-tight",
                          problem.status === "DONE" &&
                            "line-through text-gray-500",
                        )}
                      >
                        {problem.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium tracking-wide",
                            (() => {
                              const style = getDifficultyStyle(
                                problem.difficulty as
                                  | "EASY"
                                  | "MEDIUM"
                                  | "HARD",
                              );
                              return `${style.bg} ${style.text}`;
                            })(),
                          )}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.status === "DONE" && problem.timeSpent > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {problem.timeSpent}m
                          </span>
                        )}
                        {(problem as any).leetcodeRuntime && (
                          <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Sparkles size={10} className="text-yellow-400" />{" "}
                            {(problem as any).leetcodeRuntime}
                          </span>
                        )}
                        {(problem as any).leetcodeMemory && (
                          <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            ⬇️ {(problem as any).leetcodeMemory}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {problem.status !== "DONE" && (
                          <AIMentorHint
                            problemId={problem.id}
                            problemTitle={problem.title}
                          />
                        )}
                        <AICodeArchitect
                          problemId={problem.id}
                          problemTitle={problem.title}
                        />
                      </div>
                      <ProblemNotes problemId={problem.id} />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Link
                      href={`/problems/${problem.id}`}
                      className="flex items-center gap-1.5 text-sm text-white font-medium hover:text-white transition-colors bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      <Code2 size={14} />
                      Solve
                    </Link>
                    {problem.link && (
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open on LeetCode"
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                        title="Open in LeetCode"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopicStrategy({ topicId }: { topicId: string }) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStrategy = async () => {
    if (explanation) {
      setIsOpen(!isOpen);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await dsaApi.getPatternExplanation(topicId);
      setExplanation(res.explanation);
    } catch (err) {
      setExplanation("Failed to load strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={fetchStrategy}
        aria-expanded={isOpen}
        className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-lg"
      >
        <Sparkles size={14} />
        {isOpen
          ? "Hide Mentor Strategy"
          : "Show AI Mentor Strategy for this Topic"}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-in fade-in zoom-in-95">
          <div className="prose prose-invert prose-sm max-w-none">
            {loading ? (
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Analyzing patterns...
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-300 font-medium leading-relaxed">
                {explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
