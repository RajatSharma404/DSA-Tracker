"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dsaApi, LearnTrackSummary } from "@/lib/api";
import { BookOpen, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

type ApiErrorShape = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

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

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await dsaApi.adminSeedLearn();
      await loadTracks();
    } catch {
      setError("Failed to seed starter theory. Check backend logs.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 w-full max-w-6xl space-y-8">
      <section className="rounded-3xl border border-white/10 bg-linear-to-r from-[#111] to-[#0a0a0a] p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
          Learn First
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
          Theory Before Questions
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-400">
          Follow structured language and DSA theory modules inspired by LearnCpp
          style. Complete theory lessons to unlock linked practice problems.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-gray-300">
            Tracks:{" "}
            <span className="font-bold text-white">{tracks.length}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-gray-300">
            Lessons:{" "}
            <span className="font-bold text-white">{totalLessons}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-gray-300">
            Completed:{" "}
            <span className="font-bold text-green-400">{totalCompleted}</span>
          </div>
          {isAdmin && tracks.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-gray-200 disabled:opacity-60"
            >
              {seeding ? "Seeding..." : "Seed Starter Theory"}
            </button>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      <section className="space-y-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{track.title}</h2>
                {track.description && (
                  <p className="mt-1 text-sm text-gray-400">
                    {track.description}
                  </p>
                )}
              </div>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                {track.progressPercent}% complete
              </span>
            </div>

            <div className="space-y-4">
              {track.modules.map((module) => (
                <div
                  key={module.id}
                  className="rounded-2xl border border-white/10 bg-[#101010] p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {module.title}
                      </h3>
                      {module.summary && (
                        <p className="text-sm text-gray-400">
                          {module.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock3 size={14} /> {module.estimatedMinutes} min
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/learn/${track.slug}/${module.slug}/${lesson.slug}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-black/30"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {lesson.title}
                          </p>
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
