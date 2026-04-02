"use client";

import RoadmapGraph from "@/components/roadmap/RoadmapGraph";
import CustomRoadmapBuilder from "@/components/roadmap/CustomRoadmapBuilder";
import { Network, Activity, Info, Grid2X2, PencilLine } from "lucide-react";
import { useState } from "react";

export default function RoadmapPage() {
  const [mode, setMode] = useState<"custom" | "visual">("custom");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Network size={12} /> Live Visualizer
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            The Interactive{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">
              Curriculum
            </span>
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl text-sm font-medium">
            Explore your learning journey through a live graph, or switch to the
            custom builder to create your own plain-text roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pb-2">
          <button
            onClick={() => setMode("custom")}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition-colors ${
              mode === "custom"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <PencilLine size={14} /> Builder
          </button>
          <button
            onClick={() => setMode("visual")}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition-colors ${
              mode === "visual"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Grid2X2 size={14} /> Visual
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="pointer-events-none absolute -inset-4 bg-linear-to-r from-blue-500/10 to-transparent blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
        {mode === "custom" ? <CustomRoadmapBuilder /> : <RoadmapGraph />}
      </div>

      {mode === "visual" ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-4xl bg-[#0d0d0d] border border-white/5 flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Hierarchical Flow
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The curriculum is structured following dependent patterns.
                Mastering &quot;Arrays&quot; unlocks &quot;Two Pointers&quot;,
                which branches out to &quot;Sliding Window&quot; and more.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-4xl bg-[#0d0d0d] border border-white/5 flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Live Progress
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Every block you complete in your topics page is instantly
                reflected here. Nodes turn green and edges turn solid as you
                pave your path to mastery.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
