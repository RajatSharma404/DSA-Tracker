"use client";

import React from "react";
import {
  Building2,
  Swords,
  Brain,
  Trophy,
  Flame,
  Volume2,
  Sparkles,
  Radio,
  Layers,
  Zap,
} from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";

const FEATURES = [
  {
    icon: Building2,
    title: "Dynamic Spatial Skylines",
    tag: "3D REAL-TIME ENGINE",
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "group-hover:border-cyan-400/50",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    description:
      "Every LeetCode or DSA problem you solve generates physical skyscraper floors on your personal sector plot with customizable architectural neon themes.",
  },
  {
    icon: Swords,
    title: "1v1 Rooftop PvP Battles",
    tag: "SYNCHRONIZED ARENA",
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "group-hover:border-pink-400/50",
    badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    description:
      "Challenge friends and global architects to live, timed code duels atop skyscraper helipads to seize territory control and skyline trophies.",
  },
  {
    icon: Brain,
    title: "AI Holographic Architect",
    tag: "AGENTIC CODE REVIEW",
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "group-hover:border-purple-400/50",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    description:
      "In-engine AI mentor decodes AST call-stacks, offers subtle hints, and critiques time/space complexity without spoiling solutions.",
  },
  {
    icon: Trophy,
    title: "Metropolitan Skyline Board",
    tag: "COMMUNITY SKYLINE",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "group-hover:border-amber-400/50",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    description:
      "Inspect the live 3D skylines of engineers around the world. Click on any tower to inspect their solved problem distribution and badges.",
  },
  {
    icon: Flame,
    title: "Central Spire Server Raids",
    tag: "COOPERATIVE BOSS FIGHTS",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "group-hover:border-emerald-400/50",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    description:
      "Weekly community raid bosses featuring legendary Hard DP algorithms that require collective server XP to unlock exclusive district skins.",
  },
  {
    icon: Volume2,
    title: "Tactical Audio Synthesizer",
    tag: "PROCEDURAL SOUNDSCAPE",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "group-hover:border-blue-400/50",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    description:
      "Immersive zero-dependency Web Audio synthesizers deliver satisfying acoustic feedback as you compile code and erect building stories.",
  },
];

export function CityFeatureShowcase() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            <Zap size={13} />
            <span>Next-Generation Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-display tracking-tight">
            Key Metropolitan Innovations
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Built from scratch to turn algorithm mastery into a visual, competitive metaverse.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            onMouseEnter={() => cityAudio.playHover()}
            className={`group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${feature.borderColor}`}
          >
            {/* Background subtle gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] group-hover:scale-110 transition-transform shadow-inner">
                <feature.icon size={22} className="text-[var(--accent-primary)]" />
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider ${feature.badgeColor}`}>
                {feature.tag}
              </span>
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
