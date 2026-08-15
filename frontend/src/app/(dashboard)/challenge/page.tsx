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
    tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
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
  const [difficultyTier, setDifficultyTier] = useState<"standard" | "hardcore" | "nightmare">("standard");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    dsaApi.getTopics().then((data) => {
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0].id);
    });
  }, []);

  const handleModeSelect = (mode: ArenaMode) => {
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
      <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-linear-to-r from-[#141008] via-[#0d0d12] to-[#0a0812] p-8 sm:p-10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Flame size={14} className="text-amber-400 animate-pulse" />
              <span>The Competitive Pressure Arena</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight italic uppercase">
              Interview Pressure Simulator
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Train your brain to conquer the clock. Solve complex algorithms under severe cognitive load, strict time bounds, and zero margin for error.
            </p>
          </div>

          {/* Division Badge Card */}
          <div className="p-5 rounded-3xl bg-black/60 border border-amber-500/20 backdrop-blur-md flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Trophy size={26} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Gladiator Rank
              </div>
              <div className="text-lg font-black text-white">Diamond Tier II</div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Swords size={18} className="text-amber-400" />
            Select Battle Mode
          </h2>
          <span className="text-xs text-gray-500 font-semibold">4 Arena Formats</span>
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
                    ? "bg-linear-to-b from-amber-500/15 via-[#12100a] to-[#0a0808] border-amber-500/60 shadow-amber-500/10 scale-[1.02]"
                    : "bg-[#0a0a0f] border-white/5 hover:border-white/15 hover:bg-[#0e0e14]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${mode.tagColor}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/5">
                      {mode.multiplier}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-base font-extrabold ${isSelected ? "text-amber-300" : "text-white"}`}>
                      {mode.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-bold">{mode.badge}</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? "text-amber-400" : "text-gray-500"}`}>
                    {isSelected ? "Selected Mode" : "Click to select"}
                  </span>
                  <ChevronRight size={16} className={isSelected ? "text-amber-400" : "text-gray-600"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Console: Customization & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Matchmaker Console (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Battle Setup Console</h3>
              <p className="text-xs text-gray-400">Configure topic domain and time constraints.</p>
            </div>
          </div>

          {/* Topic Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Domain Arena</span>
              {selectedModeId === "roulette" && (
                <span className="text-cyan-400 font-bold">Blind Mode Active (Randomized)</span>
              )}
            </label>
            <select
              disabled={selectedModeId === "roulette"}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/50 disabled:opacity-40"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0e0e18] text-white">
                  {t.name} ({t.totalProblems} problems)
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Timer Duration (Minutes)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[15, 25, 35, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setCustomDuration(mins)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    customDuration === mins
                      ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Modifier */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              Pressure Intensity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["standard", "hardcore", "nightmare"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setDifficultyTier(tier)}
                  className={`py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    difficultyTier === tier
                      ? "bg-white/10 border-white/30 text-white shadow-inner"
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
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
            className="w-full py-4.5 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-black text-sm uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap size={18} fill="currentColor" />
            {loading ? "Constructing Arena Room..." : "Enter The Arena"}
          </button>
        </div>

        {/* Arena Rules & Psychological Readiness (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-[#0a0a0f] p-6 space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Timer size={16} className="text-cyan-400" />
              Arena Combat Rules
            </h4>
            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                <span className="text-amber-400 font-black">01</span>
                <p>The countdown clock is irreversible. Pausing is disabled inside the pressure chamber.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                <span className="text-amber-400 font-black">02</span>
                <p>All test cases must pass without relying on print statement debug spam.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                <span className="text-amber-400 font-black">03</span>
                <p>Solving before the 50% time mark grants a Speed Bonus multiplier to your ELO rating.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-linear-to-br from-purple-500/10 via-[#0a0a0f] to-transparent p-6 space-y-2">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Sparkles size={16} /> Mental Game Advice
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              When panic strikes, breathe, write out the state transitions or invariants on scratchpad comments, and test 1 edge case before writing your loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
