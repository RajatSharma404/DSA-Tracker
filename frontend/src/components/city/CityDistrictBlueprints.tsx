"use client";

import React, { useState } from "react";
import {
  Compass,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Trophy,
  Code2,
  Cpu,
  Key,
} from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";

interface DistrictInfo {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  tier: "Foundation" | "Intermediate" | "Advanced" | "Legendary";
  accentColor: string;
  borderGlow: string;
  problemsCount: number;
  unlockedSkins: string[];
  bossEncounter: string;
  overview: string;
  keyConcepts: string[];
}

const DISTRICTS: DistrictInfo[] = [
  {
    id: "district-01",
    number: "01",
    name: "Arrays & Hash Grid",
    subtitle: "The Silicon Bedrock",
    tier: "Foundation",
    accentColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    borderGlow: "hover:border-cyan-400/60",
    problemsCount: 15,
    unlockedSkins: ["Cyan Wireframe Base", "Sub-grid Neon Foundation"],
    bossEncounter: "Two-Sum Hash Matrix Overlord",
    overview: "The foundational bedrock of the city where high-speed lookup tables and hash memory banks are forged.",
    keyConcepts: ["Prefix Sums", "HashMap Chaining", "Frequency Arrays", "In-place Mutation"],
  },
  {
    id: "district-02",
    number: "02",
    name: "Two Pointers Corridor",
    subtitle: "The Velocity Causeway",
    tier: "Foundation",
    accentColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    borderGlow: "hover:border-pink-400/60",
    problemsCount: 12,
    unlockedSkins: ["Dual Laser Bridges", "Synchronized Skyline Arches"],
    bossEncounter: "3Sum Zero-Sum Sentinel",
    overview: "A hyper-speed transport artery where left and right pointer vectors converge to solve linear constraints in O(1) space.",
    keyConcepts: ["Opposing Pointers", "Fast & Slow Runner", "Sorted Array Reductions", "Palindrome Probes"],
  },
  {
    id: "district-03",
    number: "03",
    name: "Sliding Window Lagoon",
    subtitle: "The Frequency Waterfront",
    tier: "Intermediate",
    accentColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    borderGlow: "hover:border-amber-400/60",
    problemsCount: 14,
    unlockedSkins: ["Holographic Glass Canopy", "Dynamic Wave Antennas"],
    bossEncounter: "Minimum Window Substring Colossus",
    overview: "Dynamic expanding and contracting atmospheric dome sectors optimized for substring and sub-array spectrum analysis.",
    keyConcepts: ["Variable Length Expansion", "Monotonic Deques", "Frequency Map Shrinking", "Exact-K Counters"],
  },
  {
    id: "district-04",
    number: "04",
    name: "Tree & Segment Canopy",
    subtitle: "The Dendrite Arbor",
    tier: "Intermediate",
    accentColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    borderGlow: "hover:border-emerald-400/60",
    problemsCount: 20,
    unlockedSkins: ["Bioluminescent Branch Spires", "Segment Tree Solar Sails"],
    bossEncounter: "Serialize & Deserialize Binary Titan",
    overview: "Towering biophilic megastructures linked by recursive tree branches, balanced AVL nodes, and segmented query grids.",
    keyConcepts: ["DFS / BFS Traversal", "Lowest Common Ancestor", "Segment Trees with Lazy Propagation", "Trie Prefix Dictionaries"],
  },
  {
    id: "district-05",
    number: "05",
    name: "Graph Synapse Nexus",
    subtitle: "The Constellation Matrix",
    tier: "Advanced",
    accentColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    borderGlow: "hover:border-purple-400/60",
    problemsCount: 22,
    unlockedSkins: ["Quantum Teleport Pylons", "Synaptic Pulse Beacons"],
    bossEncounter: "Alien Dictionary & Network Delay Gargantua",
    overview: "A sprawling multidimensional web of interconnected vertices, shortest-path highways, and topological dependency pipelines.",
    keyConcepts: ["Dijkstra & A* Routing", "Kahn's Topological Sort", "Disjoint Set Union (Union-Find)", "Tarjan's Bridges"],
  },
  {
    id: "district-06",
    number: "06",
    name: "Central Dynamic Spire",
    subtitle: "The Singularity Citadel",
    tier: "Legendary",
    accentColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    borderGlow: "hover:border-rose-400/60",
    problemsCount: 25,
    unlockedSkins: ["Singularity Core Reactor", "Infinite Apex Penthouse"],
    bossEncounter: "Burst Balloons & Regex Parser Singularity",
    overview: "The pinnacle skyscraper at the heart of the metropolis. Requires mastering subproblem memoization, bottom-up tabulation, and bitmask state spaces.",
    keyConcepts: ["2D Tabulation", "Bitmask Dynamic Programming", "Matrix Exponentiation", "Decision Trees & Knapsacks"],
  },
];

export function CityDistrictBlueprints() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(DISTRICTS[0]);

  const handleSelect = (district: DistrictInfo) => {
    cityAudio.playSelect();
    setSelectedDistrict(district);
  };

  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-secondary)]/15 border border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] text-xs font-bold uppercase tracking-wider mb-2">
            <Compass size={13} />
            <span>Territorial Blueprint Dossier</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-display">
            Metropolitan Districts & Architecture
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Explore the 6 thematic spatial sectors designed for progressive algorithmic conquest.
          </p>
        </div>

        <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
          ALL 6 DISTRICTS REVEALED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District list (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {DISTRICTS.map((district) => {
            const isSelected = selectedDistrict.id === district.id;
            return (
              <button
                key={district.id}
                onClick={() => handleSelect(district)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-lg scale-[1.01]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-xs font-black flex items-center justify-center text-[var(--accent-primary)] shrink-0 shadow-inner">
                    {district.number}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--text-primary)] truncate font-display">
                      {district.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">
                      {district.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${district.accentColor}`}>
                    {district.tier}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      isSelected ? "text-[var(--accent-primary)] translate-x-0.5" : "text-[var(--text-muted)]"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* District Detailed Spec Sheet (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-inner">
          {/* Ambient subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest">
                  District #{selectedDistrict.number} Schematic
                </span>
                <h4 className="text-2xl font-black text-[var(--text-primary)] font-display mt-1">
                  {selectedDistrict.name}
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Codename: {selectedDistrict.subtitle}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                  Algorithm Quotas
                </span>
                <p className="text-lg font-black text-[var(--text-primary)] font-mono">
                  {selectedDistrict.problemsCount} Challenges
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
              {selectedDistrict.overview}
            </p>

            {/* Key concepts */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Core Architectural Protocols
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDistrict.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Boss Encounter & Unlockable Rewards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold font-display">
                  <ShieldAlert size={14} />
                  <span>District Raid Boss</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {selectedDistrict.bossEncounter}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-display">
                  <Trophy size={14} />
                  <span>Skyscraper Cosmetics</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {selectedDistrict.unlockedSkins.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] relative z-10 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Key size={13} />
              <span>Unlocked upon previous sector completion</span>
            </span>
            <span className="opacity-60">DSA-GRID-SPEC-v3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
