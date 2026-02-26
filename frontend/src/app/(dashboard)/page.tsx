"use client";

import { useEffect, useState } from "react";
import { dsaApi, DashboardStats } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { CheckCircle2, Flame, Target, BookOpen, LayoutGrid, Calendar } from "lucide-react";
import Link from "next/link";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import LeetCodeSync from "@/components/dashboard/LeetCodeSync";

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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <div className="p-8 rounded-3xl bg-[#0d0d0d] border border-white/5 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar size={120} />
                </div>
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <LayoutGrid size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Consistency Map</h2>
                </div>
                <ActivityHeatmap data={activityData} />
            </div>
        </div>
        <div>
            <LeetCodeSync />
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
        <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
             <Target size={20} className="text-blue-400" />
             Revision Reminders
          </h3>
          <div className="space-y-3">
             {stats.revisions?.length > 0 ? (
                stats.revisions.map(rev => (
                   <div key={rev.id} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333] flex justify-between items-center">
                      <div>
                         <p className="font-medium text-sm text-white">{rev.title}</p>
                         <p className="text-xs text-gray-500">{rev.topicName}</p>
                      </div>
                      <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                         {rev.daysSince}d ago
                      </span>
                   </div>
                ))
             ) : (
                <p className="text-sm text-gray-500 italic">No pending revisions. You're up to date!</p>
             )}
          </div>
        </div>

        {/* Weak Topics Panel */}
        <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
             <Flame size={20} className="text-red-400" />
             Areas to Improve
          </h3>
          <div className="space-y-3">
             {stats.weakTopics?.length > 0 ? (
                stats.weakTopics.map((topic, i) => (
                   <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333] flex justify-between items-center">
                      <span className="font-medium text-sm text-white">{topic.name}</span>
                      <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded">
                         Avg: {topic.avgTimeSpent}m
                      </span>
                   </div>
                ))
             ) : (
                <p className="text-sm text-gray-500 italic">Not enough data to determine weak spots yet.</p>
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
