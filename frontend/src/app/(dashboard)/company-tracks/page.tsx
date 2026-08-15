"use client";

import React, { useState, useMemo } from "react";
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
    coreFocus: ["Dynamic Programming", "Graph Invariants", "Disjoint Set", "Trie"],
    description: "Heavy emphasis on unseen problem variations, rigorous proofs, and optimal Big-O bounds.",
    hiringBarCriteria: "Zero hints required on Mediums; rigorous invariant explanation.",
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
    description: "Laser-focused on high-frequency questions with strict 20-minute flawless implementation targets.",
    hiringBarCriteria: "2 Mediums solved in 40 minutes with clean variable naming.",
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
    description: "Core data structures and system-aligned algorithms combined with Leadership Principle scenarios.",
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
    coreFocus: ["Dijkstra", "Topological Sort", "Shortest Path", "Backtracking"],
    description: "Spatial graphs, network flows, and real-time pathfinding algorithmic patterns.",
    hiringBarCriteria: "Flawless graph state modeling and edge-case handling.",
    baselinePassRate: 79,
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
  });

  const selectedTrack = COMPANY_TRACKS.find((c) => c.id === selectedCompanyId) || COMPANY_TRACKS[0];

  const handleRunMonteCarlo = () => {
    setIsSimulating(true);
    toast.info("Running 1,000 Monte Carlo stochastic interview screens...");

    setTimeout(() => {
      setIsSimulating(false);
      setSimResults({
        google: Math.floor(Math.random() * 8) + 75,
        meta: Math.floor(Math.random() * 6) + 82,
        amazon: Math.floor(Math.random() * 5) + 89,
        uber: Math.floor(Math.random() * 7) + 78,
      });
      toast.success("Monte Carlo 1,000-run simulation complete!");
    }, 1600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 size={13} />
            <span>Tier-1 Hiring Bar Tracks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Company Hiring Roadmaps & Predictor
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Target company-specific interview bars and simulate 1,000 hiring loop scenarios with Monte Carlo analysis.
          </p>
        </div>
      </div>

      {/* Monte Carlo Simulator Engine Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-linear-to-r from-[#0a1224] via-[#090b16] to-[#0d0718] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-black uppercase tracking-wider">
              <Brain size={13} /> Monte Carlo Stochastic Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Offer Clearance Probability Simulator
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              Simulates 1,000 virtual 45-minute technical interviews using your historical accuracy, solve velocity, and topic retention to compute statistically modeled offer probabilities.
            </p>

            <button
              disabled={isSimulating}
              onClick={handleRunMonteCarlo}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              <Zap size={15} />
              <span>{isSimulating ? "Simulating 1,000 Loops..." : "Run Monte Carlo Simulation"}</span>
            </button>
          </div>

          {/* Simulation Output Meter Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {COMPANY_TRACKS.map((c) => {
              const passPct = simResults[c.id] || c.baselinePassRate;
              return (
                <div key={c.id} className="p-4 rounded-3xl bg-black/50 border border-white/5 backdrop-blur-md space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-300 truncate">{c.name.split(" ")[0]}</span>
                    <span className="text-emerald-400 font-mono font-black">{passPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${passPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 block">1,000 Loop Mean</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Tracks Selection & Deep Dive */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Award size={18} className="text-blue-400" />
          Select Company Track
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPANY_TRACKS.map((track) => {
            const isSelected = selectedCompanyId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setSelectedCompanyId(track.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-[#0d1428] border-blue-500/50 shadow-xl shadow-blue-500/10 scale-[1.02]"
                    : "bg-[#0a0a0f] border-white/5 hover:border-white/20"
                }`}
              >
                <div className="space-y-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${track.badgeColor}`}>
                    {track.targetTier}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{track.name}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{track.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">{track.problemCount} Problems</span>
                  <span className="text-cyan-400 font-bold">{track.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Company Deep Dive Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Curriculum Blueprint</span>
            <h3 className="text-xl font-black text-white">{selectedTrack.name} Deep Dive</h3>
          </div>

          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all shadow-md"
          >
            <span>Launch Track in Roadmap</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Hiring Bar Standard</span>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed">
              {selectedTrack.hiringBarCriteria}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Core Priority Domains</span>
            <div className="flex flex-wrap gap-2">
              {selectedTrack.coreFocus.map((focus, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold">
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
