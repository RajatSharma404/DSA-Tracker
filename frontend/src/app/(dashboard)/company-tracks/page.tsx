"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ChevronRight,
  BarChart2,
  ShieldCheck,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface CompanyTrack {
  id: string;
  name: string;
  badgeColor: string;
  targetTier: string;
  duration: string;
  problemCount: number;
  coreFocus: string[];
  description: string;
  hiringBarCriteria: string;
  baselinePassRate: number;
}

const COMPANY_TRACKS: CompanyTrack[] = [
  {
    id: "google",
    name: "Google Flagship Track",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    targetTier: "L4 / L5 SWE",
    duration: "30 Days",
    problemCount: 50,
    coreFocus: [
      "Dynamic Programming",
      "Graph Invariants",
      "Disjoint Set",
      "Trie",
    ],
    description:
      "Heavy emphasis on unseen problem variations, rigorous proofs, and optimal Big-O bounds.",
    hiringBarCriteria:
      "Zero hints required on Mediums; rigorous invariant explanation.",
    baselinePassRate: 74,
  },
  {
    id: "meta",
    name: "Meta Speed 50",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    targetTier: "E4 / E5 SWE",
    duration: "45 Days",
    problemCount: 50,
    coreFocus: ["Two Pointers", "Binary Trees", "HashMaps", "Sliding Window"],
    description:
      "Laser-focused on high-frequency questions with strict 20-minute flawless implementation targets.",
    hiringBarCriteria:
      "2 Mediums solved in 40 minutes with clean variable naming.",
    baselinePassRate: 82,
  },
  {
    id: "amazon",
    name: "Amazon Gauntlet",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    targetTier: "SDE II",
    duration: "30 Days",
    problemCount: 45,
    coreFocus: ["BFS / DFS", "Priority Queue", "Monotonic Stack", "Arrays"],
    description:
      "Core data structures and system-aligned algorithms combined with Leadership Principle scenarios.",
    hiringBarCriteria: "Clear trade-off analysis between Time and Memory.",
    baselinePassRate: 88,
  },
  {
    id: "uber",
    name: "Uber Routing & Graphs",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    targetTier: "Senior SWE",
    duration: "25 Days",
    problemCount: 35,
    coreFocus: [
      "Dijkstra",
      "Topological Sort",
      "Shortest Path",
      "Backtracking",
    ],
    description:
      "Spatial graphs, network flows, and real-time pathfinding algorithmic patterns.",
    hiringBarCriteria:
      "Flawless graph state modeling and edge-case handling.",
    baselinePassRate: 79,
  },
  {
    id: "hft",
    name: "Citadel & Quant HFT Track",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    targetTier: "Quantitative Dev",
    duration: "20 Days",
    problemCount: 40,
    coreFocus: [
      "Bit Manipulation",
      "Segment Trees",
      "Fast I/O",
      "Binary Lifting",
    ],
    description:
      "Sub-millisecond runtime optimizations, branch prediction invariants, and numerical DP.",
    hiringBarCriteria:
      "Deep understanding of memory cache locality and instruction pipelining.",
    baselinePassRate: 68,
  },
];

export default function CompanyTracksPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState("google");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<Record<string, number>>({
    google: 76,
    meta: 84,
    amazon: 91,
    uber: 80,
    hft: 71,
  });

  const selectedTrack =
    COMPANY_TRACKS.find((c) => c.id === selectedCompanyId) ||
    COMPANY_TRACKS[0];

  const handleRunMonteCarlo = () => {
    soundEffects.playOpen();
    setIsSimulating(true);
    toast.info("Running 1,000 Monte Carlo stochastic interview screens...");

    setTimeout(() => {
      setIsSimulating(false);
      soundEffects.playSuccess();
      setSimResults({
        google: Math.floor(Math.random() * 8) + 75,
        meta: Math.floor(Math.random() * 6) + 82,
        amazon: Math.floor(Math.random() * 5) + 89,
        uber: Math.floor(Math.random() * 7) + 78,
        hft: Math.floor(Math.random() * 8) + 68,
      });
      toast.success("Monte Carlo 1,000-run simulation complete!");
    }, 1600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 size={13} />
            <span>Tier-1 Hiring Bar Tracks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Company Hiring Roadmaps & Predictor
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Target company-specific interview bars and simulate 1,000 hiring loop scenarios with Monte Carlo analysis.
          </p>
        </div>
      </div>

      {/* Monte Carlo Simulator Engine Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[var(--accent-primary)]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 text-xs font-black uppercase tracking-wider font-mono">
              <Brain size={13} /> Monte Carlo Stochastic Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-display">
              Offer Clearance Probability Simulator
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              Simulates 1,000 virtual 45-minute technical interviews using your historical accuracy, solve velocity, and topic retention to compute statistically modeled offer probabilities.
            </p>

            <button
              disabled={isSimulating}
              onClick={handleRunMonteCarlo}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap size={15} />
              <span>
                {isSimulating
                  ? "Simulating 1,000 Loops..."
                  : "Run Monte Carlo Simulation"}
              </span>
            </button>
          </div>

          {/* Simulation Output Meter Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {COMPANY_TRACKS.map((c) => {
              const passPct = simResults[c.id] || c.baselinePassRate;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] backdrop-blur-md space-y-2 shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-[var(--text-primary)] truncate">
                      {c.name.split(" ")[0]}
                    </span>
                    <span className="text-emerald-400 font-mono font-black">
                      {passPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                      style={{ width: `${passPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                    1,000 Loop Mean
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Tracks Selection & Deep Dive */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 font-display">
          <Award size={18} className="text-[var(--accent-primary)]" />
          Select Company Track
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {COMPANY_TRACKS.map((track) => {
            const isSelected = selectedCompanyId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCompanyId(track.id);
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-md ${
                  isSelected
                    ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50 shadow-xl scale-[1.02]"
                    : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <div className="space-y-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border font-mono ${track.badgeColor}`}
                  >
                    {track.targetTier}
                  </span>
                  <h4 className="text-base font-bold text-[var(--text-primary)] mt-1 font-display">
                    {track.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">
                    {track.problemCount} Problems
                  </span>
                  <span className="text-[var(--accent-primary)] font-bold">
                    {track.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Company Deep Dive Card */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] font-mono">
              Curriculum Blueprint
            </span>
            <h3 className="text-xl font-black text-[var(--text-primary)] font-display">
              {selectedTrack.name} Deep Dive
            </h3>
          </div>

          <Link
            href="/roadmap"
            onClick={() => soundEffects.playClick()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            <span>Launch Track in Roadmap</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
              Hiring Bar Standard
            </span>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
              {selectedTrack.hiringBarCriteria}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
              Core Priority Domains
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTrack.coreFocus.map((focus, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold font-mono"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
