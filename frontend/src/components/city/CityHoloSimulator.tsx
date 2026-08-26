"use client";

import React, { useState } from "react";
import {
  Building2,
  Sparkles,
  Zap,
  Flame,
  Layers,
  ChevronRight,
  RefreshCw,
  Trophy,
  Cpu,
  ShieldAlert,
} from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";
import confetti from "canvas-confetti";

interface FloorItem {
  id: number;
  name: string;
  category: string;
  height: number;
  color: string;
  complexity: string;
}

const ARCHITECTURES = [
  { id: "cyberpunk", name: "Cyberpunk Spire", color: "from-cyan-500 to-fuchsia-500", border: "border-cyan-400/40", glow: "shadow-[0_0_20px_rgba(0,240,255,0.4)]" },
  { id: "matrix", name: "Matrix Obelisk", color: "from-emerald-500 to-teal-400", border: "border-emerald-400/40", glow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]" },
  { id: "synthwave", name: "Solar Citadel", color: "from-amber-400 to-rose-500", border: "border-amber-400/40", glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]" },
  { id: "obsidian", name: "Quantum Spire", color: "from-purple-500 to-indigo-600", border: "border-purple-400/40", glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]" },
];

const ALGO_MODULES = [
  { name: "0/1 Knapsack Optimizer", category: "Dynamic Programming", complexity: "O(N*W)", color: "#00f0ff" },
  { name: "Dijkstra Shortest Nexus", category: "Graph Network", complexity: "O(E log V)", color: "#ec4899" },
  { name: "Segment Tree Range Query", category: "Advanced Trees", complexity: "O(log N)", color: "#10b981" },
  { name: "Aho-Corasick Automaton", category: "String Matching", complexity: "O(N + M)", color: "#f59e0b" },
  { name: "Bitmask TSP Resolver", category: "Bit Manipulation", complexity: "O(2^N * N^2)", color: "#8b5cf6" },
];

export function CityHoloSimulator() {
  const [selectedArch, setSelectedArch] = useState(ARCHITECTURES[0]);
  const [floors, setFloors] = useState<FloorItem[]>([
    { id: 1, name: "Foundation: Arrays & Hashing Core", category: "Foundation", height: 25, color: "#00f0ff", complexity: "O(1)" },
    { id: 2, name: "District Gate: Two Pointers Bridge", category: "Two Pointers", height: 35, color: "#ec4899", complexity: "O(N)" },
  ]);
  const [selectedAlgoIdx, setSelectedAlgoIdx] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [totalHeight, setTotalHeight] = useState(60);

  const handleBuildFloor = () => {
    if (isBuilding) return;
    setIsBuilding(true);
    cityAudio.playConstruct();

    const algo = ALGO_MODULES[selectedAlgoIdx];
    const newFloorId = floors.length + 1;
    const addedHeight = Math.floor(Math.random() * 25) + 20;

    setTimeout(() => {
      const newFloor: FloorItem = {
        id: newFloorId,
        name: algo.name,
        category: algo.category,
        height: addedHeight,
        color: algo.color,
        complexity: algo.complexity,
      };

      setFloors((prev) => [newFloor, ...prev]);
      setTotalHeight((prev) => prev + addedHeight);
      setSelectedAlgoIdx((prev) => (prev + 1) % ALGO_MODULES.length);
      setIsBuilding(false);

      if (newFloorId % 3 === 0) {
        cityAudio.playSpire();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#00f0ff", "#ec4899", "#facc15"],
          });
        } catch {
          // ignore
        }
      }
    }, 450);
  };

  const handleReset = () => {
    cityAudio.playGlitch();
    setFloors([
      { id: 1, name: "Foundation: Arrays & Hashing Core", category: "Foundation", height: 25, color: "#00f0ff", complexity: "O(1)" },
    ]);
    setTotalHeight(25);
  };

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient decorative grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu size={13} />
            <span>Interactive Holographic Sandbox</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-display flex items-center gap-2">
            Spatial Skyscraper Constructor
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Simulate how your algorithm solutions dynamically construct skyscraper floors in DSA City.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Reset Grid</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* Architecture Theme Picker */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
              1. Select Skyscraper Blueprint
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ARCHITECTURES.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => {
                    cityAudio.playHover();
                    setSelectedArch(arch);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedArch.id === arch.id
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 shadow-md"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <p className="font-bold text-xs text-[var(--text-primary)] truncate font-display">
                    {arch.name}
                  </p>
                  <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${arch.color} mt-2`} />
                </button>
              ))}
            </div>
          </div>

          {/* Module to compile */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
              2. Algorithmic Subroutine
            </label>
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  {ALGO_MODULES[selectedAlgoIdx].name}
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                  {ALGO_MODULES[selectedAlgoIdx].complexity}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                Category: {ALGO_MODULES[selectedAlgoIdx].category}
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleBuildFloor}
            disabled={isBuilding}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest font-display transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg ${
              isBuilding
                ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)] animate-pulse cursor-not-allowed"
                : "bg-[var(--accent-primary)] hover:brightness-110 text-black shadow-[0_0_25px_var(--accent-glow)] active:scale-[0.98]"
            }`}
          >
            {isBuilding ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Synthesizing Floor...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-current" />
                <span>Deploy Algorithmic Floor</span>
              </>
            )}
          </button>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-center">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Floors</p>
              <p className="text-base font-black text-[var(--text-primary)]">{floors.length}</p>
            </div>
            <div className="border-x border-[var(--border-subtle)]">
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Altitude</p>
              <p className="text-base font-black text-[var(--accent-primary)]">{totalHeight}m</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Rating</p>
              <p className="text-base font-black text-amber-400">{(floors.length * 1420).toLocaleString()} XP</p>
            </div>
          </div>
        </div>

        {/* Visual Skyscraper Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-end rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 min-h-[380px] relative overflow-hidden">
          {/* Skyline backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-secondary)] to-[var(--bg-card)] opacity-90 pointer-events-none" />
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hologram Real-time Visualizer</span>
          </div>

          {/* Skyscraper Spire Tip */}
          <div className="relative z-10 flex flex-col items-center mb-2">
            <div className="w-1.5 h-10 bg-gradient-to-t from-[var(--accent-primary)] to-white rounded-t-full shadow-[0_0_15px_var(--accent-primary)] animate-pulse" />
            <div className="w-6 h-2 bg-[var(--accent-primary)] rounded-full shadow-[0_0_12px_var(--accent-primary)]" />
          </div>

          {/* Skyscraper Floors Stack */}
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-1.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {floors.map((floor, idx) => (
              <div
                key={floor.id}
                style={{ borderLeftColor: floor.color }}
                className={`w-full p-2.5 rounded-xl border border-[var(--border-subtle)] border-l-4 bg-[var(--bg-card)]/90 backdrop-blur-md shadow-md flex items-center justify-between transition-all duration-500 animate-in slide-in-from-top-4 ${
                  idx === 0 ? "ring-2 ring-[var(--accent-primary)]/50" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-lg bg-[var(--bg-secondary)] text-[10px] font-mono font-black flex items-center justify-center text-[var(--text-muted)] shrink-0">
                    L{floors.length - idx}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate font-display">
                      {floor.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {floor.category} • {floor.complexity}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--accent-primary)] shrink-0 pl-2">
                  +{floor.height}m
                </span>
              </div>
            ))}
          </div>

          {/* Ground Grid Base */}
          <div className="relative z-10 w-full max-w-sm mt-3 pt-2 border-t-2 border-[var(--accent-primary)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
            <span>SECTOR 07 FOUNDATION</span>
            <span className="text-emerald-400 font-bold">GRID ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
