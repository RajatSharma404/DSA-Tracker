"use client";

import { useEffect, useState, useMemo } from "react";
import { dsaApi, MockInterview, Topic } from "@/lib/api";
import {
  Plus,
  Target,
  CalendarDays,
  MessageSquare,
  Timer,
  Zap,
  Building2,
  Trophy,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Brain,
  Award,
  ChevronRight,
  Sliders,
  Play,
  RotateCcw,
  X,
  Star,
  Users,
  Flame,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "meta",
    name: "Meta",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    id: "amazon",
    name: "Amazon",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "apple",
    name: "Apple",
    badge: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "netflix",
    name: "Netflix",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    id: "uber",
    name: "Uber",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    id: "hft",
    name: "HFT / Quant",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    id: "startup",
    name: "Y-Combinator Startup",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
];

const INTERVIEW_MODES = [
  {
    id: "rapid",
    label: "Speed Diagnostic",
    duration: 20,
    desc: "1 rapid problem, focus on quick intuition",
  },
  {
    id: "standard",
    label: "Full Onsite Coding",
    duration: 45,
    desc: "2 problems with strict runtime bounds",
  },
  {
    id: "deep",
    label: "Edge-Case & Invariants",
    duration: 30,
    desc: "Focus on zero-bug implementations",
  },
];

