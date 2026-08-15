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
} from "lucide-react";
import { toast } from "sonner";

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

const DUEL_MODES = [
  {
    id: "blitz",
    name: "1v1 Speed Duel",
    duration: "15 Mins",
    desc: "First to solve all test cases wins. High tempo and fast pattern recognition.",
    icon: Zap,
    badge: "Fast Pace",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    eloMultiplier: "1.2x ELO",
  },
  {
    id: "ranked",
    name: "1v1 Ranked Competitive",
    duration: "30 Mins",
    desc: "Medium & Hard problems. Strict runtime checks and tiebreaker by execution speed.",
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
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    eloMultiplier: "2.0x ELO",
  },
];

export default function PvPMainPage() {
  const router = useRouter();
  const [matchingMode, setMatchingMode] = useState<string | null>(null);
  const [matchmakingSecs, setMatchmakingSecs] = useState(0);
  const [userElo, setUserElo] = useState(1890);

  useEffect(() => {
    const savedElo = window.localStorage.getItem("dsa_pvp_elo");
    if (savedElo) setUserElo(Number(savedElo) || 1890);
  }, []);

  // Matchmaking timer
  useEffect(() => {
    let timer: any;
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
    setMatchingMode(modeId);
    toast.info("Entering matchmaking queue... Searching for ranked opponent");

    // Simulate match finding after 3 seconds
    setTimeout(() => {
      const matchId = `match_${Date.now()}`;
      toast.success("Opponent found! Entering Gladiator Colosseum...");
      router.push(`/pvp/${matchId}?mode=${modeId}`);
    }, 2800);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Swords size={13} />
            <span>Gladiator Colosseum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            1v1 PvP Ranked Battles
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Duel other developers in real-time on identical coding challenges. Climb the global ELO ladder.
          </p>
        </div>
      </div>

      {/* Hero ELO Status Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-linear-to-r from-[#180909] via-[#0d0a14] to-[#070914] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-red-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* ELO Rank Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-red-500/30 to-amber-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-red-500/10">
                <Crown size={32} />
              </div>
              <div>
                <div className="text-xs uppercase font-black tracking-widest text-red-400">
                  Diamond Tier II • Top 4%
                </div>
                <h2 className="text-3xl font-black text-white">{userElo} ELO Rating</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Record</span>
                <div className="text-xl font-black text-emerald-400 mt-0.5">32W - 8L</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Win Rate</span>
                <div className="text-xl font-black text-cyan-400 mt-0.5">80.0%</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Streak</span>
                <div className="text-xl font-black text-amber-400 mt-0.5">🔥 5 Win</div>
              </div>
            </div>
          </div>

          {/* Quick Queue Status */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-md space-y-4 text-center">
            {matchingMode ? (
              <div className="space-y-3 py-2">
                <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Searching for Worthy Opponent...</h4>
                <p className="text-xs text-gray-400">Queue Time: {matchmakingSecs}s • ELO Bracket ±50</p>
                <button
                  onClick={() => setMatchingMode(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Queue
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>248 Gladiators Online in Arena</span>
                </div>
                <h3 className="text-base font-bold text-white">Ready for Ranked Battle?</h3>
                <p className="text-xs text-gray-400">
                  Choose a match mode below to enter instant ranked matchmaking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duel Modes Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Shield size={18} className="text-red-400" />
          Choose Arena Match Format
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUEL_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className="p-6 rounded-3xl border border-white/5 bg-[#0a0a0f] hover:border-red-500/30 hover:bg-[#100b12] transition-all flex flex-col justify-between space-y-4 shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-white/5 text-red-400 border border-white/5 group-hover:bg-red-500/20 transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                      {mode.name}
                    </h4>
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {mode.duration}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">{mode.eloMultiplier}</span>
                  <button
                    disabled={!!matchingMode}
                    onClick={() => handleStartMatchmaking(mode.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
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

      {/* Match History Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          Recent Duel History
        </h3>

        <div className="space-y-3">
          {matchHistory.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    m.result === "VICTORY"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {m.result}
                  </span>
                  <span className="text-xs text-white font-bold">{m.opponent} ({m.opponentElo} ELO)</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">{m.problem}</div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-gray-500">{m.timeSpent}</span>
                <span className={`font-bold flex items-center ${m.eloChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {m.eloChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {m.eloChange > 0 ? `+${m.eloChange}` : m.eloChange} ELO
                </span>
                <span className="text-gray-500 text-[11px] font-sans">{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
