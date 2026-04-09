"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dsaApi, LearnLessonDetail } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Lock,
  PlayCircle,
  Rocket,
} from "lucide-react";
import { useSession } from "next-auth/react";

type ApiErrorShape = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

function normalizeMultiline(text: string): string {
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

function renderBlock(block: LearnLessonDetail["blocks"][number]) {
  const content =
    typeof block.content === "object" && block.content !== null
      ? (block.content as Record<string, unknown>)
      : {};

  if (block.blockType === "CODE") {
    const title = typeof content.title === "string" ? content.title : undefined;
    const code =
      typeof content.code === "string"
        ? normalizeMultiline(content.code)
        : undefined;
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
        {title && (
          <p className="mb-2 text-sm font-semibold text-blue-200">{title}</p>
        )}
        <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-sm text-gray-100">
          <code>{code || "// code block"}</code>
        </pre>
      </div>
    );
  }

  const markdown =
    typeof content.markdown === "string"
      ? normalizeMultiline(content.markdown)
      : "";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:mb-3 prose-p:mb-2 prose-li:my-0.5">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function LearnLessonPage() {
  const params = useParams();
  const trackSlug = params?.trackSlug as string;
  const moduleSlug = params?.moduleSlug as string;
  const lessonSlug = params?.lessonSlug as string;
  const { data: session } = useSession();
  const canTrackProgress = Boolean(session);

  const [data, setData] = useState<LearnLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dsaApi.getLearnLesson(
        trackSlug,
        moduleSlug,
        lessonSlug,
      );
      setData(response);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null
          ? (err as ApiErrorShape).response?.data?.error ||
            "Failed to load lesson"
          : "Failed to load lesson";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [lessonSlug, moduleSlug, trackSlug]);

  useEffect(() => {
    if (trackSlug && moduleSlug && lessonSlug) {
      loadLesson();
    }
  }, [trackSlug, moduleSlug, lessonSlug, loadLesson]);

  const estimatedReadSeconds = useMemo(() => {
    if (!data) return 0;
    return data.lesson.estimatedMinutes * 60;
  }, [data]);

  const markComplete = async () => {
    if (!data) return;

    try {
      setUpdating(true);
      await dsaApi.updateLearnLessonProgress(data.lesson.id, {
        status: "COMPLETED",
        progressPercent: 100,
        timeSpentSeconds: Math.max(
          data.progress.timeSpentSeconds,
          estimatedReadSeconds,
        ),
      });
      await loadLesson();
    } finally {
      setUpdating(false);
    }
  };

  const markInProgress = async () => {
    if (!data) return;

    try {
      setUpdating(true);
      await dsaApi.updateLearnLessonProgress(data.lesson.id, {
        status: "IN_PROGRESS",
        progressPercent: Math.max(10, data.progress.progressPercent),
      });
      await loadLesson();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-4 grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px] animate-pulse">
        <section className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="h-3 w-44 rounded-full bg-white/5" />
            <div className="h-8 w-2/3 rounded-full bg-white/5" />
            <div className="h-4 w-full rounded-full bg-white/5" />
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-24 rounded-full bg-white/5" />
              <div className="h-8 w-24 rounded-full bg-white/5" />
              <div className="h-8 w-28 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 space-y-4">
            <div className="h-5 w-48 rounded-full bg-white/5" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-white/5" />
              <div className="h-4 w-11/12 rounded-full bg-white/5" />
              <div className="h-4 w-10/12 rounded-full bg-white/5" />
            </div>
            <div className="h-56 rounded-2xl bg-white/5" />
          </div>
        </section>
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#0d0d0d] p-5">
          <div className="h-5 w-32 rounded-full bg-white/5" />
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-white/5" />
            <div className="h-24 rounded-2xl bg-white/5" />
            <div className="h-24 rounded-2xl bg-white/5" />
          </div>
        </aside>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
        {error || "Lesson not found"}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            {data.lesson.track.title} / {data.lesson.module.title}
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            {data.lesson.title}
          </h1>
          {data.lesson.summary && (
            <p className="mt-2 text-sm text-gray-400">{data.lesson.summary}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {data.lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Clock3 size={12} /> {data.lesson.estimatedMinutes} min
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Progress: {data.progress.progressPercent}%
            </span>
          </div>

          {data.lesson.learningObjectives &&
            data.lesson.learningObjectives.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Learning objectives
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  {data.lesson.learningObjectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

          <div className="mt-5 flex flex-wrap gap-3">
            {canTrackProgress ? (
              <>
                <button
                  onClick={markInProgress}
                  disabled={updating}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Mark In Progress"}
                </button>
                <button
                  onClick={markComplete}
                  disabled={updating}
                  className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Complete Lesson"}
                </button>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                Sign in to track progress and unlock problem status updates.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {data.blocks.map((block) => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Module lessons
          </p>
          <div className="mt-3 space-y-2">
            {data.siblings.map((lesson) => {
              const active = lesson.slug === lessonSlug;
              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${trackSlug}/${moduleSlug}/${lesson.slug}`}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-blue-500/40 bg-blue-500/10 text-white"
                      : "border-white/10 bg-black/20 text-gray-300 hover:bg-black/40"
                  }`}
                >
                  <span>{lesson.title}</span>
                  {lesson.status === "COMPLETED" ? (
                    <CheckCircle2 size={14} className="text-green-400" />
                  ) : (
                    <Circle size={14} className="text-gray-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Practice questions
          </p>
          <div className="mt-3 space-y-2">
            {data.problems.map((problem) => (
              <div
                key={problem.id}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    {problem.title}
                  </p>
                  <span className="text-[10px] uppercase text-gray-400">
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {problem.topicName || "General"}
                </p>

                {problem.unlocked ? (
                  <Link
                    href={`/problems/${problem.id}`}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400"
                  >
                    <PlayCircle size={13} /> Solve now
                  </Link>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-300">
                    <Lock size={13} /> Complete theory to unlock
                  </div>
                )}
              </div>
            ))}
            {data.problems.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-xs text-gray-500">
                No linked practice problems yet.
              </p>
            )}
          </div>
        </div>

        <Link
          href="/learn"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          <Rocket size={14} /> Back To Learn Hub
        </Link>
      </aside>
    </div>
  );
}
