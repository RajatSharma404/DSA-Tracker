"use client";

import React, { useEffect, useState } from "react";
import { dsaApi, Topic } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Timer,
  Zap,
  Trophy,
  ShieldAlert,
  Flame,
  Swords,
  Skull,
  Crosshair,
  Sparkles,
  Award,
  Crown,
  ChevronRight,
  TrendingUp,
  Activity,
  Play,
  Layers,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface ArenaMode {
  id: string;
  name: string;
  duration: number;
  icon: any;
  tag: string;
  tagColor: string;
  badge: string;
  desc: string;
  multiplier: string;
}

const ARENA_MODES: ArenaMode[] = [
  {
    id: "blitz",
    name: "Speed Blitz",
    duration: 15,
    icon: Zap,
    tag: "High Tempo",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "15 Minutes",
    desc: "15-minute high-octane sprint. Pure algorithmic reflex and fast pattern identification.",
    multiplier: "1.2x ELO",
  },
  {
    id: "death",
    name: "Sudden Death",
    duration: 25,
    icon: Skull,
    tag: "Hardcore",
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    badge: "25 Minutes",
    desc: "Zero room for error. A single runtime error or failed test case forfeits the match.",
    multiplier: "2.0x ELO",
  },
  {
    id: "gauntlet",
    name: "FAANG Gauntlet",
    duration: 45,
    icon: Crown,
    tag: "Standard Onsite",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    badge: "45 Minutes",
    desc: "Strict runtime bounds and large test suites mirroring tier-1 technical loops.",
    multiplier: "1.5x ELO",
  },
  {
    id: "roulette",
    name: "Blind Roulette",
    duration: 30,
    icon: Crosshair,
    tag: "Unpredictable",
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badge: "30 Minutes",
    desc: "Domain and difficulty remain hidden until the battle begins. Adapt on the fly.",
    multiplier: "1.8x ELO",
  },
];

export default function ChallengeSelection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedModeId, setSelectedModeId] = useState("gauntlet");
  const [customDuration, setCustomDuration] = useState(45);
  const [difficultyTier, setDifficultyTier] = useState<
    "standard" | "hardcore" | "nightmare"
  >("standard");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    dsaApi.getTopics().then((data) => {
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0].id);
    });
  }, []);

  const handleModeSelect = (mode: ArenaMode) => {
    soundEffects.playClick();
    setSelectedModeId(mode.id);
    setCustomDuration(mode.duration);
  };

  const handleStart = async () => {
    let topicToStart = selectedTopic;

    // Blind roulette picks random topic
    if (selectedModeId === "roulette" && topics.length > 0) {
      const randomIndex = Math.floor(Math.random() * topics.length);
      topicToStart = topics[randomIndex].id;
    }

    if (!topicToStart) {
      toast.error("Please choose a topic domain");
      return;
    }

    soundEffects.playOpen();
    setLoading(true);
    try {
      const session = await dsaApi.startChallenge(topicToStart, customDuration);
      toast.success("Battle initialized! Entering the Arena...");
      router.push(`/challenge/${session.id}`);
    } catch (err) {
      toast.error("Failed to initialize arena battle");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-500">
      {/* Arena Banner / Status Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Flame size={14} className="text-amber-400 animate-pulse" />
              <span>The Competitive Pressure Arena</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight italic uppercase font-display">
              Interview Pressure Simulator
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Train your brain to conquer the clock. Solve complex algorithms
              under severe cognitive load, strict time bounds, and zero margin
              for error.
            </p>
          </div>

          {/* Division Badge Card */}
          <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] backdrop-blur-md flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Trophy size={26} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                Gladiator Rank
              </div>
              <div className="text-lg font-black text-[var(--text-primary)] font-display">
                Diamond Tier II
              </div>
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5 font-mono">
                <Activity size={12} className="text-emerald-400" />
                <span>1,890 Pressure ELO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arena Modes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
            <Swords size={18} className="text-amber-400" />
            Select Battle Mode
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-semibold font-mono">
            4 Arena Formats
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {ARENA_MODES.map((mode) => {
            const isSelected = selectedModeId === mode.id;
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                className={`relative rounded-3xl border p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 shadow-lg ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 shadow-amber-500/10 scale-[1.02]"
                    : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${mode.tagColor}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono">
                      {mode.multiplier}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`text-base font-extrabold font-display ${
                        isSelected ? "text-amber-400" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {mode.name}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)] font-bold font-mono">
                      {mode.badge}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                  <span
                    className={`font-bold ${
                      isSelected ? "text-amber-400" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {isSelected ? "Selected Mode" : "Click to select"}
                  </span>
                  <ChevronRight
                    size={16}
                    className={
                      isSelected ? "text-amber-400" : "text-[var(--text-muted)]"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Console: Customization & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Matchmaker Console (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                Battle Setup Console
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Configure topic domain and time constraints.
              </p>
            </div>
          </div>

          {/* Topic Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between font-mono">
              <span>Domain Arena</span>
              {selectedModeId === "roulette" && (
                <span className="text-[var(--accent-primary)] font-bold">
                  Blind Mode Active (Randomized)
                </span>
              )}
            </label>
            <select
              disabled={selectedModeId === "roulette"}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-40"
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

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Timer Duration (Minutes)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[15, 25, 35, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setCustomDuration(mins);
                  }}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer font-mono ${
                    customDuration === mins
                      ? "bg-[var(--accent-primary)] text-black border-[var(--accent-primary)] shadow-md"
                      : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Modifier */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Pressure Intensity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["standard", "hardcore", "nightmare"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setDifficultyTier(tier);
                  }}
                  className={`py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-mono ${
                    difficultyTier === tier
                      ? "bg-[var(--bg-secondary)] border-[var(--border-medium)] text-[var(--text-primary)] shadow-inner"
                      : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStart}
            disabled={loading || !selectedTopic}
            className="w-full py-4.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap size={18} fill="currentColor" />
            <span>
              {loading ? "Constructing Arena Room..." : "Enter The Arena"}
            </span>
          </button>
        </div>

        {/* Arena Rules & Psychological Readiness (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
              <Timer size={16} className="text-[var(--accent-primary)]" />
              Arena Combat Rules
            </h4>
            <div className="space-y-3 text-xs text-[var(--text-muted)] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="text-amber-400 font-black font-mono">01</span>
                <p>
                  The countdown clock is irreversible. Pausing is disabled
                  inside the pressure chamber.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="text-amber-400 font-black font-mono">02</span>
                <p>
                  All test cases must pass without relying on print statement
                  debug spam.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-3">
                <span className="text-amber-400 font-black font-mono">03</span>
                <p>
                  Solving before the 50% time mark grants a Speed Bonus
                  multiplier to your ELO rating.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-2">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2 font-display">
              <Sparkles size={16} /> Mental Game Advice
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When panic strikes, breathe, write out the state transitions or
              invariants on scratchpad comments, and test 1 edge case before
              writing your loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
