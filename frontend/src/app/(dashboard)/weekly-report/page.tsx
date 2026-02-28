"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import {
  FileText, Loader2, TrendingUp, TrendingDown, Minus,
  CheckCircle2, Clock, Flame, Target, AlertTriangle,
  Star, ArrowUp, ArrowDown
} from "lucide-react";

interface WeeklyReport {
  period: { start: string; end: string };
  summary: string;
  thisWeek: {
    solved: number;
    timeMinutes: number;
    diffBreakdown: { EASY: number; MEDIUM: number; HARD: number };
    topicsTouched: string[];
  };
  lastWeek: { solved: number };
  solvedChange: number;
  streak: { current: number; longest: number };
  overall: { totalSolved: number; totalProblems: number };
  weakTopics: Array<{ name: string; total: number; solved: number; pct: number }>;
  strongTopics: Array<{ name: string; total: number; solved: number; pct: number }>;
  topicProgress: Array<{ name: string; total: number; solved: number; pct: number }>;
}

export default function WeeklyReportPage() {
  const [data, setData] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dsaApi.getWeeklyReport().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!data) return null;

  const startDate = new Date(data.period.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(data.period.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const overallPct = data.overall.totalProblems > 0 ? Math.round((data.overall.totalSolved / data.overall.totalProblems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 min-w-0">
      {/* Header */}
      <div className="p-8 rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-blue-600/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Weekly Report</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{startDate} — {endDate}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 mt-4">
            <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solved This Week */}
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">This Week</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-white">{data.thisWeek.solved}</p>
            {data.solvedChange !== 0 && (
              <span className={`flex items-center gap-0.5 text-[10px] font-black mb-1 ${data.solvedChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.solvedChange > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {Math.abs(data.solvedChange)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-600 mt-1">vs {data.lastWeek.solved} last week</p>
        </div>

        {/* Time */}
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-blue-400" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Time</span>
          </div>
          <p className="text-3xl font-black text-white">
            {data.thisWeek.timeMinutes < 60 ? `${data.thisWeek.timeMinutes}m` : `${Math.floor(data.thisWeek.timeMinutes / 60)}h`}
          </p>
          <p className="text-[10px] text-gray-600 mt-1">invested this week</p>
        </div>

        {/* Streak */}
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Streak</span>
          </div>
          <p className="text-3xl font-black text-white">{data.streak.current}</p>
          <p className="text-[10px] text-gray-600 mt-1">days · best: {data.streak.longest}</p>
        </div>

        {/* Overall */}
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-purple-400" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Overall</span>
          </div>
          <p className="text-3xl font-black text-white">{overallPct}%</p>
          <p className="text-[10px] text-gray-600 mt-1">{data.overall.totalSolved}/{data.overall.totalProblems} solved</p>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
        <span className="text-xs font-black text-white uppercase tracking-tight mb-4 block">Difficulty Breakdown</span>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'EASY', count: data.thisWeek.diffBreakdown.EASY, color: 'green' },
            { label: 'MEDIUM', count: data.thisWeek.diffBreakdown.MEDIUM, color: 'yellow' },
            { label: 'HARD', count: data.thisWeek.diffBreakdown.HARD, color: 'red' },
          ].map(d => (
            <div key={d.label} className={`text-center p-4 rounded-xl bg-${d.color}-500/5 border border-${d.color}-500/10`}>
              <p className={`text-2xl font-black text-${d.color}-400`}>{d.count}</p>
              <span className={`text-[8px] font-black text-${d.color}-400/60 uppercase tracking-widest`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topics Touched This Week */}
      {data.thisWeek.topicsTouched.length > 0 && (
        <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
          <span className="text-xs font-black text-white uppercase tracking-tight mb-3 block">Topics Touched This Week</span>
          <div className="flex flex-wrap gap-2">
            {data.thisWeek.topicsTouched.map(t => (
              <span key={t} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strong Topics */}
        <div className="p-6 bg-[#0a0a0f] border border-green-500/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-green-400" />
            <span className="text-xs font-black text-green-400 uppercase tracking-tight">Strengths</span>
          </div>
          {data.strongTopics.length > 0 ? (
            <div className="space-y-3">
              {data.strongTopics.map(t => (
                <div key={t.name} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300 truncate max-w-[140px]">{t.name}</span>
                  <span className="text-[10px] font-black text-green-400">{t.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-600 italic">Complete 70%+ of any topic to see your strengths here</p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="p-6 bg-[#0a0a0f] border border-red-500/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-black text-red-400 uppercase tracking-tight">Needs Work</span>
          </div>
          {data.weakTopics.length > 0 ? (
            <div className="space-y-3">
              {data.weakTopics.map(t => (
                <div key={t.name} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300 truncate max-w-[140px]">{t.name}</span>
                  <span className="text-[10px] font-black text-red-400">{t.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-600 italic">All topics above 30% — great coverage!</p>
          )}
        </div>
      </div>

      {/* Topic Overview */}
      <div className="p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl">
        <span className="text-xs font-black text-white uppercase tracking-tight mb-4 block">Topic Progress Overview</span>
        <div className="space-y-3">
          {data.topicProgress.map(t => (
            <div key={t.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-gray-400 truncate max-w-[200px]">{t.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-600">{t.solved}/{t.total}</span>
                  <span className="text-[10px] font-black text-white w-8 text-right">{t.pct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    t.pct >= 70 ? 'bg-green-500' : t.pct >= 30 ? 'bg-blue-500' : 'bg-red-500/60'
                  }`}
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
