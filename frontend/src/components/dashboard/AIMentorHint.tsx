"use client";

import React, { useState } from 'react';
import { dsaApi } from '@/lib/api';
import { Sparkles, Loader2, Lightbulb, ChevronRight } from 'lucide-react';

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
      setHint("Failed to get hint. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={fetchHint}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all
          ${isOpen ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'}
        `}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {hint && isOpen ? 'Hide Mentor Hint' : 'Ask AI Mentor for Hint'}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-[#1a1a1a] border border-purple-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
             <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 mt-1">
                <Lightbulb size={14} />
             </div>
             <div>
                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  Pattern Recognition <ChevronRight size={10} /> {problemTitle}
                </h5>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">
                  {loading ? 'Consulting the patterns database...' : hint}
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
