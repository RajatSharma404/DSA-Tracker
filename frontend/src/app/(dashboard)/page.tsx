"use client";

import { useEffect, useState } from "react";
import { dsaApi, DashboardStats } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { CheckCircle2, Flame, Target, BookOpen, LayoutGrid, Calendar } from "lucide-react";
import Link from "next/link";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import LeetCodeSync from "@/components/dashboard/LeetCodeSync";
import SkillRadar from "@/components/dashboard/SkillRadar";
import DailyFocus from "@/components/dashboard/DailyFocus";
import BadgeShowcase from "@/components/dashboard/BadgeShowcase";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<Array<{ date: string, count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, actData] = await Promise.all([
            dsaApi.getDashboardStats(),
            dsaApi.getActivityData()
        ]);
        setStats(statsData);
        setActivityData(actData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back to DSA Pro. Keep crushing those problems.</p>
      </div>

      {/* Daily Focus — Problem of the Day */}
      <DailyFocus />

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
            <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden h-full">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">Consistency Map</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Your daily grind history</p>
                    </div>
                </div>
                <ActivityHeatmap data={activityData} />
            </div>
        </div>
        <div className="md:col-span-4 flex flex-col gap-6">
            <LeetCodeSync />
            <BadgeShowcase />
            <SkillRadar />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${stats.progressPercentage}%`}
          description={`${stats.solvedProblems} of ${stats.totalProblems} solved`}
          icon={Target}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} Days`}
          description={`Longest: ${stats.longestStreak} Days`}
          icon={Flame}
        />
        <StatCard
          title="Problems Solved"
          value={stats.solvedProblems}
          icon={CheckCircle2}
        />
        <StatCard
          title="Active Topics"
          value="In Progress"
          icon={BookOpen}
        />
      </div>

      {/* Progress Bar overall */}
      <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Roadmap Completion</h3>
          <span className="text-sm font-medium">{stats.progressPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Revision Reminders Panel */}
        <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full -ml-12 -mt-12 group-hover:bg-blue-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-3">
             <Target size={20} className="text-blue-400" />
             Active Revision
          </h3>
          <div className="space-y-4">
             {stats.revisions?.length > 0 ? (
                stats.revisions.map(rev => (
                   <div key={rev.id} className="p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-[1.5rem] border border-white/5 flex justify-between items-center transition-all group/item">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <div>
                           <p className="font-bold text-sm text-gray-200 group-hover/item:text-white transition-colors">{rev.title}</p>
                           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{rev.topicName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                         STALE {rev.daysSince}D
                      </span>
                   </div>
                ))
             ) : (
                <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Curriculum fully synchronized
                </div>
             )}
          </div>
        </div>

        {/* Weak Topics Panel */}
        <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-24 h-24 bg-red-500/5 blur-[40px] rounded-full -ml-12 -mt-12 group-hover:bg-red-500/10 transition-all duration-700" />
          <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6 flex items-center gap-3">
             <Flame size={20} className="text-red-400" />
             Weakness Analysis
          </h3>
          <div className="space-y-4">
             {stats.weakTopics?.length > 0 ? (
                stats.weakTopics.map((topic, i) => (
                   <div key={i} className="p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-[1.5rem] border border-white/5 flex justify-between items-center transition-all group/item">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="font-bold text-sm text-gray-200 group-hover/item:text-white transition-colors">{topic.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                         {topic.avgTimeSpent}M AVG PLUNGE
                      </span>
                   </div>
                ))
             ) : (
                <div className="py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Analyzing performance metrics...
                </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
          <Link href="/topics" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Continue Journey
          </Link>
      </div>
    </div>
  );
}
