"use client";

import React, { useEffect, useState, useMemo } from "react";
import { dsaApi } from "@/lib/api";
import { CityScene, CityTheme, LeaderboardUser } from "@/components/3d/CityScene";
import { CityLevelPath } from "@/components/dashboard/CityLevelPath";
import { CityLeaderboard } from "@/components/dashboard/CityLeaderboard";
import { UserInspectorModal } from "@/components/dashboard/UserInspectorModal";
import { PageTransition } from "@/components/layout/PageTransition";
import { cityAudio } from "@/lib/cityAudio";
import {
  Brain,
  Building2,
  Crown,
  Loader2,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface LevelProgress {
  id: string;
  name: string;
  isCompleted: boolean;
  progress: {
    easy: { solved: number; required: number; total: number };
    medium: { solved: number; required: number; total: number };
    hard: { solved: number; required: number; total: number };
  };
}

export default function CityPage() {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState(0);
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [reducedEffects, setReducedEffects] = useState(false);
  const [activeTab, setActiveTab] = useState<"path" | "leaderboard">("path");
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inspectUser, setInspectUser] = useState<LeaderboardUser | null>(null);
  const [theme, setTheme] = useState<CityTheme>("cyberpunk");

  useEffect(() => {
    const loadCity = async () => {
      try {
        const data = await dsaApi.getCityProgress();
        setFloors(data.floors);
        setLevels(data.levels);
      } catch (error) {
        toast.error("Failed to load city progress");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCity();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
    };

    const evaluate = () => {
      const deviceMemory = navigatorWithMemory.deviceMemory ?? 8;
      const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
      setReducedEffects(
        media.matches || deviceMemory <= 4 || hardwareConcurrency <= 4,
      );
    };

    evaluate();
    media.addEventListener("change", evaluate);

    return () => media.removeEventListener("change", evaluate);
  }, []);

  // Leaderboard Users
  const leaderboardUsers: LeaderboardUser[] = useMemo(() => [
    { id: "u1", username: "Rajat", completedLevels: floors, lastActivityDate: new Date().toISOString() },
    { id: "u2", username: "Alex", completedLevels: 24, lastActivityDate: "2026-07-01T10:00:00Z" },
    { id: "u3", username: "Sarah", completedLevels: 32, lastActivityDate: "2026-07-04T14:30:00Z" },
    { id: "u4", username: "John", completedLevels: 5, lastActivityDate: "2026-06-28T09:15:00Z" },
    { id: "u5", username: "Emma", completedLevels: 16, lastActivityDate: "2026-07-03T11:20:00Z" },
    { id: "u6", username: "David", completedLevels: 8, lastActivityDate: "2026-07-02T16:45:00Z" },
    { id: "u7", username: "Lisa", completedLevels: 2, lastActivityDate: "2026-06-15T08:00:00Z" },
  ], [floors]);

  const sortedUsers = useMemo(() => {
    return [...leaderboardUsers].sort((a, b) => b.completedLevels - a.completedLevels);
  }, [leaderboardUsers]);

  const totalCityFloors = useMemo(() => {
    return leaderboardUsers.reduce((acc, u) => acc + u.completedLevels, 0);
  }, [leaderboardUsers]);

  const topSkyscraperFloors = sortedUsers[0]?.completedLevels || 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-h-250 gap-4">
        {/* Header & Stats Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400">
                DSA City
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Cyberpunk Edition
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Build your skyscraper by mastering topics. Solve 5 questions (2 Easy, 2 Medium, 1 Hard) per topic to add a floor!
            </p>
          </div>

          {/* Metric Cards Ticker */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-lg">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">City Floors</div>
                <div className="text-lg font-black text-white">{totalCityFloors}</div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-lg">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Top Height</div>
                <div className="text-lg font-black text-amber-400">{topSkyscraperFloors} lvls</div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-lg hidden sm:flex">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Builders</div>
                <div className="text-lg font-black text-emerald-400">{leaderboardUsers.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3D Canvas & Sidebar Container */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* 3D Canvas Scene */}
          <div className="lg:w-3/5 h-100 lg:h-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <CityScene
              users={leaderboardUsers}
              currentUserId="u1"
              reducedEffects={reducedEffects}
              focusedUserId={focusedUserId}
              onFocusUser={setFocusedUserId}
              theme={theme}
              onThemeChange={setTheme}
              onInspectUser={setInspectUser}
            />
          </div>

          {/* Sidebar Tabs (Path / Leaderboard) */}
          <div className="lg:w-2/5 flex flex-col bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="flex p-2 gap-2 bg-slate-900 border-b border-slate-800">
              <button
                onClick={() => {
                  cityAudio.playHover();
                  setActiveTab("path");
                }}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "path"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Brain className="w-4 h-4" />
                My Path
              </button>

              <button
                onClick={() => {
                  cityAudio.playHover();
                  setActiveTab("leaderboard");
                }}
                className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === "path" ? (
                <>
                  <div className="p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Skyscraper</span>
                    <div className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      {floors} Floors Built
                    </div>
                  </div>
                  <CityLevelPath levels={levels as any} />
                </>
              ) : (
                <CityLeaderboard
                  users={leaderboardUsers}
                  currentUserId="u1"
                  hoveredUserId={focusedUserId}
                  onHoverUser={setFocusedUserId}
                  onClickUser={(id) => {
                    setFocusedUserId(id);
                    const user = leaderboardUsers.find((u) => u.id === id);
                    if (user) setInspectUser(user);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Inspection Modal */}
      {inspectUser && (
        <UserInspectorModal
          user={inspectUser}
          currentUserId="u1"
          rank={sortedUsers.findIndex((u) => u.id === inspectUser.id) + 1}
          onClose={() => setInspectUser(null)}
          onViewPath={(userId) => {
            setSelectedUserId(userId);
            setInspectUser(null);
          }}
        />
      )}

      {/* Read-Only Path View Modal for Other Users */}
      {selectedUserId && selectedUserId !== "u1" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
              <h2 className="text-base font-bold text-slate-200">
                {leaderboardUsers.find((u) => u.id === selectedUserId)?.username}&apos;s Building Path
              </h2>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
              <div className="opacity-85 grayscale-[0.1]">
                <CityLevelPath levels={levels as any} />
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-800/50 text-center text-xs text-slate-400 font-medium">
              Read-Only Inspector View
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
