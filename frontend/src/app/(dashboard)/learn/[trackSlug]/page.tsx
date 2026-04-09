"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { dsaApi, LearnTrackSummary } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";

type ApiErrorShape = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export default function LearnTrackPage() {
  const params = useParams();
  const trackSlug = params?.trackSlug as string;

  const [tracks, setTracks] = useState<LearnTrackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dsaApi.getLearnTracks();
      setTracks(data);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null
          ? (err as ApiErrorShape).response?.data?.error ||
            "Failed to load learning tracks"
          : "Failed to load learning tracks";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [trackSlug]);

  const track = useMemo(
    () => tracks.find((item) => item.slug === trackSlug) || null,
    [trackSlug, tracks],
  );

  const firstLesson = track?.modules[0]?.lessons[0] || null;

  if (loading) {
    return (
      <div className="mx-auto mt-4 max-w-7xl space-y-6 animate-pulse">
        <div className="h-12 w-80 rounded-2xl bg-white/8" />
        <div className="h-56 rounded-[2rem] bg-white/6" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-[2rem] bg-white/6" />
          <div className="h-64 rounded-[2rem] bg-white/6" />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-300">
        {error || "Track not found"}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 shadow-2xl shadow-cyan-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
              Bootcamp overview
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white lg:text-6xl">
              {track.title}
            </h1>
            {track.description && (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 lg:text-base">
                {track.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={
                  firstLesson
                    ? `/learn/${track.slug}/${track.modules[0].slug}/${firstLesson.slug}`
                    : "/learn"
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gray-200"
              >
                <Target size={15} /> Start learning
              </Link>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <ArrowRight size={15} /> Back to Learn hub
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              Progress snapshot
            </p>
            <div className="mt-3 space-y-3">
              <TrackStat label="Modules" value={track.modules.length} />
              <TrackStat label="Lessons" value={track.totalLessons} />
              <TrackStat
                label="Completed"
                value={track.completedLessons}
                valueClassName="text-emerald-300"
              />
              <TrackStat
                label="Progress"
                value={`${track.progressPercent}%`}
                valueClassName="text-cyan-300"
              />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-400 via-blue-400 to-emerald-400"
                style={{ width: `${Math.max(track.progressPercent, 2)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {track.modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      Module {moduleIndex + 1}
                    </span>
                    <span>
                      {module.completedLessons}/{module.totalLessons} complete
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {module.title}
                  </h2>
                  {module.summary && (
                    <p className="mt-1 text-sm text-gray-400">
                      {module.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock3 size={14} /> {module.estimatedMinutes} min
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/${track.slug}/${module.slug}/${lesson.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-black/30"
                  >
                    <div>
                      <p className="font-medium text-white">{lesson.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {lesson.difficulty} · {lesson.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {lesson.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-green-400">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-400">
                          <BookOpen size={12} /> {lesson.progressPercent}%
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0b] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              Study path
            </p>
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <PathStep
                title="1. Follow the order"
                text="Start from complexity, then move through each topic in sequence."
              />
              <PathStep
                title="2. Open lessons"
                text="Every lesson includes theory, C++ code, a dry run, and checkpoints."
              />
              <PathStep
                title="3. Practice immediately"
                text="Use the linked problems to turn theory into interview-ready recall."
              />
            </div>
          </div>

          {firstLesson && (
            <Link
              href={`/learn/${track.slug}/${track.modules[0].slug}/${firstLesson.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
            >
              <Target size={15} /> Open first lesson
            </Link>
          )}
        </aside>
      </section>
    </div>
  );
}

function TrackStat({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}

function PathStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-gray-400">{text}</p>
    </div>
  );
}
