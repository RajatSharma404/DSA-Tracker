"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
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
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { dsaApi } from "@/lib/api";
import { LeaderboardUser, CityTheme } from "@/components/3d/CityScene";
import { CityLevelProgress } from "@/components/dashboard/CityLevelPath";
import { soundEffects } from "@/lib/soundEffects";

const CityScene = dynamic(
  () => import("@/components/3d/CityScene").then((mod) => mod.CityScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse flex items-center justify-center text-[var(--text-muted)] font-mono text-xs">
        Initializing WebGL 3D Spatial Canvas...
      </div>
    ),
  },
);

const CityLevelPath = dynamic(
  () =>
    import("@/components/dashboard/CityLevelPath").then(
      (mod) => mod.CityLevelPath,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
    ),
  },
);

const CityLeaderboard = dynamic(
  () =>
    import("@/components/dashboard/CityLeaderboard").then(
      (mod) => mod.CityLeaderboard,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse" />
    ),
  },
);

const UserInspectorModal = dynamic(
  () =>
    import("@/components/dashboard/UserInspectorModal").then(
      (mod) => mod.UserInspectorModal,
    ),
  {
    ssr: false,
  },
);

const MOCK_LEVELS: CityLevelProgress[] = [
  {
    id: "arrays-and-hashing",
    name: "Foundation: Arrays & Hashing",
    isCompleted: true,
    progress: {
      easy: { solved: 3, required: 3, total: 3 },
      medium: { solved: 3, required: 3, total: 3 },
      hard: { solved: 1, required: 1, total: 1 },
    },
  },
  {
    id: "two-pointers",
    name: "District 2: Two Pointers",
    isCompleted: true,
    progress: {
      easy: { solved: 2, required: 2, total: 2 },
      medium: { solved: 3, required: 3, total: 3 },
      hard: { solved: 1, required: 1, total: 1 },
    },
  },
  {
    id: "sliding-window",
    name: "District 3: Sliding Window",
    isCompleted: false,
    progress: {
      easy: { solved: 2, required: 2, total: 2 },
      medium: { solved: 1, required: 3, total: 3 },
      hard: { solved: 0, required: 1, total: 1 },
    },
  },
  {
    id: "trees-and-graphs",
    name: "District 4: Trees & Graphs",
    isCompleted: false,
    progress: {
      easy: { solved: 1, required: 2, total: 2 },
      medium: { solved: 0, required: 4, total: 4 },
      hard: { solved: 0, required: 2, total: 2 },
    },
  },
  {
    id: "dynamic-programming",
    name: "Central Spire: Dynamic Programming",
    isCompleted: false,
    progress: {
      easy: { solved: 0, required: 2, total: 2 },
      medium: { solved: 0, required: 5, total: 5 },
      hard: { solved: 0, required: 3, total: 3 },
    },
  },
];

const MOCK_USERS: LeaderboardUser[] = [
  {
    id: "user-1",
    username: "Alexey V. (DeepMind)",
    completedLevels: 24,
    lastActivityDate: "Just now",
  },
  {
    id: "user-2",
    username: "Elena Rostova",
    completedLevels: 19,
    lastActivityDate: "1h ago",
  },
  {
    id: "user-3",
    username: "Marcus Aurelius",
    completedLevels: 14,
    lastActivityDate: "3h ago",
  },
  {
    id: "user-4",
    username: "Priya Sharma",
    completedLevels: 9,
    lastActivityDate: "Yesterday",
  },
  {
    id: "user-current",
    username: "You (Gladiator)",
    completedLevels: 7,
    lastActivityDate: "Active",
  },
  {
    id: "user-5",
    username: "David Kim",
    completedLevels: 5,
    lastActivityDate: "2d ago",
  },
];

export default function CityPage() {
  const { data: session } = useSession();
  const [cityTheme, setCityTheme] = useState<CityTheme>("cyberpunk");
  const [levels, setLevels] = useState<CityLevelProgress[]>(MOCK_LEVELS);
  const [users, setUsers] = useState<LeaderboardUser[]>(MOCK_USERS);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [inspectedUser, setInspectedUser] = useState<LeaderboardUser | null>(
    null,
  );

  useEffect(() => {
    dsaApi
      .getCityProgress()
      .then((data) => {
        if (data?.levels && Array.isArray(data.levels) && data.levels.length > 0) {
          setLevels(data.levels);
        }
        if (data?.users && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
        }
      })
      .catch(() => {
        // Fallback to rich mock data
      });
  }, []);

  const currentUserId = session?.user?.email || "user-current";

  return (
    <PageTransition>
      <div className="w-full space-y-8 py-4 sm:py-6 animate-in fade-in duration-700">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 size={13} />
              <span>3D Spatial Metaverse</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
              DSA 3D City Metropolitan
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Every algorithm solved erects physical floors on your personal cyberpunk skyscraper.
            </p>
          </div>
        </div>

        {/* 3D WebGL Metaverse Canvas */}
        <div className="w-full h-[520px]">
          <CityScene
            users={users}
            currentUserId={currentUserId}
            focusedUserId={focusedUserId}
            onFocusUser={(id) => setFocusedUserId(id)}
            theme={cityTheme}
            onThemeChange={(newTheme) => setCityTheme(newTheme)}
            onInspectUser={(u) => setInspectedUser(u)}
          />
        </div>

        {/* Spatial Grid: District Progression Path vs Metropolitan Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Level Progression Roadmap (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-[var(--accent-primary)]" />
                <h3 className="font-bold text-base text-[var(--text-primary)] font-display">
                  Metropolitan District Path
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Ascend to Central Spire
              </span>
            </div>

            <CityLevelPath levels={levels} />
          </div>

          {/* Right: Skyline Leaderboard (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" />
                <h3 className="font-bold text-base text-[var(--text-primary)] font-display">
                  Skyscraper Leaderboard
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Live Skyline
              </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <CityLeaderboard
                users={users}
                currentUserId={currentUserId}
                hoveredUserId={hoveredUserId}
                onHoverUser={(id) => setHoveredUserId(id)}
                onClickUser={(id) => {
                  const target = users.find((u) => u.id === id);
                  if (target) {
                    setInspectedUser(target);
                    setFocusedUserId(id);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* User Inspector Modal */}
        {inspectedUser && (
          <UserInspectorModal
            user={inspectedUser}
            currentUserId={currentUserId}
            rank={
              users.findIndex((u) => u.id === inspectedUser.id) + 1 || 1
            }
            onClose={() => setInspectedUser(null)}
          />
        )}
      </div>
    </PageTransition>
  );
}
