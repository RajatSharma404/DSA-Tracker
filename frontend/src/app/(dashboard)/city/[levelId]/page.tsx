"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { dsaApi, Problem } from "@/lib/api";
import { getDifficultyStyle } from "@/lib/design-tokens";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Brain,
  ArrowLeft,
  BookOpen,
  Code2,
  Loader2,
  Lock,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronRight,
  Timer,
  TrendingUp,
  Layers3,
  Trophy,
} from "lucide-react";

const TopicStudyGuide = dynamic(
  () => import("@/components/dashboard/TopicStudyGuide"),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
    ),
  },
);

const LeetCodeEditor = dynamic(
  () =>
    import("@/components/dashboard/LeetCodeEditor").then(
      (mod) => mod.LeetCodeEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-112 animate-pulse rounded-3xl border border-white/5 bg-white/5" />
    ),
  },
);

const AIMentorHint = dynamic(
  () => import("@/components/dashboard/AIMentorHint"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
    ),
  },
);

const AICodeArchitect = dynamic(
  () => import("@/components/dashboard/AICodeArchitect"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
    ),
  },
);

const ProblemNotes = dynamic(
  () => import("@/components/dashboard/ProblemNotes"),
  {
    ssr: false,
    loading: () => (
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
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
      <div className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
    ),
  },
);

type CityLevelProgress = {
  id: string;
  name: string;
  isCompleted: boolean;
  progress: {
    easy: { solved: number; required: number; total: number };
    medium: { solved: number; required: number; total: number };
    hard: { solved: number; required: number; total: number };
  };
};

type ProblemDetails = {
  title?: string;
  difficulty?: string;
  topicTags?: Array<{ name: string }>;
  content?: string;
  exampleTestcases?: string;
  codeSnippets?: Array<{ langSlug: string; code: string }>;
};

type WorkspaceTab = "theory" | "questions" | "solve" | "hints" | "architect" | "notes";

function extractSlugFromLink(link: string | null) {
  if (!link) return null;
  const match = link.match(/leetcode\.com\/problems\/([^\/]+)/);
  return match ? match[1] : null;
}

function pickRequiredProblems(problems: Problem[]) {
  // Sort by unsolved first, then by orderIndex
  const sorted = [...problems].sort((left, right) => {
    const leftUnsolved = left.status !== "DONE" ? 1 : 0;
    const rightUnsolved = right.status !== "DONE" ? 1 : 0;
    
    // Unsolved problems come FIRST
    if (leftUnsolved !== rightUnsolved) {
      return rightUnsolved - leftUnsolved;
    }
    
    // Secondary sort by orderIndex
    return left.orderIndex - right.orderIndex;
  });

  const grouped = {
    EASY: sorted.filter((problem) => problem.difficulty === "EASY"),
    MEDIUM: sorted.filter((problem) => problem.difficulty === "MEDIUM"),
    HARD: sorted.filter((problem) => problem.difficulty === "HARD"),
  };

  return [
    ...grouped.EASY.slice(0, 2),
    ...grouped.MEDIUM.slice(0, 2),
    ...grouped.HARD.slice(0, 1),
  ];
}

