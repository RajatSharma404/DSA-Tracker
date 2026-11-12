"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderEdit,
  PlusCircle,
  DatabaseZap,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { dsaApi } from "@/lib/api";
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from "@/types/features";

const adminModules = [
  {
    title: "Curriculum Management",
    description: "Create and update topics to structure the roadmap.",
    icon: FolderEdit,
    href: "/admin/topics",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    title: "Problem Bank",
    description: "Add new problems, edit links, and set difficulties.",
    icon: PlusCircle,
    href: "/admin/problems",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    title: "User Management",
    description: "View users and manage administrative roles.",
    icon: Users,
    href: "/admin/users",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
];

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [flagsLoading, setFlagsLoading] = useState(true);

  useEffect(() => {
    dsaApi
      .getFeatureFlags()
      .then((data) => {
        setFlags(data);
        setFlagsLoading(false);
      })
      .catch(() => setFlagsLoading(false));
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await dsaApi.adminSeedRoadmap();
      setSeedResult(
        `Seeded ${result.topicsUpserted} topics and ${result.problemsUpserted} problems.`,
      );
    } catch (e: any) {
      setSeedResult("Seed failed: " + (e?.response?.data?.error || e.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-gray-400 mt-2">
          Manage the platform content and users.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group p-6 rounded-2xl bg-[#111] border border-[#222] hover:border-[#333] transition-all"
          >
            <div
              className={`h-12 w-12 rounded-xl ${module.bgColor} ${module.color} flex items-center justify-center mb-6`}
            >
              <module.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2">{module.description}</p>
          </Link>
        ))}
      </div>

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
              Global Users
            </p>
            <p className="text-2xl font-black mt-1">--</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
              Total Problems
            </p>
            <p className="text-2xl font-black mt-1">--</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
              Active Topics
            </p>
            <p className="text-2xl font-black mt-1">--</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
        <div className="flex items-center gap-3 mb-2">
          <DatabaseZap size={20} className="text-green-400" />
          <h2 className="text-lg font-bold">Seed Roadmap Data</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Populate (or re-sync) all DSA topics and problems from the roadmap
          seed file. Safe to run multiple times — existing data is updated, not
          duplicated.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold transition-colors"
        >
          {seeding ? "Seeding…" : "Run Seed"}
        </button>
        {seedResult && (
          <p
            className={`mt-3 text-sm ${seedResult.startsWith("Seed failed") ? "text-red-400" : "text-green-400"}`}
          >
            {seedResult}
          </p>
        )}
      </div>

      {/* Read-Only Feature Flags Panel (Phase 5 Single Source of Truth) */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-[var(--accent-primary)]" />
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Feature Flags (Runtime Status)</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Controlled via host environment variables (Render/Railway/host). Read-only in this phase.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            Host Env Gated
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          {[
            {
              id: "pvp",
              env: "FEATURE_PVP",
              name: "1v1 PvP Battles",
              tier: "PARKED",
              enabled: flags.pvp,
            },
            {
              id: "arena",
              env: "FEATURE_ARENA",
              name: "The Arena Speed Challenge",
              tier: "PARKED",
              enabled: flags.arena,
            },
            {
              id: "interviews",
              env: "FEATURE_INTERVIEWS",
              name: "AI Mock Interviews",
              tier: "PARKED",
              enabled: flags.interviews,
            },
            {
              id: "algotracer",
              env: "FEATURE_ALGOTRACER",
              name: "AlgoTracer 2.0 Visualizer",
              tier: "SHOWPIECE",
              enabled: flags.algotracer,
            },
          ].map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-colors ${
                item.enabled
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-[var(--bg-secondary)] border-[var(--border-subtle)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  {item.tier}
                </span>
                {item.enabled ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 size={13} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)]">
                    <XCircle size={13} /> Disabled
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">{item.env}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          <Info size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
          <p>
            To modify these flags, configure the respective environment variable (e.g.{" "}
            <code className="text-[var(--accent-primary)] font-mono text-[11px]">FEATURE_ARENA=true</code>) on your deployment dashboard or in{" "}
            <code className="font-mono text-[11px]">backend/.env</code>. Changes take effect on the next request without requiring frontend rebuilds.
          </p>
        </div>
      </div>
    </div>
  );
}
