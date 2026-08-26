"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Building2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Layers,
  Compass,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Swords,
  Radio,
  Network,
  Users,
  Clock,
  Terminal,
} from "lucide-react";
import { cityAudio } from "@/lib/cityAudio";
import { CityCountdownTimer } from "@/components/city/CityCountdownTimer";
import { CityHoloSimulator } from "@/components/city/CityHoloSimulator";
import { CityDistrictBlueprints } from "@/components/city/CityDistrictBlueprints";
import { CityEarlyAccessSection } from "@/components/city/CityEarlyAccessSection";
import { CityFeatureShowcase } from "@/components/city/CityFeatureShowcase";
import { CityTransmissionFeed } from "@/components/city/CityTransmissionFeed";
import { LeaderboardUser, CityTheme } from "@/components/3d/CityScene";

// Dynamically import 3D WebGL Scene to keep initial load blistering fast
const CityScene = dynamic(
  () => import("@/components/3d/CityScene").then((mod) => mod.CityScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse flex flex-col items-center justify-center gap-3 text-[var(--text-muted)] font-mono text-xs">
        <Building2 size={28} className="text-[var(--accent-primary)] animate-bounce" />
        <span>Initializing WebGL 3D Spatial Holographic Engine...</span>
      </div>
    ),
  },
);

const MOCK_TEASER_USERS: LeaderboardUser[] = [
  { id: "user-1", username: "Alexey V. (DeepMind)", completedLevels: 24, lastActivityDate: "Just now" },
  { id: "user-2", username: "Elena Rostova", completedLevels: 19, lastActivityDate: "1h ago" },
  { id: "user-3", username: "Marcus Aurelius", completedLevels: 14, lastActivityDate: "3h ago" },
  { id: "user-4", username: "Priya Sharma", completedLevels: 9, lastActivityDate: "Yesterday" },
  { id: "user-current", username: "You (VIP Architect)", completedLevels: 7, lastActivityDate: "Active" },
  { id: "user-5", username: "David Kim", completedLevels: 5, lastActivityDate: "2d ago" },
];

export default function CityComingSoonPage() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [cityTheme, setCityTheme] = useState<CityTheme>("cyberpunk");
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsAudioMuted(cityAudio.getMuted());
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = cityAudio.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      cityAudio.playSelect();
    }
  };

  return (
    <PageTransition>
      <div className="w-full space-y-10 py-4 sm:py-6 animate-in fade-in duration-700">
        {/* =========================================================================
            HERO SECTION: METROPOLITAN GLITCH & COMING SOON BANNER
            ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-primary)]/30 bg-[var(--bg-card)]/90 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_60px_rgba(0,240,255,0.07)]">
          {/* Cyberpunk Grid Background Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[var(--accent-primary)]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[var(--accent-secondary)]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-widest font-mono">
                  <Building2 size={13} />
                  <span>Sector 07 // 3D Spatial Metaverse</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse">
                  Coming Soon • Beta Phase 3
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight font-display leading-[1.1]">
                DSA City <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] via-fuchsia-400 to-[var(--accent-secondary)]">Metropolis</span>
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                The world&apos;s first 3D spatial coding universe. Every algorithm you solve erects physical skyscraper floors on your personal cyberpunk plot, competing in a live global skyline.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#early-access"
                  onClick={() => cityAudio.playSelect()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-primary)] hover:brightness-110 text-black font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_var(--accent-glow)] active:scale-95 cursor-pointer font-display"
                >
                  <Sparkles size={15} />
                  <span>Claim Citizen Pass</span>
                </a>

                <a
                  href="#sandbox"
                  onClick={() => cityAudio.playHover()}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-xs font-mono font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Zap size={14} className="text-amber-400" />
                  <span>Test Floor Constructor</span>
                </a>
              </div>
            </div>

            {/* Right Meta Column: Quick Status & Audio Controller */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              {/* Audio controller toggle */}
              <button
                onClick={handleToggleAudio}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
                    {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] font-display">
                      Spatial Synthesizer
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {isAudioMuted ? "Sound: Muted" : "Sound: Active (Web Audio)"}
                    </p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${isAudioMuted ? "bg-slate-600" : "bg-emerald-400 animate-ping"}`} />
              </button>

              {/* Status Indicator */}
              <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>METAVERSE ENGINE</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <p className="font-bold text-[var(--text-primary)]">Three.js Spatial Grid 3.0</p>
                <p className="text-[10px] text-[var(--text-muted)]">Target: Global Beta Release</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            COUNTDOWN TIMER MODULE
            ========================================================================= */}
        <CityCountdownTimer />

        {/* =========================================================================
            3D WEBGL SPATIAL CANVAS TEASER
            ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] font-mono">
                Live 3D Holographic Spatial Canvas Preview
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Interactive 3D WebGL Canvas
            </span>
          </div>

          <div className="w-full h-[480px] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl relative bg-[var(--bg-card)]">
            <CityScene
              users={MOCK_TEASER_USERS}
              currentUserId="user-current"
              focusedUserId={focusedUserId}
              onFocusUser={(id) => setFocusedUserId(id)}
              theme={cityTheme}
              onThemeChange={(newTheme) => setCityTheme(newTheme)}
            />
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE SKYSCRAPER SIMULATOR (SANDBOX)
            ========================================================================= */}
        <div id="sandbox">
          <CityHoloSimulator />
        </div>

        {/* =========================================================================
            6 METROPOLITAN DISTRICTS BLUEPRINT
            ========================================================================= */}
        <CityDistrictBlueprints />

        {/* =========================================================================
            KEY INNOVATIONS & FEATURE SHOWCASE
            ========================================================================= */}
        <CityFeatureShowcase />

        {/* =========================================================================
            VIP EARLY ACCESS PASS & CITIZEN MINTING
            ========================================================================= */}
        <div id="early-access">
          <CityEarlyAccessSection />
        </div>

        {/* =========================================================================
            TRANSMISSION LOG FEED & ROADMAP MILESTONES
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Terminal Transmission Feed (7 cols) */}
          <div className="lg:col-span-7">
            <CityTransmissionFeed />
          </div>

          {/* Right: Milestone Progression Roadmap (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[var(--accent-secondary)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)] font-display">
                  Metropolitan Roadmap
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                PHASE 3 IN PROGRESS
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck size={14} />
                  <span>Phase 1: 3D Spatial Canvas Engine</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">COMPLETED</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck size={14} />
                  <span>Phase 2: District Progression Logic</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">COMPLETED</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/40 flex items-center justify-between text-[var(--text-primary)] font-bold">
                <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                  <Clock size={14} className="animate-spin-slow" />
                  <span>Phase 3: 1v1 PvP & Spire Raids</span>
                </div>
                <span className="text-[10px] text-amber-300 font-bold animate-pulse">ACTIVE</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} />
                  <span>Phase 4: Global Public Metaverse Launch</span>
                </div>
                <span className="text-[10px]">UPCOMING</span>
              </div>
            </div>

            {/* Quick links */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <Link
                href="/roadmap"
                className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1 font-mono font-bold"
              >
                <Network size={13} />
                <span>Explore Visual Roadmap</span>
              </Link>
              <Link
                href="/pvp"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-mono"
              >
                <Swords size={13} />
                <span>Try 1v1 PvP</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