export default function CityLevelPage() {
  const params = useParams();
  const levelId = params?.levelId as string;

  const [loading, setLoading] = useState(true);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [cityProgressLevels, setCityProgressLevels] = useState<
    CityLevelProgress[]
  >([]);
  const [level, setLevel] = useState<CityLevelProgress | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null,
  );
  const [selectedProblemDetails, setSelectedProblemDetails] =
    useState<ProblemDetails | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("solve");
  const [lastSubmission, setLastSubmission] = useState<{
    submittedAt: string;
    timeSpent: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLevel = async (preferredProblemId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const [cityProgress, topicProblems] = await Promise.all([
        dsaApi.getCityProgress(),
        dsaApi.getTopicProblems(levelId),
      ]);

      const nextCityProgressLevels = cityProgress.levels as CityLevelProgress[];

      const matchedLevel =
        nextCityProgressLevels.find((item) => item.id === levelId) || null;

      setCityProgressLevels(nextCityProgressLevels);
      setLevel(matchedLevel);
      setAllProblems(topicProblems);

      const required = pickRequiredProblems(topicProblems);
      const nextSelectedId =
        preferredProblemId &&
        required.some((problem) => problem.id === preferredProblemId)
          ? preferredProblemId
          : required[0]?.id || null;
      setSelectedProblemId(nextSelectedId);
    } catch (caughtError) {
      console.error(caughtError);
      setError("Failed to load the level workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (levelId) {
      loadLevel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const requiredProblems = useMemo(
    () => pickRequiredProblems(allProblems),
    [allProblems],
  );
  const selectedProblem = useMemo(
    () =>
      requiredProblems.find((problem) => problem.id === selectedProblemId) ||
      null,
    [requiredProblems, selectedProblemId],
  );

  const isUnlocked = useMemo(() => {
    const levelIndex = cityProgressLevels.findIndex(
      (item) => item.id === levelId,
    );

    if (levelIndex <= 0) {
      return true;
    }

    return Boolean(cityProgressLevels[levelIndex - 1]?.isCompleted);
  }, [cityProgressLevels, levelId]);

  useEffect(() => {
    const loadProblemDetails = async () => {
      if (!selectedProblem) {
        setSelectedProblemDetails(null);
        return;
      }

      const slug = extractSlugFromLink(selectedProblem.link);
      if (!slug) {
        setSelectedProblemDetails(null);
        return;
      }

      try {
        setLoadingProblem(true);
        const details = await dsaApi.getProblemDetails(slug);
        setSelectedProblemDetails(details as ProblemDetails);
      } catch (caughtError) {
        console.error(caughtError);
        setSelectedProblemDetails(null);
      } finally {
        setLoadingProblem(false);
      }
    };

    void loadProblemDetails();
  }, [selectedProblem]);

  useEffect(() => {
    if (!selectedProblemId && requiredProblems.length > 0) {
      setSelectedProblemId(requiredProblems[0].id);
    }
  }, [requiredProblems, selectedProblemId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !level) {
    return (
      <PageTransition>
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">
            {error || "Level not found."}
          </p>
          <Link
            href="/city"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
          >
            <ArrowLeft size={16} /> Back to DSA City
          </Link>
        </div>
      </PageTransition>
    );
  }

  const totalSolved =
    level.progress.easy.solved +
    level.progress.medium.solved +
    level.progress.hard.solved;
  const totalRequired =
    level.progress.easy.required +
    level.progress.medium.required +
    level.progress.hard.required;
  const percent = Math.round(
    (Math.min(totalSolved, totalRequired) / totalRequired) * 100,
  );
  const selectedSlug = extractSlugFromLink(selectedProblem?.link || null);
  const activeDifficultyStyle = selectedProblem
    ? getDifficultyStyle(selectedProblem.difficulty)
    : null;

  const handleSubmissionSuccess = async (timeSpent: number) => {
    if (!selectedProblem) return;

    await dsaApi.updateProgress(selectedProblem.id, "DONE", timeSpent);
    setLastSubmission({ submittedAt: new Date().toISOString(), timeSpent });
    await loadLevel(selectedProblem.id);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Link
              href="/city"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Back to DSA City
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
              <Layers3 size={12} /> Floor {levelId}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white lg:text-5xl">
              {level.name}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-gray-400 lg:text-base">
              This floor bundles theory and the five required questions for the
              topic. Solve 2 Easy, 2 Medium, and 1 Hard problem to complete the
              floor and unlock the next one.
            </p>
          </div>

          <div className="grid min-w-56 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                Progress
              </p>
              <p className="mt-2 text-2xl font-black text-white">{percent}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                Status
              </p>
              <p
                className={`mt-2 text-sm font-bold ${level.isCompleted ? "text-emerald-300" : "text-amber-300"}`}
              >
                {level.isCompleted ? "Floor completed" : "In progress"}
              </p>
            </div>
          </div>
        </div>

        {!isUnlocked && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <Lock size={16} />
            Complete the previous floor in DSA City to unlock this level.
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/20">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-4 sm:px-6">
            <button
              onClick={() => setWorkspaceTab("theory")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${workspaceTab === "theory" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              <BookOpen size={16} /> Theory
            </button>
            <button
              onClick={() => setWorkspaceTab("questions")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${workspaceTab === "questions" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              <Code2 size={16} /> Questions
            </button>
            <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              <Trophy size={12} /> 5 question floor
            </div>
          </div>

          {workspaceTab === "theory" ? (
            <div className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                    Easy
                  </p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">
                    {level.progress.easy.solved}/{level.progress.easy.required}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                    Medium
                  </p>
                  <p className="mt-2 text-2xl font-black text-cyan-300">
                    {level.progress.medium.solved}/
                    {level.progress.medium.required}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                    Hard
                  </p>
                  <p className="mt-2 text-2xl font-black text-rose-300">
                    {level.progress.hard.solved}/{level.progress.hard.required}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  <Sparkles size={14} /> Topic theory
                </div>
                <TopicStudyGuide topicName={level.name} />
              </div>
            </div>
          ) : (
            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
              <aside className="space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                    Required Questions
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    The floor uses exactly 5 questions: 2 Easy, 2 Medium, 1
                    Hard.
                  </p>
                </div>

                <div className="space-y-2">
                  {requiredProblems.map((problem, index) => {
                    const style = getDifficultyStyle(problem.difficulty);
                    const active = problem.id === selectedProblemId;
                    return (
                      <button
                        key={problem.id}
                        onClick={() => setSelectedProblemId(problem.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${active ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-white">
                                {problem.title}
                              </p>
                              {problem.status === "DONE" ? (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <Circle size={14} className="text-gray-500" />
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${style.bg} ${style.text}`}
                              >
                                {problem.difficulty}
                              </span>
                              {problem.status === "DONE" &&
                                problem.timeSpent > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                                    <Timer size={11} /> {problem.timeSpent}m
                                  </span>
                                )}
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className="shrink-0 text-gray-500"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="min-h-0 space-y-4">
                {!selectedProblem ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-gray-400">
                    Select a question to start.
                  </div>
                ) : loadingProblem ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    Loading question workspace...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-white">
                            {selectedProblem.title}
                          </h2>
                          {activeDifficultyStyle && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${activeDifficultyStyle.bg} ${activeDifficultyStyle.text}`}
                            >
                              {selectedProblem.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          Question{" "}
                          {requiredProblems.findIndex(
                            (problem) => problem.id === selectedProblem.id,
                          ) + 1}{" "}
                          of {requiredProblems.length}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                        <TrendingUp size={12} /> In-page workspace
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-3xl border border-white/10 bg-[#101010] p-5">
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                          <Brain size={14} /> Imported problem details
                        </div>
                        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                                Source
                              </p>
                              <h3 className="mt-1 text-lg font-bold text-white">
                                {selectedProblemDetails?.title ||
                                  selectedProblem.title}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                                LeetCode slug
                              </p>
                              <p className="mt-1 text-sm text-gray-300">
                                {selectedSlug || "Not available"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedProblemDetails?.topicTags
                              ?.slice(0, 6)
                              .map((tag) => (
                                <span
                                  key={tag.name}
                                  className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            {!selectedProblemDetails?.topicTags?.length && (
                              <span className="text-sm text-gray-500">
                                Topic tags will appear here when imported.
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="prose prose-invert prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html:
                              selectedProblemDetails?.content ||
                              "<p>Problem details are unavailable.</p>",
                          }}
                        />
                        {selectedProblemDetails?.exampleTestcases && (
                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                              Example testcase
                            </p>
                            <pre className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-300">
                              {selectedProblemDetails.exampleTestcases}
                            </pre>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-4">
                          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                            <button
                              onClick={() => setWorkspaceTab("solve")}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${workspaceTab === "solve" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                            >
                              <Code2 size={14} /> Solve
                            </button>
                            <button
                              onClick={() => setWorkspaceTab("hints")}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${workspaceTab === "hints" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                            >
                              <Sparkles size={14} /> Hints
                            </button>
                            <button
                              onClick={() => setWorkspaceTab("architect")}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${workspaceTab === "architect" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                            >
                              <TrendingUp size={14} /> Review
                            </button>
                            <button
                              onClick={() => setWorkspaceTab("notes")}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${workspaceTab === "notes" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                            >
                              <BookOpen size={14} /> Notes
                            </button>
                          </div>

                          <div className="pt-4">
                            {workspaceTab === "solve" && (
                              <>
                                {selectedSlug ? (
                                  <LeetCodeEditor
                                    problemSlug={selectedSlug}
                                    problemTitle={selectedProblem.title}
                                    problemId={selectedProblem.id}
                                    onSubmissionSuccess={
                                      handleSubmissionSuccess
                                    }
                                  />
                                ) : (
                                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                                    This problem does not have a linked editor
                                    slug yet.
                                  </div>
                                )}

                                <div className="mt-4">
                                  <SolutionHistory
                                    problemId={selectedProblem.id}
                                  />
                                </div>

                                {lastSubmission && (
                                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <div className="flex items-center gap-2 text-emerald-300">
                                      <CheckCircle2 size={16} />
                                      <p className="text-[10px] font-black uppercase tracking-widest">
                                        Submission Logged
                                      </p>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-200">
                                      Nice work. You completed this attempt in
                                      about {lastSubmission.timeSpent} minutes.
                                    </p>
                                  </div>
                                )}
                              </>
                            )}

                            {workspaceTab === "hints" && (
                              <AIMentorHint
                                problemId={selectedProblem.id}
                                problemTitle={selectedProblem.title}
                              />
                            )}

                            {workspaceTab === "architect" && (
                              <AICodeArchitect
                                problemId={selectedProblem.id}
                                problemTitle={selectedProblem.title}
                              />
                            )}

                            {workspaceTab === "notes" && (
                              <ProblemNotes problemId={selectedProblem.id} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
