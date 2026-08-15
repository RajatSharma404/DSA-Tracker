"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  Building2,
  Sparkles,
  Zap,
  Trophy,
  Brain,
  Layers,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

/*
 ==============================================================================
  NOTE: DSA 3D City Scene Code is commented out below for upcoming v2.0 release.
 ==============================================================================

import { CityScene, CityTheme, LeaderboardUser } from "@/components/3d/CityScene";
import { CityLevelPath } from "@/components/dashboard/CityLevelPath";
import { CityLeaderboard } from "@/components/dashboard/CityLeaderboard";
import { UserInspectorModal } from "@/components/dashboard/UserInspectorModal";
import { cityAudio } from "@/lib/cityAudio";

(Original 3D City implementation preserved in version control and components/3d)
==============================================================================
*/

export default function CityPage() {
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    toast.success("You're on the VIP list for the DSA 3D City launch!");
  };

  const previewFeatures = [
    {
      icon: Building2,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      title: "3D Procedural Skyscrapers",
      desc: "Every topic you master erects physical floors on your personal cyberpunk skyscraper with real-time neon lighting.",
    },
    {
      icon: Trophy,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      title: "Multiplayer Metropolitan Leaderboard",
      desc: "Compare your skyline with peers and interview candidates worldwide in a live interactive 3D spatial grid.",
    },
    {
      icon: Zap,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      title: "Holographic Floor Elevators",
      desc: "Solve Easy, Medium, and Hard problems to power the central elevator shaft and ascend to advanced algorithmic districts.",
    },
    {
      icon: Brain,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Spaced Repetition Defense Tower",
      desc: "Neglected topics cause simulated power flickers on past floors, urging you to complete revisions before they decay.",
    },
  ];

  return (
    <PageTransition>
      <div className="w-full space-y-10 py-6 sm:py-10 animate-in fade-in duration-700">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-linear-to-b from-[#0e0e18] via-[#090912] to-[#050508] p-8 sm:p-14 shadow-2xl">
          {/* Ambient Glowing Blobs */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-full max-w-2xl bg-linear-to-t from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Sparkles size={14} className="animate-spin text-cyan-400" />
              <span>DSA City v2.0 • In Active Development</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-none">
              The 3D DSA <span className="bg-linear-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">Metaverse</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              We are upgrading DSA City into a full-scale WebGL 3D spatial world. Build procedural architectural towers as you solve algorithms, conquer districts, and visualize your progress like never before.
            </p>

            {/* Notify / Action Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleNotifyMe}
                disabled={notified}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                  notified
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-linear-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {notified ? <CheckCircle2 size={18} /> : <Radio size={18} className="animate-pulse" />}
                {notified ? "You're On The VIP Waitlist!" : "Get Early Alpha Access"}
              </button>

              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-bold text-gray-200 transition-all hover:border-white/20"
              >
                <Compass size={18} className="text-cyan-400" />
                Explore Visual Roadmap
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-cyan-400" />
              What to Expect in City v2.0
            </h2>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Sneak Peek
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {previewFeatures.map((feat, i) => (
              <div
                key={i}
                className="group relative rounded-3xl border border-white/5 bg-[#0a0a0f] p-6 hover:border-cyan-500/30 hover:bg-[#0d0d18] transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>Phase {i + 1} System</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Sparkles size={12} /> Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Alternative Roadmaps */}
        <div className="rounded-3xl border border-white/10 bg-linear-to-r from-purple-900/15 via-[#0c0c14] to-cyan-900/15 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Flame size={20} className="text-orange-400" />
              Keep Your Momentum Going
            </h3>
            <p className="text-xs text-gray-400">
              Continue mastering topics sequentially or practice under pressure in the arena while the city builds.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/topics"
              className="rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-colors"
            >
              Solve DSA Topics
            </Link>
            <Link
              href="/challenge"
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-bold text-black transition-colors"
            >
              Enter The Arena
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
