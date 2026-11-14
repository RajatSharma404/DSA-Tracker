"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RoadmapCatalog } from "@/components/roadmap/RoadmapCatalog";
import { RoadmapDetail } from "@/components/roadmap/RoadmapDetail";

const CustomRoadmapBuilder = dynamic(() => import("@/components/roadmap/CustomRoadmapBuilder"), {
  ssr: false,
  loading: () => <div className="surface h-[60vh] shimmer" />,
});
const RoadmapGraph = dynamic(() => import("@/components/roadmap/RoadmapGraph"), {
  ssr: false,
  loading: () => <div className="surface h-[60vh] shimmer" />,
});

type View = "lists" | "map" | "build";
const VIEWS: Array<{ id: View; label: string }> = [
  { id: "lists", label: "Roadmaps" },
  { id: "map", label: "Topic map" },
  { id: "build", label: "Build your own" },
];

function RoadmapContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = (params.get("view") as View) || "lists";
  const list = params.get("list");

  const go = (next: Record<string, string | null>) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    router.push(`${pathname}${q.size ? `?${q}` : ""}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title text-3xl leading-tight text-[var(--text-primary)]">Roadmap</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
            Follow a proven list like Blind 75 or NeetCode 150, track your progress on it, and solve each problem
            right here.
          </p>
        </div>
        <div role="tablist" className="flex gap-5 border-b border-[var(--border-subtle)] sm:border-0">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => go({ view: v.id === "lists" ? null : v.id, list: null })}
              className={`-mb-px border-b-2 pb-2 text-sm transition-colors cursor-pointer ${
                view === v.id
                  ? "border-[var(--accent-primary)] font-medium text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </header>

      {view === "lists" &&
        (list ? (
          <RoadmapDetail slug={list} onBack={() => go({ list: null })} />
        ) : (
          <RoadmapCatalog onOpen={(slug) => go({ list: slug })} />
        ))}
      {view === "map" && (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-muted)]">
            How this tracker&apos;s own topics depend on each other. Finishing a topic unlocks the ones built on it.
          </p>
          <RoadmapGraph />
        </div>
      )}
      {view === "build" && <CustomRoadmapBuilder />}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="surface h-96 shimmer" />}>
      <RoadmapContent />
    </Suspense>
  );
}
