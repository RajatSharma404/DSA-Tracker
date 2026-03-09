"use client";

import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import { CodeEditor } from "@/components/dashboard/CodeEditor";

export default function ChallengeSimulator() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activeProblem, setActiveProblem] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await dsaApi.getChallenge(id as string);
        setSession(data);
        const startTime = new Date(data.startTime).getTime();
        const durationMs = data.duration * 60 * 1000;
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFinish = async (status: "COMPLETED" | "FAILED") => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await dsaApi.completeChallenge(id as string, status);
      alert(
        status === "COMPLETED"
          ? "Challenge successfully completed!"
          : "Time is up! Challenge failed.",
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!session)
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-[#050505] -m-6 md:-m-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white" />
      </div>
    );

  const prob = session.problems[activeProblem];
  const isUrgent = timeLeft < 60 && !isFinished;
  const isWarning = timeLeft < 180 && !isFinished;

  return (
    <div
      className="bg-[#050505] -m-6 md:-m-10 flex flex-col overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Pressure pulse overlay */}
      {isUrgent && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none z-0" />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-6 py-3 bg-[#0d0d0d] border-b border-white/5 backdrop-blur-xl z-10">
        {/* Left: branding */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">
              Active Session
            </p>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
              FAANG Simulation
            </p>
          </div>
        </div>

        {/* Center: problem tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
          {session.problems.map((p: any, idx: number) => (
            <button
              key={p.id}
              onClick={() => setActiveProblem(idx)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeProblem === idx
                  ? "bg-white text-black shadow"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              P{idx + 1}
            </button>
          ))}
        </div>

        {/* Right: timer + actions */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-black tabular-nums text-lg transition-all ${
              isUrgent
                ? "border-red-500/50 bg-red-500/10 text-red-500"
                : isWarning
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
            }`}
          >
            <Timer size={18} className={isUrgent ? "animate-bounce" : ""} />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleFinish("COMPLETED")}
            disabled={isFinished}
            className="px-5 py-2 bg-green-500 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-green-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} /> Submit
          </button>

          <button
            onClick={() => router.push("/challenge")}
            className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Exit
          </button>

          {/* Hamburger — problem panel toggle */}
          <button
            onClick={() => setShowPanel((v) => !v)}
            title={showPanel ? "Hide problem" : "Show problem"}
            className={`p-2 rounded-xl border transition-all ${
              showPanel
                ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
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
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Code Editor — full width, slides when panel open */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {isFinished ? (
            /* ── RESULT SCREEN ── */
            <div className="flex-1 flex items-center justify-center p-10">
              <div
                className={`max-w-lg w-full p-10 rounded-[3rem] text-center space-y-6 ${
                  session.status === "COMPLETED"
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div className="inline-flex p-5 rounded-full bg-white/5">
                  {session.status === "COMPLETED" ? (
                    <CheckCircle2 size={64} className="text-green-500" />
                  ) : (
                    <XCircle size={64} className="text-red-500" />
                  )}
                </div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                  Challenge {session.status}
                </h2>
                <p className="text-gray-400">
                  {session.status === "COMPLETED"
                    ? "Impressive focus. You handled the pressure and solved the assigned tasks."
                    : "The clock won this round. Use the Spaced Repetition engine to master these topics and try again."}
                </p>
                <button
                  onClick={() => router.push("/challenge")}
                  className="px-10 py-4 bg-white text-black font-black uppercase rounded-2xl hover:scale-105 transition-all"
                >
                  Continue Training
                </button>
              </div>
            </div>
          ) : (
            /* ── EDITOR ── */
            <div className="flex-1 p-4 overflow-hidden">
              <CodeEditor
                key={prob.id}
                initialCode={`// Problem: ${prob.title}\n// Topic: ${prob.topic?.name ?? ""}\n\nfunction solve() {\n  // Write your logic here\n  \n}\n\nconsole.log(solve());`}
                className="h-full rounded-[1.5rem]"
              />
            </div>
          )}

          {/* Warning banner */}
          {isWarning && !isUrgent && (
            <div className="shrink-0 mx-4 mb-3 px-5 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 text-orange-400">
              <AlertTriangle size={18} />
              <p className="text-xs font-black uppercase tracking-wider">
                Less than 3 minutes — finish up!
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT PROBLEM PANEL ──────────────────────────────── */}
        <aside
          className={`shrink-0 overflow-y-auto border-l border-white/5 bg-[#0a0a0a] transition-all duration-300 ease-in-out ${
            showPanel ? "w-[380px]" : "w-0 overflow-hidden border-none"
          }`}
        >
          {showPanel && prob && (
            <div className="p-6 space-y-6 min-w-[380px]">
              {/* Problem header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] bg-white/5 px-2 py-1 rounded">
                    Problem {activeProblem + 1} / {session.problems.length}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                      prob.difficulty === "EASY"
                        ? "text-green-400 border-green-500/20 bg-green-500/10"
                        : prob.difficulty === "MEDIUM"
                          ? "text-orange-400 border-orange-500/20 bg-orange-500/10"
                          : "text-red-400 border-red-500/20 bg-red-500/10"
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {prob.title}
                </h2>
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Tag size={14} className="text-gray-600" />
                  <span>{prob.topic?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Cpu size={14} className="text-gray-600" />
                  <span>Algorithmic Challenge</span>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Problem list nav */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  All Problems
                </p>
                {session.problems.map((p: any, idx: number) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProblem(idx)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all text-sm ${
                      activeProblem === idx
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/3 border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{p.title}</span>
                      <span
                        className={`text-[10px] font-black uppercase ml-2 shrink-0 ${
                          p.difficulty === "EASY"
                            ? "text-green-400"
                            : p.difficulty === "MEDIUM"
                              ? "text-orange-400"
                              : "text-red-400"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.topic?.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="h-px bg-white/5" />

              {/* LeetCode link */}
              <a
                href={prob.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-all"
              >
                Open on LeetCode
                <ExternalLink size={15} />
              </a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
