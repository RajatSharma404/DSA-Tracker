"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { dsaApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  PanelRightOpen,
  PanelRightClose,
  Tag,
  Cpu,
  Flame,
  Zap,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

const CodeEditor = dynamic(
  () =>
    import("@/components/dashboard/CodeEditor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-96 animate-pulse rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

export default function ChallengeSimulator() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [totalDurationSecs, setTotalDurationSecs] = useState(2700);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activeProblem, setActiveProblem] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const [problemContent, setProblemContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await dsaApi.getChallenge(id as string);
        setSession(data);
        const durationSecs = (data.duration || 45) * 60;
        setTotalDurationSecs(durationSecs);
        const startTime = new Date(data.startTime).getTime();
        const durationMs = durationSecs * 1000;
        const now = new Date().getTime();
        const remaining = Math.max(
          0,
          Math.floor((startTime + durationMs - now) / 1000),
        );

        if (data.status !== "IN_PROGRESS") {
          setIsFinished(true);
        } else {
          setTimeLeft(remaining);
        }
      } catch (err) {
        router.push("/challenge");
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish("FAILED");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isFinished]);

  useEffect(() => {
    async function loadContent() {
      if (!session?.problems?.length) return;

      const currentProblem = session.problems[activeProblem];
      if (!currentProblem?.link) {
        setProblemContent("<p>No description available.</p>");
        return;
      }

      try {
        setLoadingContent(true);
        const match = currentProblem.link.match(/problems\/([^/]+)/);

        if (!match?.[1]) {
          setProblemContent("<p>No description available.</p>");
          return;
        }

        const details = await dsaApi.getProblemDetails(match[1]);
        setProblemContent(
          details?.content ||
            details?.question ||
            "<p>No description available.</p>",
        );
      } catch {
        setProblemContent("<p>Failed to load description.</p>");
      } finally {
        setLoadingContent(false);
      }
    }

    loadContent();
  }, [session, activeProblem]);

  useEffect(() => {
    if (!isResizingPanel) return;

    const handleMove = (event: MouseEvent) => {
      if (!mainAreaRef.current) return;

      const rect = mainAreaRef.current.getBoundingClientRect();
      const proposed = rect.right - event.clientX;
      const minWidth = 300;
      const maxWidth = Math.min(700, rect.width - 320);
      const clamped = Math.max(minWidth, Math.min(maxWidth, proposed));
      setPanelWidth(clamped);
    };

    const handleUp = () => {
      setIsResizingPanel(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizingPanel]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFinish = async (status: "COMPLETED" | "FAILED") => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === "COMPLETED") {
      soundEffects.playSuccess();
    } else {
      soundEffects.playClick();
    }
    try {
      await dsaApi.completeChallenge(id as string, status);
    } catch (err) {
      console.error(err);
    }
  };

  if (!session)
    return (
      <div className="space-y-6 animate-pulse bg-[var(--bg-primary)] -m-6 md:-m-10 p-6 md:p-10 min-h-screen">
        <div className="h-10 w-72 rounded-xl bg-[var(--bg-secondary)]" />
        <div className="h-16 rounded-2xl bg-[var(--bg-secondary)]" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="h-[70vh] rounded-4xl bg-[var(--bg-secondary)]" />
          <div className="h-[70vh] rounded-4xl bg-[var(--bg-secondary)]" />
        </div>
      </div>
    );

  const prob = session.problems[activeProblem];
  const isUrgent = timeLeft < 60 && !isFinished;
  const isWarning = timeLeft < 180 && !isFinished;

  // Circular timer calculation
  const progressRatio = totalDurationSecs > 0 ? timeLeft / totalDurationSecs : 0;
  const strokeDash = 2 * Math.PI * 18;
  const strokeOffset = strokeDash * (1 - progressRatio);

  return (
    <div
      className="bg-[var(--bg-primary)] -m-6 md:-m-10 flex flex-col overflow-hidden relative"
      style={{ height: "100vh" }}
    >
      {/* Pressure pulse overlay */}
      {isUrgent && (
        <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none z-0" />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-6 py-3 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] backdrop-blur-xl z-10">
        {/* Left: branding */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-primary)]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight font-display">
              Arena Pressure Room
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase font-mono">
              Speed & Precision Mode
            </p>
          </div>
        </div>

        {/* Center: problem tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-1">
          {session.problems.map((p: any, idx: number) => (
            <button
              key={p.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveProblem(idx);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-mono ${
                activeProblem === idx
                  ? "bg-[var(--accent-primary)] text-black shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              P{idx + 1}
            </button>
          ))}
        </div>

        {/* Right: timer + actions */}
        <div className="flex items-center gap-3">
          {/* Circular SVG Pomodoro Timer */}
          <div
            className={`flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border font-black tabular-nums text-sm font-mono transition-all ${
              isUrgent
                ? "border-rose-500/50 bg-rose-500/10 text-rose-400 animate-pulse"
                : isWarning
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
            }`}
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.2"
                  strokeWidth="4"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={strokeDash}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <Timer size={12} className="absolute text-current" />
            </div>
            <span className="text-base">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => handleFinish("COMPLETED")}
            disabled={isFinished}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <CheckCircle2 size={15} />
            <span>Submit</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              router.push("/challenge");
            }}
            className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold rounded-xl border border-[var(--border-subtle)] transition-all cursor-pointer"
          >
            Exit
          </button>

          {/* Hamburger — problem panel toggle */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setShowPanel((v) => !v);
            }}
            title={showPanel ? "Hide problem panel" : "Show problem panel"}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showPanel
                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
                : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {showPanel ? (
              <PanelRightClose size={18} />
            ) : (
              <PanelRightOpen size={18} />
            )}
          </button>
        </div>
      </header>

      {/* ── MAIN AREA ────────────────────────────────────────────── */}
      <div
        ref={mainAreaRef}
        className={`flex-1 flex overflow-hidden relative z-10 ${
          isResizingPanel ? "select-none" : ""
        }`}
      >
        {/* Code Editor — full width, slides when panel open */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {isFinished ? (
            /* ── RESULT SCREEN ── */
            <div className="flex-1 flex items-center justify-center p-10 bg-[var(--bg-primary)]">
              <div
                className={`max-w-lg w-full p-10 rounded-[3rem] text-center space-y-6 shadow-2xl ${
                  session.status === "COMPLETED"
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-rose-500/10 border border-rose-500/30"
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xl ${
                    session.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10"
                  }`}
                >
                  {session.status === "COMPLETED" ? (
                    <Trophy size={40} />
                  ) : (
                    <XCircle size={40} />
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-tight font-display">
                    {session.status === "COMPLETED"
                      ? "Challenge Conquered!"
                      : "Time Limit Exceeded"}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {session.status === "COMPLETED"
                      ? "Flawless execution. You maintained composure under severe pressure."
                      : "The clock won this round. Review your invariants and try again."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-around font-mono text-sm">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-sans">
                      Performance ELO
                    </span>
                    <div
                      className={`font-black ${
                        session.status === "COMPLETED"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {session.status === "COMPLETED" ? "+32 ELO" : "-12 ELO"}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-[var(--border-subtle)]" />
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-sans">
                      Speed Bonus
                    </span>
                    <div className="font-black text-amber-400">
                      {session.status === "COMPLETED" ? "1.5x Multiplier" : "0x"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/challenge")}
                  className="px-8 py-3.5 bg-[var(--accent-primary)] text-black font-extrabold uppercase text-xs rounded-2xl hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  Continue Arena Training
                </button>
              </div>
            </div>
          ) : (
            /* ── EDITOR ── */
            <div className="flex-1 p-4 overflow-hidden">
              <CodeEditor
                key={prob.id}
                initialCode={`// Problem: ${prob.title}\n// Topic: ${
                  prob.topic?.name ?? ""
                }\n\nfunction solve() {\n  // Write your logic here\n  \n}\n\nconsole.log(solve());`}
                layout="vertical"
                className="h-full rounded-3xl"
              />
            </div>
          )}

          {/* Warning banner */}
          {isWarning && !isUrgent && (
            <div className="shrink-0 mx-4 mb-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400">
              <AlertTriangle size={18} />
              <p className="text-xs font-black uppercase tracking-wider font-mono">
                Less than 3 minutes remaining — wrap up your test cases!
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT PROBLEM PANEL ──────────────────────────────── */}
        {showPanel && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize problem panel"
            onMouseDown={() => setIsResizingPanel(true)}
            className="group shrink-0 w-1 cursor-col-resize bg-[var(--border-subtle)] hover:bg-[var(--accent-primary)] active:bg-[var(--accent-primary)] transition-colors"
          >
            <div className="h-full w-full opacity-0 group-hover:opacity-100 bg-[var(--accent-primary)]/20" />
          </div>
        )}

        <aside
          className={`shrink-0 overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-300 ease-in-out ${
            showPanel ? "" : "w-0 overflow-hidden border-none"
          }`}
          style={showPanel ? { width: `${panelWidth}px` } : undefined}
        >
          {showPanel && prob && (
            <div
              className="p-6 space-y-6"
              style={{ minWidth: `${panelWidth}px` }}
            >
              {/* Problem header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border-subtle)] font-mono">
                    Problem {activeProblem + 1} / {session.problems.length}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded border font-mono ${
                      prob.difficulty === "EASY"
                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                        : prob.difficulty === "MEDIUM"
                          ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                          : "text-rose-400 border-rose-500/20 bg-rose-500/10"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] leading-tight font-display">
                  {prob.title}
                </h2>
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Tag size={14} className="text-[var(--accent-primary)]" />
                  <span>{prob.topic?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Cpu size={14} className="text-purple-400" />
                  <span>Speed Challenge Problem</span>
                </div>
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              {/* Problem description */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                  Description
                </p>
                {loadingContent ? (
                  <div className="h-32 animate-pulse rounded-xl bg-[var(--bg-secondary)]" />
                ) : (
                  <div
                    className="custom-scrollbar max-h-75 overflow-y-auto pr-2 text-sm text-[var(--text-secondary)] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        problemContent || "<p>No description available.</p>",
                    }}
                  />
                )}
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              {/* Problem list nav */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono">
                  All Problems
                </p>
                {session.problems.map((p: any, idx: number) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveProblem(idx);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all text-sm cursor-pointer ${
                      activeProblem === idx
                        ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 text-[var(--text-primary)] font-bold shadow-xs"
                        : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{p.title}</span>
                      <span
                        className={`text-[10px] font-black uppercase ml-2 shrink-0 font-mono ${
                          p.difficulty === "EASY"
                            ? "text-emerald-400"
                            : p.difficulty === "MEDIUM"
                              ? "text-amber-400"
                              : "text-rose-400"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {p.topic?.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              {/* LeetCode link */}
              <a
                href={prob.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-sm font-bold hover:bg-[var(--accent-primary)]/20 transition-all cursor-pointer"
              >
                <span>Open on LeetCode</span>
                <ExternalLink size={15} />
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
