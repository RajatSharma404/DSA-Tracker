"use client";

import { LayoutDashboard, BookOpen, Users, FolderEdit, PlusCircle, DatabaseZap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { dsaApi } from "@/lib/api";

const adminModules = [
  {
    title: "Curriculum Management",
    description: "Create and update topics to structure the roadmap.",
    icon: FolderEdit,
    href: "/admin/topics",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10"
  },
  {
    title: "Problem Bank",
    description: "Add new problems, edit links, and set difficulties.",
    icon: PlusCircle,
    href: "/admin/problems",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10"
  },
  {
    title: "User Management",
    description: "View users and manage administrative roles.",
    icon: Users,
    href: "/admin/users",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10"
  }
];

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await dsaApi.adminSeedRoadmap();
      setSeedResult(`Seeded ${result.topicsUpserted} topics and ${result.problemsUpserted} problems.`);
    } catch (e: any) {
      setSeedResult("Seed failed: " + (e?.response?.data?.error || e.message));
    } finally {
      setSeeding(false);
    }
  };
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="text-gray-400 mt-2">Manage the platform content and users.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => (
          <Link 
            key={module.href} 
            href={module.href}
            className="group p-6 rounded-2xl bg-[#111] border border-[#222] hover:border-[#333] transition-all"
          >
            <div className={`h-12 w-12 rounded-xl ${module.bgColor} ${module.color} flex items-center justify-center mb-6`}>
              <module.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {module.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Global Users</p>
                <p className="text-2xl font-black mt-1">--</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Total Problems</p>
                <p className="text-2xl font-black mt-1">--</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Active Topics</p>
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
          Populate (or re-sync) all DSA topics and problems from the roadmap seed file. Safe to run multiple times — existing data is updated, not duplicated.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold transition-colors"
        >
          {seeding ? "Seeding…" : "Run Seed"}
        </button>
        {seedResult && (
          <p className={`mt-3 text-sm ${seedResult.startsWith("Seed failed") ? "text-red-400" : "text-green-400"}`}>
            {seedResult}
          </p>
        )}
      </div>
    </div>
  );
}
