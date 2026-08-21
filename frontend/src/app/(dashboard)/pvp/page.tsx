"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  Trophy,
  Zap,
  Skull,
  Crown,
  Users,
  Shield,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Award,
  Search,
  Radar,
  Radio,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface MatchHistoryItem {
  id: string;
  opponent: string;
  opponentElo: number;
  problem: string;
  result: "VICTORY" | "DEFEAT";
  eloChange: number;
  timeSpent: string;
  date: string;
}

interface LeaderboardGladiator {
  rank: number;
  name: string;
  company: string;
  elo: number;
  tier: "Grandmaster" | "Master" | "Diamond" | "Platinum";
  winRate: string;
  streak: number;
}

const DUEL_MODES = [
  {
    id: "blitz",
    name: "1v1 Speed Duel",
    duration: "15 Mins",
    desc: "First to solve all test cases wins. High tempo and fast algorithmic recognition.",
    icon: Zap,
    badge: "Fast Pace",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    eloMultiplier: "1.2x ELO",
  },
  {
    id: "ranked",
    name: "1v1 Ranked Competitive",
    duration: "30 Mins",
    desc: "Medium & Hard problems. Strict runtime checks with tiebreakers by execution time.",
    icon: Swords,
    badge: "Ranked Match",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    eloMultiplier: "1.5x ELO",
  },
  {
    id: "deathmatch",
    name: "Sudden Death Match",
    duration: "25 Mins",
    desc: "Single submission allowed. First wrong answer forfeits the match immediately.",
    icon: Skull,
    badge: "Hardcore",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    eloMultiplier: "2.0x ELO",
  },
];

const LEADERBOARD_DATA: LeaderboardGladiator[] = [
  {
    rank: 1,
    name: "Alexey V. (DeepMind)",
    company: "Google DeepMind",
    elo: 2450,
    tier: "Grandmaster",
    winRate: "92.4%",
    streak: 18,
  },
  {
    rank: 2,
    name: "Elena Rostova",
    company: "Jane Street",
    elo: 2380,
    tier: "Grandmaster",
    winRate: "89.1%",
    streak: 12,
  },
  {
    rank: 3,
    name: "Marcus Aurelius",
    company: "Meta",
    elo: 2290,
    tier: "Master",
    winRate: "85.7%",
    streak: 8,
  },
  {
    rank: 4,
    name: "Priya Sharma",
    company: "Uber",
    elo: 2185,
    tier: "Master",
    winRate: "82.0%",
    streak: 6,
  },
  {
    rank: 5,
    name: "David Kim",
    company: "Stripe",
    elo: 2095,
    tier: "Diamond",
    winRate: "78.5%",
    streak: 5,
  },
];

