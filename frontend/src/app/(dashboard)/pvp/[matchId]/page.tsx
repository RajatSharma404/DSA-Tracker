"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Swords,
  Timer,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Crown,
  Trophy,
  ArrowLeft,
  Zap,
  Activity,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface PvPBattleProps {
  params: Promise<{ matchId: string }>;
}

export default function PvPMatchBattlePage({ params }: PvPBattleProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Match State
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [code, setCode] = useState(`function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0;
  let left = 0;
  const charMap = new Map<string, number>();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (charMap.has(char) && charMap.get(char)! >= left) {
      left = charMap.get(char)! + 1;
    }
    charMap.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}`);

  const [isRunning, setIsRunning] = useState(false);
  const [userTestsPassed, setUserTestsPassed] = useState(0);
  const [totalTests] = useState(4);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [matchStatus, setMatchStatus] = useState<"ACTIVE" | "VICTORY" | "DEFEAT">("ACTIVE");

  // Opponent Live Simulation
  const [opponentName] = useState("Alex Chen (Meta Senior Lead)");
  const [opponentElo] = useState(1910);
  const [opponentTestsPassed, setOpponentTestsPassed] = useState(1);
  const [opponentLinesCount, setOpponentLinesCount] = useState(12);
  const [opponentStatus, setOpponentStatus] = useState("Analyzing constraints & edge cases...");

  // Timer countdown
  useEffect(() => {
    if (matchStatus !== "ACTIVE") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMatchStatus("DEFEAT");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchStatus]);

  // Opponent live progress events
  useEffect(() => {
    if (matchStatus !== "ACTIVE") return;

    const t1 = setTimeout(() => {
      setOpponentStatus("Implementing HashMap window tracker...");
      setOpponentLinesCount(18);
    }, 4000);

    const t2 = setTimeout(() => {
      setOpponentStatus("Running sample test cases...");
      setOpponentTestsPassed(2);
    }, 8000);

    const t3 = setTimeout(() => {
      setOpponentStatus("Optimizing two-pointer loop invariant...");
      setOpponentLinesCount(24);
    }, 14000);

    const t4 = setTimeout(() => {
      setOpponentStatus("Running full test suite [3/4 Passed]...");
      setOpponentTestsPassed(3);
    }, 22000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [matchStatus]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleRunTests = () => {
    setIsRunning(true);
    toast.info("Executing test cases in sandbox...");

    setTimeout(() => {
      setIsRunning(false);
      setUserTestsPassed(totalTests);
      setTestResults([
        "✓ Test 1: s = 'abcabcbb' -> Output: 3 (Expected: 3)",
        "✓ Test 2: s = 'bbbbb' -> Output: 1 (Expected: 1)",
        "✓ Test 3: s = 'pwwkew' -> Output: 3 (Expected: 3)",
        "✓ Test 4: s = '' -> Output: 0 (Expected: 0)",
      ]);
      setMatchStatus("VICTORY");
      toast.success("All 4/4 Test Cases Passed! You Won the Match!");
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full min-w-0 space-y-4">
      {/* Top Duel Command Bar */}
      <div className="p-4 rounded-3xl bg-[#0c0c14] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/pvp"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                1v1 Ranked Duel
              </span>
              <span className="text-xs text-gray-400 font-bold">Medium Difficulty</span>
            </div>
            <h2 className="text-base font-black text-white">Longest Substring Without Repeating Characters</h2>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 border border-red-500/30 text-red-400 font-mono text-lg font-black shadow-inner">
          <Timer size={18} className="animate-pulse" />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            disabled={isRunning || matchStatus !== "ACTIVE"}
            onClick={handleRunTests}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <Play size={14} />
            <span>{isRunning ? "Testing..." : "Submit Solution"}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column (7 cols): Code Editor & Sandbox */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-white/10 bg-[#08080e] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-2">
              <Code2 size={15} className="text-cyan-400" /> Your Solution (TypeScript)
            </span>
            <span className="text-cyan-400 font-mono">{userTestsPassed}/{totalTests} Tests Passed</span>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-gray-200 outline-none resize-none font-mono leading-relaxed selection:bg-cyan-500/30"
              spellCheck={false}
            />
          </div>

          {/* Test Results Output Drawer */}
          {testResults.length > 0 && (
            <div className="p-4 border-t border-white/10 bg-black/60 space-y-1.5 font-mono text-xs text-emerald-400">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <Terminal size={12} /> Execution Sandbox Log
              </div>
              {testResults.map((res, i) => (
                <div key={i} className="text-emerald-300 font-medium">{res}</div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Live Opponent Radar */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl border border-white/10 bg-[#0c0c14] p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <Activity size={15} /> Opponent Progress Radar
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </div>
          </div>

          {/* Opponent Identity Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{opponentName}</h4>
              <span className="text-xs font-bold text-purple-400">{opponentElo} ELO</span>
            </div>
            <p className="text-xs text-gray-400 italic leading-relaxed">
              &quot;{opponentStatus}&quot;
            </p>
          </div>

          {/* Live Opponent Metrics */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Opponent Tests Passed</span>
                <span className="text-purple-400">{opponentTestsPassed} / {totalTests}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${(opponentTestsPassed / totalTests) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400">Code Velocity</span>
                <span className="text-amber-400">{opponentLinesCount} lines typed</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (opponentLinesCount / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Problem Constraints Reference */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 flex-1 overflow-auto text-xs text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">Constraints</span>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>0 &le; s.length &le; 5 &times; 10⁴</li>
              <li>s consists of English letters, digits, symbols and spaces.</li>
              <li>Target Complexity: O(N) Time, O(min(N, M)) Space.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal Overlay */}
      {matchStatus !== "ACTIVE" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-[#0e0c18] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
              matchStatus === "VICTORY"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                : "bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/10"
            }`}>
              {matchStatus === "VICTORY" ? <Trophy size={40} /> : <AlertTriangle size={40} />}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {matchStatus === "VICTORY" ? "GLADIATOR VICTORY!" : "MATCH DEFEAT"}
              </h3>
              <p className="text-xs text-gray-400">
                {matchStatus === "VICTORY"
                  ? "You solved all test cases before your opponent!"
                  : "Your opponent finished the test suite first."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-around font-mono text-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-sans">ELO Change</span>
                <div className={`font-black ${matchStatus === "VICTORY" ? "text-emerald-400" : "text-red-400"}`}>
                  {matchStatus === "VICTORY" ? "+24 ELO" : "-16 ELO"}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-sans">New Rank</span>
                <div className="font-black text-white">
                  {matchStatus === "VICTORY" ? "1,914 ELO" : "1,874 ELO"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/pvp"
                className="px-6 py-3 rounded-2xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all shadow-md"
              >
                Back to Colosseum
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
