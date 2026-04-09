"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { dsaApi, LearnTrackSummary } from "@/lib/api";

type ApiErrorShape = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

function StatTile({
  label,
  value,
  accentClassName = "text-white",
}: {
  label: string;
  value: string | number;
  accentClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${accentClassName}`}>{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
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

export default function LearnPage() {
  const [tracks, setTracks] = useState<LearnTrackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const isAdmin =
    ((session?.user as { role?: string } | undefined)?.role || "USER") ===
    "ADMIN";

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
  }, []);

  const totalLessons = useMemo(
    () => tracks.reduce((sum, track) => sum + track.totalLessons, 0),
    [tracks],
  );

  const totalCompleted = useMemo(
    () => tracks.reduce((sum, track) => sum + track.completedLessons, 0),
    [tracks],
  );

  const totalModules = useMemo(
    () => tracks.reduce((sum, track) => sum + track.modules.length, 0),
    [tracks],
  );

  const featuredTrack = useMemo(
    () =>
      tracks.find((track) => track.slug === "complete-dsa-bootcamp") ||
      tracks[0] ||
      null,
    [tracks],
  );

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await dsaApi.adminSeedComprehensiveLearn();
      await loadTracks();
    } catch {
      setError("Failed to seed the DSA bootcamp. Check backend logs.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-4 w-full max-w-7xl space-y-6 animate-pulse">
        <div className="h-14 w-80 rounded-2xl bg-white/8" />
        <div className="h-52 rounded-4xl bg-white/6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 rounded-4xl bg-white/6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#0b0b0b] p-8 shadow-2xl shadow-cyan-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles size={12} /> DSA bootcamp
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Learn First
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white lg:text-6xl">
                Build DSA intuition from complexity to advanced graphs.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 lg:text-base">
                This Learn section is centered around the complete DSA bootcamp.
                Open the curriculum, study each topic in order, and use the
                lesson pages for theory, C++ implementations, dry runs,
                complexity tables, and practice prompts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={featuredTrack ? `/learn/${featuredTrack.slug}` : "/learn"}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gray-200"
              >
                <Target size={15} /> Open bootcamp
              </Link>
              {featuredTrack?.modules[0]?.lessons[0] && (
                <Link
                  href={`/learn/${featuredTrack.slug}/${featuredTrack.modules[0].slug}/${featuredTrack.modules[0].lessons[0].slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <ArrowRight size={15} /> Start first lesson
                </Link>
              )}
              {isAdmin && (
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15 disabled:opacity-60"
                >
                  {seeding ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {seeding ? "Seeding..." : "Reseed bootcamp"}
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Tracks" value={tracks.length} />
              <StatTile label="Modules" value={totalModules} />
              <StatTile label="Lessons" value={totalLessons} />
              <StatTile
                label="Completed"
                value={totalCompleted}
                accentClassName="text-emerald-300"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                  Bootcamp map
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Study path snapshot
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Progress
                </p>
                <p className="text-2xl font-black text-white">
                  {featuredTrack?.progressPercent || 0}%
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(featuredTrack?.modules || []).slice(0, 8).map((module) => (
                <span
                  key={module.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                >
                  {module.title}
                </span>
              ))}
            </div>

            {featuredTrack && (
              <div className="mt-6 rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                  Featured curriculum
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  {featuredTrack.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {featuredTrack.description}
                </p>
                <div className="mt-4 grid gap-2 text-xs text-gray-300 sm:grid-cols-3">
                  <MiniStat
                    label="Modules"
                    value={featuredTrack.modules.length}
                  />
                  <MiniStat
                    label="Lessons"
                    value={featuredTrack.totalLessons}
                  />
                  <MiniStat
                    label="Completed"
                    value={featuredTrack.completedLessons}
                    valueClassName="text-emerald-300"
                  />
                </div>
                <Link
                  href={`/learn/${featuredTrack.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-gray-200"
                >
                  <Target size={15} /> View curriculum
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="overflow-hidden rounded-4xl border border-white/10 bg-[#0b0b0b]"
          >
            <div className="border-b border-white/10 bg-linear-to-r from-white/5 to-transparent px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-gray-500">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {track.modules.length} modules
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {track.totalLessons} lessons
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {track.title}
                    </h2>
                    {track.description && (
                      <p className="mt-2 max-w-3xl text-sm text-gray-400">
                        {track.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="min-w-40 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
                    Track progress
                  </p>
                  <p className="text-3xl font-black text-white">
                    {track.progressPercent}%
                  </p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-400 via-blue-400 to-emerald-400"
                  style={{ width: `${Math.max(track.progressPercent, 2)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {track.modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="rounded-3xl border border-white/10 bg-[#111] p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                            Module {moduleIndex + 1}
                          </span>
                          <span>
                            {module.completedLessons}/{module.totalLessons} done
                          </span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold text-white">
                          {module.title}
                        </h3>
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

                    <div className="mt-4 grid gap-2">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/learn/${track.slug}/${module.slug}/${lesson.slug}`}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-black/30"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {lesson.difficulty} · {lesson.estimatedMinutes}{" "}
                              min
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

              <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
                <div className="rounded-3xl border border-white/10 bg-[#111] p-4">
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

                <Link
                  href={`/learn/${track.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
                >
                  Open track overview <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {tracks.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-gray-400">
            No theory tracks found yet.
            {isAdmin
              ? " Click Seed Starter Theory to bootstrap content."
              : " Ask an admin to seed learning content."}
          </div>
        )}
      </section>
    </div>
  );
}
