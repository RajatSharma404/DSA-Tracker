"use client";

import dynamic from "next/dynamic";
import { Network, Activity, Info, Grid2X2, PencilLine } from "lucide-react";
import { useState } from "react";
import { soundEffects } from "@/lib/soundEffects";

const CustomRoadmapBuilder = dynamic(
  () => import("@/components/roadmap/CustomRoadmapBuilder"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center rounded-4xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-muted)] font-mono">
        Loading roadmap builder...
      </div>
    ),
  },
);

const RoadmapGraph = dynamic(
  () => import("@/components/roadmap/RoadmapGraph"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center rounded-4xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-muted)] font-mono">
        Loading visual roadmap...
      </div>
    ),
  },
);

export default function RoadmapPage() {
  const [mode, setMode] = useState<"custom" | "visual">("custom");

  const handleToggleMode = (newMode: "custom" | "visual") => {
    soundEffects.playClick();
    setMode(newMode);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 w-full min-w-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-full text-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-widest mb-3">
            <Network size={12} />
            <span>Interactive Algorithmic Graph</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight font-display">
            Curriculum Dependency{" "}
            <span className="text-[var(--accent-primary)]">Roadmap</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-1 max-w-xl text-sm font-medium">
            Explore your learning journey through a live dependency graph, or switch to the
            custom builder to design plain-text pattern trees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => handleToggleMode("custom")}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all cursor-pointer font-mono ${
              mode === "custom"
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black shadow-md"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <PencilLine size={14} />
            <span>Builder</span>
          </button>
          <button
            onClick={() => handleToggleMode("visual")}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all cursor-pointer font-mono ${
              mode === "visual"
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-black shadow-md"
                : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <Grid2X2 size={14} />
            <span>Visual</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        {mode === "custom" ? <CustomRoadmapBuilder /> : <RoadmapGraph />}
      </div>

      {mode === "visual" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-7 rounded-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-5 shadow-xl">
            <div className="p-3.5 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 font-display">
                Hierarchical Pattern Flow
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                The curriculum is structured following dependent algorithmic invariants.
                Mastering &quot;Arrays&quot; unlocks &quot;Two Pointers&quot;,
                which branches out into &quot;Sliding Window&quot;, Binary Search, and Tree traversals.
              </p>
            </div>
          </div>
          <div className="p-7 rounded-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-5 shadow-xl">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Info size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 font-display">
                Real-Time Mastery Rings
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Every problem you solve across your study guides and daily practice is
                instantly calculated. Topic nodes reflect live completion percentages and glowing connection edges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
