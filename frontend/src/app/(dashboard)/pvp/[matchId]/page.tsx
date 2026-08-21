"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
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
  Check,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface PvPBattleProps {
  params: Promise<{ matchId: string }>;
}

interface TestCase {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  runtime?: string;
  passed?: boolean;
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
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 1,
      input: 's = "abcabcbb"',
      expected: "3",
    },
    {
      id: 2,
      input: 's = "bbbbb"',
      expected: "1",
    },
    {
      id: 3,
      input: 's = "pwwkew"',
      expected: "3",
    },
    {
      id: 4,
      input: 's = ""',
      expected: "0",
    },
  ]);
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
    }, 8500);

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
    soundEffects.playClick();
    setIsRunning(true);
    toast.info("Executing test cases in sandbox...");

    setTimeout(() => {
      setIsRunning(false);
      setUserTestsPassed(testCases.length);
      setTestCases([
        {
          id: 1,
          input: 's = "abcabcbb"',
          expected: "3",
          actual: "3",
          runtime: "1.2ms",
          passed: true,
        },
        {
          id: 2,
          input: 's = "bbbbb"',
          expected: "1",
          actual: "1",
          runtime: "0.8ms",
          passed: true,
        },
        {
          id: 3,
          input: 's = "pwwkew"',
          expected: "3",
          actual: "3",
          runtime: "1.1ms",
          passed: true,
        },
        {
          id: 4,
          input: 's = ""',
          expected: "0",
          actual: "0",
          runtime: "0.4ms",
          passed: true,
        },
      ]);
      setMatchStatus("VICTORY");
      soundEffects.playSuccess();
      toast.success("All 4/4 Test Cases Passed! You Won the Match!");
    }, 1100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full min-w-0 space-y-4">
      {/* Top Duel Command Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/pvp"
            onClick={() => soundEffects.playClick()}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all border border-[var(--border-subtle)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider">
                1v1 Ranked Duel
              </span>
              <span className="text-xs text-[var(--text-muted)] font-bold">
                Medium Difficulty
              </span>
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)] font-display">
              Longest Substring Without Repeating Characters
            </h2>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-rose-500/30 text-rose-400 font-mono text-lg font-black shadow-inner">
          <Timer size={18} className="animate-pulse" />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Submit Solution Button */}
        <div className="flex items-center gap-3">
          <button
            disabled={isRunning || matchStatus !== "ACTIVE"}
            onClick={handleRunTests}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play size={14} />
            <span>{isRunning ? "Testing..." : "Submit Solution"}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column (8 cols): Monaco Editor & Test Drawer */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-2">
              <Code2 size={15} className="text-[var(--accent-primary)]" />
              <span>Your Solution (TypeScript)</span>
            </span>
            <span className="text-[var(--accent-primary)] font-mono">
              {userTestsPassed}/{testCases.length} Tests Passed
            </span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 w-full overflow-hidden bg-[var(--bg-primary)]">
            <Editor
              height="100%"
              theme="vs-dark"
              language="typescript"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 13.5,
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontLigatures: true,
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* Interactive Test Suite Results Drawer */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2 font-mono text-xs shrink-0 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Terminal size={12} className="text-[var(--accent-primary)]" />
                <span>Test Execution Sandbox</span>
              </div>
              <div className="flex items-center gap-1">
                {testCases.map((tc, idx) => (
                  <button
                    key={tc.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTestTab(idx);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeTestTab === idx
                        ? "bg-[var(--accent-primary)] text-black"
                        : tc.passed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    Test {tc.id} {tc.passed ? "✓" : ""}
                  </button>
                ))}
              </div>
            </div>

            {testCases[activeTestTab] && (
              <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">Input:</span>
                  <span className="text-[var(--text-primary)] font-bold">
                    {testCases[activeTestTab].input}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">Expected Output:</span>
                  <span className="text-emerald-400 font-bold">
                    {testCases[activeTestTab].expected}
                  </span>
                </div>
                {testCases[activeTestTab].actual && (
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Actual Output:</span>
                    <span className="text-emerald-400 font-bold">
                      {testCases[activeTestTab].actual} ({testCases[activeTestTab].runtime})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Live Opponent Radar & Momentum */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-5 shadow-xl overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Activity size={15} /> Opponent Progress Radar
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </div>
          </div>

          {/* Opponent Identity Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {opponentName}
              </h4>
              <span className="text-xs font-bold text-purple-400 font-mono">
                {opponentElo} ELO
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
              &quot;{opponentStatus}&quot;
            </p>
          </div>

          {/* Dual Momentum Health / Progress Meters */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[var(--text-muted)]">Your Momentum</span>
                <span className="text-emerald-400 font-mono">
                  {userTestsPassed} / {testCases.length} Tests
                </span>
              </div>
              <div className="w-full h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  style={{
                    width: `${(userTestsPassed / testCases.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[var(--text-muted)]">Opponent Tests Passed</span>
                <span className="text-purple-400 font-mono">
                  {opponentTestsPassed} / {testCases.length} Tests
                </span>
              </div>
              <div className="w-full h-2.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{
                    width: `${(opponentTestsPassed / testCases.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[var(--text-muted)]">Opponent Code Velocity</span>
                <span className="text-amber-400 font-mono">
                  {opponentLinesCount} lines typed
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (opponentLinesCount / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Problem Constraints Reference */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 flex-1 overflow-auto text-xs text-[var(--text-muted)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">
              Constraints & Target
            </span>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>0 ≤ s.length ≤ 5 × 10⁴</li>
              <li>s consists of English letters, digits, symbols and spaces.</li>
              <li>Target: O(N) Time, O(min(N, M)) Space.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Victory / Defeat Modal Overlay */}
      {matchStatus !== "ACTIVE" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
                matchStatus === "VICTORY"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10"
              }`}
            >
              {matchStatus === "VICTORY" ? (
                <Trophy size={40} />
              ) : (
                <AlertTriangle size={40} />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-display">
                {matchStatus === "VICTORY"
                  ? "GLADIATOR VICTORY!"
                  : "MATCH DEFEAT"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {matchStatus === "VICTORY"
                  ? "You solved all test cases before your opponent!"
                  : "Your opponent finished the test suite first."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-around font-mono text-sm">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-sans">
                  ELO Change
                </span>
                <div
                  className={`font-black ${
                    matchStatus === "VICTORY"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {matchStatus === "VICTORY" ? "+24 ELO" : "-16 ELO"}
                </div>
              </div>
              <div className="w-px h-8 bg-[var(--border-subtle)]" />
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-sans">
                  New Rating
                </span>
                <div className="font-black text-[var(--text-primary)]">
                  {matchStatus === "VICTORY" ? "1,914 ELO" : "1,874 ELO"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/pvp"
                onClick={() => soundEffects.playClick()}
                className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-black font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
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
