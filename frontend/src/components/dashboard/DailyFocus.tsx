"use client";

import React, { useState, useEffect } from 'react';
import { dsaApi } from '@/lib/api';
import {
  Crosshair, ExternalLink, RotateCcw, Zap, Brain,
  ArrowRight, Loader2, Trophy, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface DailyProblem {
  source: 'REVISION' | 'WEAKNESS';
  reason: string;
  problem: {
    id: string;
    title: string;
    difficulty: string;
    link: string | null;
    topicName: string;
    topicId: string;
  };
}

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  EASY:   { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  HARD:   { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

const SOURCE_CONFIG = {
  REVISION: {
    gradient: 'from-blue-600/20 via-cyan-600/10 to-transparent',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/20',
    icon: <RotateCcw size={16} />,
    label: 'REVISION DUE',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.15)]',
  },
  WEAKNESS: {
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
    icon: <Crosshair size={16} />,
    label: 'WEAKNESS TARGET',
    glow: 'shadow-[0_0_60px_rgba(245,158,11,0.15)]',
  },
};

export default function DailyFocus() {
  const [daily, setDaily] = useState<DailyProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    loadDaily();
  }, []);

  const loadDaily = async () => {
    try {
      const data = await dsaApi.getDailyProblem();
      if (data) {
        setDaily(data);
      } else {
        setAllDone(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 flex items-center justify-center h-48">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-gray-600" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Loading today&apos;s focus...</span>
        </div>
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-emerald-600/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center text-center py-6">
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">All Problems Conquered</h3>
          <p className="text-[11px] text-gray-500 font-medium mt-1 max-w-sm">
            You&apos;ve solved every problem in your roadmap. Keep reviewing to maintain your edge!
          </p>
        </div>
      </div>
    );
  }

  if (!daily) return null;

  const config = SOURCE_CONFIG[daily.source];
  const diffStyle = DIFFICULTY_STYLES[daily.problem.difficulty] || DIFFICULTY_STYLES.MEDIUM;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className={`p-8 rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 relative overflow-hidden ${config.glow} group transition-all duration-700 hover:border-white/10`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-700`} />
      
      {/* Floating sparkle */}
      <div className="absolute top-6 right-6 text-white/[0.03]">
        <Sparkles size={80} />
      </div>

      <div className="relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.accentBg} ${config.accent} border ${config.accentBorder}`}>
              <Crosshair size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Today&apos;s Focus
              </h3>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{dateStr}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${config.accentBg} ${config.accent} border ${config.accentBorder} rounded-full`}>
            {config.icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{config.label}</span>
          </div>
        </div>

        {/* Problem Card */}
        <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${diffStyle.bg} ${diffStyle.text} border ${diffStyle.border}`}>
                  {daily.problem.difficulty}
                </span>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{daily.problem.topicName}</span>
              </div>
              <h4 className="text-base font-black text-white mb-2 break-words">{daily.problem.title}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed break-words">
                <Brain size={11} className="inline mr-1 -mt-0.5" />
                {daily.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {daily.problem.link && (
                <a
                  href={daily.problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                >
                  Solve Now
                  <ExternalLink size={12} />
                </a>
              )}
              <Link
                href="/topics"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
              >
                View
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
