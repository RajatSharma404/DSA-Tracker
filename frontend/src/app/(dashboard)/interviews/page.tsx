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

const COMPANIES = [
  { id: "google", name: "Google", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "meta", name: "Meta", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { id: "amazon", name: "Amazon", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "apple", name: "Apple", badge: "bg-gray-500/10 text-gray-300 border-gray-500/20" },
  { id: "microsoft", name: "Microsoft", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "netflix", name: "Netflix", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  { id: "uber", name: "Uber", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "hft", name: "HFT / Quant", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { id: "startup", name: "Y-Combinator Startup", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
];

const INTERVIEW_MODES = [
  { id: "rapid", label: "Speed Diagnostic", duration: 20, desc: "1 rapid problem, focus on quick intuition" },
  { id: "standard", label: "Full Onsite Coding", duration: 45, desc: "2 problems with strict runtime bounds" },
  { id: "deep", label: "Edge-Case & Invariants", duration: 30, desc: "Focus on zero-bug implementations" },
];

const PERSONAS = [
  { id: "strict", label: "Strict Bar Raiser", desc: "No hints, scrutinizes edge cases and constraints" },
  { id: "collaborative", label: "Senior Lead", desc: "Balanced peer discussion with subtle directional nudges" },
  { id: "supportive", label: "Friendly Mentor", desc: "Encouraging environment ideal for initial practice" },
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
    setStartingChallenge(true);
    try {
      const session = await dsaApi.startChallenge(challengeTopicId, activeDuration);
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
  const avgScore = totalMocks > 0
    ? (interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalMocks).toFixed(1)
    : "—";

  const readinessPercentage = totalMocks > 0
    ? Math.min(100, Math.round((Number(avgScore) / 10) * 85 + Math.min(15, totalMocks * 3)))
    : 0;

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-8 animate-pulse">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-full bg-white/5" />
            <div className="h-4 w-80 rounded-full bg-white/5" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-white/5" />
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
            <span>FAANG & Top Tier Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mock Interview Arena
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate high-pressure technical screens, target specific company hiring bars, and track your readiness.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-white/10"
        >
          <Plus size={18} />
          Log Past Interview
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Mocks</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalMocks}</span>
            <span className="text-xs text-gray-500 font-medium">completed</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Average Score</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgScore}</span>
            <span className="text-xs text-gray-500 font-medium">/ 10 points</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Onsite Readiness</span>
            <Trophy size={16} className="text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{readinessPercentage}%</span>
            <span className="text-xs text-gray-500 font-medium">confidence</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0a0a0f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Target Bar</span>
            <Building2 size={16} className="text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-base font-bold text-white uppercase tracking-tight">FAANG L4/L5</span>
            <span className="text-xs text-cyan-400 font-bold">Optimal</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Launcher + Radar Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Interactive Live Simulator Launcher */}
        <div className="xl:col-span-7 rounded-3xl border border-white/10 bg-linear-to-b from-[#0e0e18] via-[#0a0a10] to-[#06060a] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live AI Mock Interview Room</h2>
                <p className="text-xs text-gray-400">Configure target company, problem domain, and interviewer persona.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-[11px] text-gray-400 border border-white/5">
              <Timer size={13} className="text-cyan-400" />
              <span>{activeDuration} Minutes</span>
            </div>
          </div>

          {/* 1. Target Company Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Building2 size={13} className="text-cyan-400" /> Target Company Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompany(c.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedCompany === c.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                      : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Mode & Duration Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Timer size={13} className="text-cyan-400" /> Format & Time Constraint
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTERVIEW_MODES.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedMode === m.id
                      ? "bg-cyan-500/10 border-cyan-500/40 shadow-inner"
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${selectedMode === m.id ? "text-cyan-300" : "text-white"}`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] font-black text-gray-500">{m.duration}m</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interviewer Persona */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Users size={13} className="text-cyan-400" /> Interviewer Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPersona === p.id
                      ? "bg-purple-500/10 border-purple-500/40 shadow-inner"
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}
                >
                  <span className={`text-xs font-bold mb-1 ${selectedPersona === p.id ? "text-purple-300" : "text-white"}`}>
                    {p.label}
                  </span>
                  <p className="text-[11px] text-gray-400 leading-tight">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Topic Domain Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Brain size={13} className="text-cyan-400" /> Focus Topic
            </label>
            <select
              value={challengeTopicId}
              onChange={(e) => setChallengeTopicId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0e0e18] text-white">
                  {t.name} ({t.totalProblems} problems)
                </option>
              ))}
            </select>
          </div>

          {/* Launch Action */}
          <button
            onClick={startMockInterview}
            disabled={startingChallenge}
            className="w-full py-4 rounded-2xl bg-linear-to-r from-cyan-500 via-teal-400 to-blue-500 text-black font-extrabold text-sm uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 transition-all shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" />
            {startingChallenge ? "Initializing Environment..." : "Enter Live Mock Simulation"}
          </button>
        </div>

        {/* Right Column (5 cols): Readiness Scorecard & Advice */}
        <div className="xl:col-span-5 space-y-6">
          {/* Readiness Pillar Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hiring Bar Evaluation Pillars</h3>
                <p className="text-xs text-gray-400">Core dimensions tested in tier-1 technical loops.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                { name: "Invariant Recall & Speed", pct: 85, desc: "Identifying patterns within 3 minutes of reading" },
                { name: "Edge Case & Bounds Handling", pct: 72, desc: "Empty inputs, overflows, 1-element sets" },
                { name: "Code Cleanliness & Modularity", pct: 90, desc: "Descriptive variables, helper decomposition" },
                { name: "Complexity Articulation", pct: 80, desc: "Precise Big-O time and space trade-off analysis" },
              ].map((p, i) => (
                <div key={i} className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-200">{p.name}</span>
                    <span className="text-cyan-400 font-bold">{p.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-cyan-500 to-purple-500 rounded-full"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Pro Tips */}
          <div className="rounded-3xl border border-white/5 bg-linear-to-br from-amber-500/10 via-[#0a0a0f] to-transparent p-6 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Flame size={16} /> Interviewer Advice
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Always talk through your brute force approach first before writing code. State your invariants out loud and trace your code step-by-step with a concrete sample input.
            </p>
          </div>
        </div>
      </div>

      {/* Session History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays size={20} className="text-cyan-400" />
            Interview History & Feedback Logs
          </h2>
          <span className="text-xs text-gray-500 font-semibold">{interviews.length} Total Records</span>
        </div>

        {interviews.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-bold text-white">No Mock Interviews Logged Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Start your first timed mock simulation above, or log the feedback and notes from your external practice interviews to track your progression.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer border border-white/10"
            >
              <Plus size={14} /> Log Past Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-white/5 bg-[#0a0a0f] hover:border-white/10 transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-cyan-400" />
                      {format(new Date(item.date), "MMM d, yyyy")}
                    </span>
                    {item.score !== undefined && item.score !== null && (
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        item.score >= 8
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.score >= 6
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {item.score}/10 {item.score >= 8 ? "Strong Hire" : item.score >= 6 ? "Hire" : "Needs Review"}
                      </span>
                    )}
                  </div>

                  {item.feedback && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed max-h-32 overflow-y-auto">
                      {item.feedback}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-medium">
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
          <div className="bg-[#0d0d14] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Plus size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Log Interview Session</h2>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Target Company</label>
                  <input
                    type="text"
                    value={targetCompanyInput}
                    onChange={(e) => setTargetCompanyInput(e.target.value)}
                    placeholder="e.g. Google, Meta"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Score (1-10)</label>
                  <span className="text-xs font-bold text-cyan-400">{score}/10</span>
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
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Feedback & Critical Notes</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What went well? Which edge cases tripped you up? Code complexity discussed..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
