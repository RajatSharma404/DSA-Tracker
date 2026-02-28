"use client";

import React, { useState } from 'react';
import { dsaApi } from '@/lib/api';
import { Sparkles, Loader2, Lightbulb, ChevronRight, Brain } from 'lucide-react';

interface AIMentorHintProps {
  problemId: string;
  problemTitle: string;
}

export default function AIMentorHint({ problemId, problemTitle }: AIMentorHintProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchHint = async () => {
    if (hint) {
      setIsOpen(!isOpen);
      return;
    }
    
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await dsaApi.getAIHint(problemId);
      setHint(res.hint);
    } catch (err) {
      console.error(err);
      setHint("I'm having trouble accessing my patterns database. Try visualizing the core data structure needed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={fetchHint}
        className={`group flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300
          ${isOpen 
            ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' 
            : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'}
        `}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Brain size={13} className={isOpen ? '' : 'group-hover:scale-125 transition-transform'} />}
        {hint && isOpen ? 'Hide Insight' : 'Get Mentor Insight'}
      </button>

      {isOpen && (
        <div className="mt-4 p-5 bg-[#0f0a15] border border-purple-500/20 rounded-[1.5rem] animate-in slide-in-from-top-3 fade-in duration-500 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
             <Sparkles size={60} className="text-purple-500" />
          </div>
          
          <div className="relative flex items-start gap-4">
             <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Lightbulb size={18} />
             </div>
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Mastery Path</span>
                   <ChevronRight size={10} className="text-gray-700" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{problemTitle}</span>
                </div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-purple-500/10 rounded-full w-48 animate-pulse" />
                    <div className="h-3 bg-purple-500/5 rounded-full w-32 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">
                    {hint}
                  </p>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