const PERSONAS = [
  {
    id: "strict",
    label: "Strict Bar Raiser",
    desc: "No hints, scrutinizes edge cases and constraints",
  },
  {
    id: "collaborative",
    label: "Senior Lead",
    desc: "Balanced peer discussion with subtle directional nudges",
  },
  {
    id: "supportive",
    label: "Friendly Mentor",
    desc: "Encouraging environment ideal for initial practice",
  },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [startingChallenge, setStartingChallenge] = useState(false);
  const router = useRouter();

  // Launcher Config State
  const [selectedCompany, setSelectedCompany] = useState("google");
  const [selectedMode, setSelectedMode] = useState("standard");
  const [selectedPersona, setSelectedPersona] = useState("strict");
  const [challengeTopicId, setChallengeTopicId] = useState("");

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [score, setScore] = useState("8");
  const [feedback, setFeedback] = useState("");
  const [targetCompanyInput, setTargetCompanyInput] = useState("Google");

  useEffect(() => {
    loadInterviews();
    dsaApi
      .getTopics()
      .then((data) => {
        setTopics(data);
        if (data.length > 0) setChallengeTopicId(data[0].id);
      })
      .catch((err) => console.error("Failed to load topics", err));
  }, []);

  async function loadInterviews() {
    try {
      const data = await dsaApi.getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const activeDuration = useMemo(() => {
    return INTERVIEW_MODES.find((m) => m.id === selectedMode)?.duration || 45;
  }, [selectedMode]);

  const startMockInterview = async () => {
    if (!challengeTopicId) {
      toast.error("Please select a topic to practice");
      return;
    }
    soundEffects.playOpen();
    setStartingChallenge(true);
    try {
      const session = await dsaApi.startChallenge(
        challengeTopicId,
        activeDuration,
      );
      toast.success("Mock Interview initialized! Entering arena...");
      router.push(`/challenge/${session.id}`);
    } catch (err) {
      toast.error("Failed to start mock interview session");
      console.error(err);
    } finally {
      setStartingChallenge(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    try {
      soundEffects.playSuccess();
      const finalFeedback = targetCompanyInput
        ? `[Target: ${targetCompanyInput}] ${feedback}`.trim()
        : feedback;

      await dsaApi.createInterview({
        date,
        score: score ? parseInt(score) : undefined,
        feedback: finalFeedback || undefined,
      });
      toast.success("Mock interview logged successfully!");
      setIsAdding(false);
      setFeedback("");
      loadInterviews();
    } catch (err) {
      toast.error("Failed to log interview session");
      console.error(err);
    }
  };

  // Stats calculation
  const totalMocks = interviews.length;
  const avgScore =
    totalMocks > 0
      ? (
          interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          totalMocks
        ).toFixed(1)
      : "—";

  const readinessPercentage =
    totalMocks > 0
      ? Math.min(
          100,
          Math.round(
            (Number(avgScore) / 10) * 85 + Math.min(15, totalMocks * 3),
          ),
        )
      : 0;

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-8 animate-pulse">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-full bg-[var(--bg-secondary)]" />
            <div className="h-4 w-80 rounded-full bg-[var(--bg-secondary)]" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-[var(--bg-secondary)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[var(--bg-secondary)]"
            />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-[var(--bg-secondary)]" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            <span>FAANG & Tier-1 Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight font-display">
            Mock Interview Arena
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Simulate high-pressure technical screens, target specific company
            hiring bars, and track your readiness.
          </p>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            setIsAdding(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[var(--accent-primary)] text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[var(--accent-glow)]"
        >
          <Plus size={18} />
          <span>Log Past Interview</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Total Mocks</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-display">
              {totalMocks}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              completed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Average Score</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--text-primary)] font-display">
              {avgScore}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              / 10 points
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Onsite Readiness</span>
            <Trophy size={16} className="text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-display">
              {readinessPercentage}%
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              confidence
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Target Bar</span>
            <Building2 size={16} className="text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-base font-bold text-[var(--text-primary)] uppercase tracking-tight font-display">
              FAANG L4/L5
            </span>
            <span className="text-xs text-[var(--accent-primary)] font-bold font-mono">
              Optimal
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Launcher + Radar Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Interactive Live Simulator Launcher */}
        <div className="xl:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
                  Live AI Mock Interview Room
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Configure target company, problem domain, and interviewer persona.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-secondary)] text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
              <Timer size={13} className="text-cyan-400" />
              <span>{activeDuration} Minutes</span>
            </div>
          </div>

          {/* 1. Target Company Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
              <Building2 size={13} className="text-cyan-400" /> Target Company
              Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCompany(c.id);
                  }}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer font-mono ${
                    selectedCompany === c.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Mode & Duration Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
              <Timer size={13} className="text-cyan-400" /> Format & Time Constraint
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTERVIEW_MODES.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedMode(m.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedMode === m.id
                      ? "bg-cyan-500/10 border-cyan-500/40 shadow-inner"
                      : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        selectedMode === m.id
                          ? "text-cyan-300"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {m.label}
                    </span>
                    <span className="text-[10px] font-black text-[var(--text-muted)] font-mono">
                      {m.duration}m
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interviewer Persona */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
              <Users size={13} className="text-purple-400" /> Interviewer Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedPersona(p.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPersona === p.id
                      ? "bg-purple-500/10 border-purple-500/40 shadow-inner"
                      : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                  }`}
                >
                  <span
                    className={`text-xs font-bold mb-1 ${
                      selectedPersona === p.id
                        ? "text-purple-300"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {p.label}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Topic Domain Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
              <Brain size={13} className="text-cyan-400" /> Focus Topic
            </label>
            <select
              value={challengeTopicId}
              onChange={(e) => setChallengeTopicId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-cyan-500/50"
            >
              {topics.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  className="bg-[var(--bg-card)] text-[var(--text-primary)]"
                >
                  {t.name} ({t.totalProblems} problems)
                </option>
              ))}
            </select>
          </div>

          {/* Launch Action */}
          <button
            onClick={startMockInterview}
            disabled={startingChallenge}
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" />
            <span>
              {startingChallenge
                ? "Initializing Environment..."
                : "Enter Live Mock Simulation"}
            </span>
          </button>
        </div>

        {/* Right Column (5 cols): Readiness Scorecard & Advice */}
        <div className="xl:col-span-5 space-y-6">
          {/* Readiness Pillar Card */}
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Hiring Bar Evaluation Pillars
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Core dimensions tested in tier-1 technical loops.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 font-mono">
              {[
                {
                  name: "Invariant Recall & Speed",
                  pct: 85,
                  desc: "Identifying patterns within 3 minutes of reading",
                },
                {
                  name: "Edge Case & Bounds Handling",
                  pct: 72,
                  desc: "Empty inputs, overflows, 1-element sets",
                },
                {
                  name: "Code Cleanliness & Modularity",
                  pct: 90,
                  desc: "Descriptive variables, helper decomposition",
                },
                {
                  name: "Complexity Articulation",
                  pct: 80,
                  desc: "Precise Big-O time and space trade-off analysis",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="space-y-1.5 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">{p.name}</span>
                    <span className="text-cyan-400 font-bold">{p.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Pro Tips */}
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-display">
              <Flame size={16} /> Interviewer Advice
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Always talk through your brute force approach first before
              writing code. State your invariants out loud and trace your code
              step-by-step with a concrete sample input.
            </p>
          </div>
        </div>
      </div>

      {/* Session History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
            <CalendarDays size={20} className="text-cyan-400" />
            Interview History & Feedback Logs
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-semibold font-mono">
            {interviews.length} Total Records
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
              No Mock Interviews Logged Yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              Start your first timed mock simulation above, or log the feedback
              and notes from your external practice interviews to track your
              progression.
            </p>
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsAdding(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-subtle)]"
            >
              <Plus size={14} /> Log Past Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5 font-mono">
                      <CalendarDays size={13} className="text-cyan-400" />
                      {format(new Date(item.date), "MMM d, yyyy")}
                    </span>
                    {item.score !== undefined && item.score !== null && (
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border font-mono ${
                          item.score >= 8
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : item.score >= 6
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {item.score}/10{" "}
                        {item.score >= 8
                          ? "Strong Hire"
                          : item.score >= 6
                            ? "Hire"
                            : "Needs Review"}
                      </span>
                    )}
                  </div>

                  {item.feedback && (
                    <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed max-h-32 overflow-y-auto">
                      {item.feedback}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium font-mono">
                  <span>Logged Session</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Recorded
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Interview Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Plus size={18} />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">
                  Log Interview Session
                </h2>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsAdding(false);
                }}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={targetCompanyInput}
                    onChange={(e) => setTargetCompanyInput(e.target.value)}
                    placeholder="e.g. Google, Meta"
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Score (1-10)
                  </label>
                  <span className="text-xs font-bold text-cyan-400">
                    {score}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                  Feedback & Critical Notes
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What went well? Which edge cases tripped you up? Code complexity discussed..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setIsAdding(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