export default function PvPMainPage() {
  const router = useRouter();
  const [matchingMode, setMatchingMode] = useState<string | null>(null);
  const [matchmakingSecs, setMatchmakingSecs] = useState(0);
  const [userElo, setUserElo] = useState(1890);
  const [activeTab, setActiveTab] = useState<"history" | "leaderboard">("history");

  useEffect(() => {
    const savedElo = window.localStorage.getItem("dsa_pvp_elo");
    if (savedElo) setUserElo(Number(savedElo) || 1890);
  }, []);

  // Matchmaking timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (matchingMode) {
      timer = setInterval(() => {
        setMatchmakingSecs((prev) => prev + 1);
      }, 1000);
    } else {
      setMatchmakingSecs(0);
    }
    return () => clearInterval(timer);
  }, [matchingMode]);

  const handleStartMatchmaking = (modeId: string) => {
    soundEffects.playOpen();
    setMatchingMode(modeId);
    toast.info("Entering matchmaking queue... Searching for ranked opponent");

    // Simulate match finding after 3.2 seconds
    setTimeout(() => {
      const matchId = `match_${Date.now()}`;
      soundEffects.playSuccess();
      toast.success("Opponent found! Entering Gladiator Colosseum...");
      router.push(`/pvp/${matchId}?mode=${modeId}`);
    }, 3200);
  };

  const handleCancelQueue = () => {
    soundEffects.playClick();
    setMatchingMode(null);
    toast.info("Matchmaking queue cancelled");
  };

  const matchHistory: MatchHistoryItem[] = [
    {
      id: "1",
      opponent: "Alex Chen (Meta)",
      opponentElo: 1910,
      problem: "Longest Substring Without Repeating Characters",
      result: "VICTORY",
      eloChange: +24,
      timeSpent: "7m 42s",
      date: "Today",
    },
    {
      id: "2",
      opponent: "Sarah K. (Google)",
      opponentElo: 1875,
      problem: "Course Schedule II (Topological Sort)",
      result: "VICTORY",
      eloChange: +18,
      timeSpent: "14m 10s",
      date: "Yesterday",
    },
    {
      id: "3",
      opponent: "Vikram R. (Amazon)",
      opponentElo: 1940,
      problem: "Trapping Rain Water (Two Pointers)",
      result: "DEFEAT",
      eloChange: -15,
      timeSpent: "21m 05s",
      date: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Swords size={13} />
            <span>Gladiator Colosseum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            1v1 PvP Ranked Battles
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Duel other developers in real time on identical coding challenges. Climb the global ELO ladder.
          </p>
        </div>
      </div>

      {/* Hero ELO Status Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* ELO Rank Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-rose-500/10">
                <Crown size={32} />
              </div>
              <div>
                <div className="text-xs uppercase font-black tracking-widest text-rose-400 font-mono">
                  Diamond Tier II • Top 4%
                </div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] font-display">
                  {userElo} ELO Rating
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Record
                </span>
                <div className="text-xl font-black text-emerald-400 mt-0.5 font-display">
                  32W - 8L
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Win Rate
                </span>
                <div className="text-xl font-black text-[var(--accent-primary)] mt-0.5 font-display">
                  80.0%
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Streak
                </span>
                <div className="text-xl font-black text-amber-400 mt-0.5 font-display">
                  🔥 5 Win
                </div>
              </div>
            </div>
          </div>

          {/* Quick Queue Status */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] backdrop-blur-md space-y-4 text-center relative overflow-hidden">
            {matchingMode ? (
              <div className="space-y-4 py-3 flex flex-col items-center">
                {/* Circular Radar Sweep Animation */}
                <div className="relative w-28 h-28 rounded-full border border-rose-500/40 bg-black/40 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-2 rounded-full border border-rose-500/20" />
                  <div className="absolute inset-6 rounded-full border border-rose-500/10" />
                  <div className="absolute w-full h-0.5 bg-rose-500/20" />
                  <div className="absolute h-full w-0.5 bg-rose-500/20" />
                  {/* Rotating Beam */}
                  <div
                    className="absolute inset-0 origin-center animate-spin"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(244, 63, 94, 0.4) 360deg)",
                      animationDuration: "2s",
                    }}
                  />
                  {/* Target Blip */}
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Scanning Colosseum Frequency...
                  </h4>
                  <p className="text-xs font-mono text-[var(--text-muted)]">
                    Queue: {matchmakingSecs}s • ELO Bracket ±50
                  </p>
                </div>

                <button
                  onClick={handleCancelQueue}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold transition-all cursor-pointer"
                >
                  <X size={13} />
                  <span>Cancel Matchmaking</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>248 Gladiators Online in Arena</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Ready for Ranked Battle?
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Choose a match mode below to enter instant ranked matchmaking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duel Modes Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 font-display">
          <Shield size={18} className="text-rose-400" />
          Choose Arena Match Format
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUEL_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-rose-500/30 hover:bg-[var(--bg-hover)] transition-all flex flex-col justify-between space-y-4 shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] text-rose-400 border border-[var(--border-subtle)] group-hover:bg-rose-500/20 transition-colors">
                      <Icon size={22} />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${mode.badgeColor}`}
                    >
                      {mode.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-rose-400 transition-colors font-display">
                      {mode.name}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {mode.duration}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {mode.eloMultiplier}
                  </span>
                  <button
                    disabled={!!matchingMode}
                    onClick={() => handleStartMatchmaking(mode.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>Enter Duel</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs: Recent Duel History vs Global Leaderboard */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab("history");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[var(--accent-primary)] text-black"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Recent Duel History
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab("leaderboard");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-[var(--accent-primary)] text-black"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Colosseum Leaderboard
            </button>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Updated live
          </span>
        </div>

        {activeTab === "history" ? (
          <div className="space-y-3">
            {matchHistory.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-[var(--border-medium)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        m.result === "VICTORY"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {m.result}
                    </span>
                    <span className="text-xs text-[var(--text-primary)] font-bold">
                      {m.opponent} ({m.opponentElo} ELO)
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-medium">
                    {m.problem}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[var(--text-muted)]">{m.timeSpent}</span>
                  <span
                    className={`font-bold flex items-center ${
                      m.eloChange > 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {m.eloChange > 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {m.eloChange > 0 ? `+${m.eloChange}` : m.eloChange} ELO
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px] font-sans">
                    {m.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Gladiator</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3 text-right">ELO</th>
                  <th className="py-2.5 px-3 text-right">Win Rate</th>
                  <th className="py-2.5 px-3 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {LEADERBOARD_DATA.map((lead) => (
                  <tr
                    key={lead.rank}
                    className="hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <td className="py-3 px-3 font-bold">
                      {lead.rank === 1 ? (
                        <span className="text-amber-400 font-black">🥇 #1</span>
                      ) : lead.rank === 2 ? (
                        <span className="text-slate-300 font-black">🥈 #2</span>
                      ) : lead.rank === 3 ? (
                        <span className="text-amber-600 font-black">🥉 #3</span>
                      ) : (
                        `#${lead.rank}`
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                      <div>{lead.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-normal">
                        {lead.company}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {lead.tier}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[var(--accent-primary)]">
                      {lead.elo}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {lead.winRate}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400 font-bold">
                      🔥 {lead.streak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
