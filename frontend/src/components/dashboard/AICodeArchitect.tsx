"use client";

import React, { useState, useRef } from 'react';
import { dsaApi } from '@/lib/api';
import { 
  Terminal, Loader2, Zap, Code, ShieldCheck, Trash2, Copy, Check, Info, Sparkles,
  Clock, MemoryStick, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Cpu, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AlgoPlayground from './AlgoPlayground';

interface AICodeArchitectProps {
  problemId: string;
  problemTitle: string;
}

interface StructuredReview {
  verdict: string;
  summary: string;
  efficiency: {
    timeComplexity: string;
    timeExplanation: string;
    spaceComplexity: string;
    spaceExplanation: string;
    isOptimal: boolean;
    optimalNote: string;
  };
  logic: {
    isCorrect: boolean;
    explanation: string;
    edgeCases: Array<{ case: string; handled: boolean; note: string }>;
  };
  cleanCode: Array<{ suggestion: string; example: string }>;
  proTip: string;
}

const VERDICT_STYLES: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  'OPTIMAL':    { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: <CheckCircle2 size={16} /> },
  'GOOD':       { bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  text: 'text-blue-400',  icon: <Zap size={16} /> },
  'NEEDS WORK': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <AlertTriangle size={16} /> },
};

function StructuredReport({ data }: { data: StructuredReview }) {
  const verdict = VERDICT_STYLES[data.verdict] || VERDICT_STYLES['GOOD'];

  return (
    <div className="space-y-5 min-w-0">
      {/* Verdict + Summary */}
      <div className={`p-5 rounded-2xl ${verdict.bg} border ${verdict.border} flex flex-col sm:flex-row sm:items-center gap-4`}>
        <div className={`p-3 rounded-xl ${verdict.bg} ${verdict.text} border ${verdict.border} shrink-0`}>
          {verdict.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${verdict.text}`}>{data.verdict}</span>
          </div>
          <p className="text-sm text-gray-200 font-medium leading-relaxed break-words">{data.summary}</p>
        </div>
      </div>

      {/* Efficiency Section */}
      <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-blue-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency & Complexity</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Time */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-cyan-400" />
              <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-widest">Time</span>
            </div>
            <p className="text-lg font-black text-white font-mono mb-1">{data.efficiency.timeComplexity}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed break-words">{data.efficiency.timeExplanation}</p>
          </div>
          {/* Space */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={12} className="text-purple-400" />
              <span className="text-[9px] font-black text-purple-400/70 uppercase tracking-widest">Space</span>
            </div>
            <p className="text-lg font-black text-white font-mono mb-1">{data.efficiency.spaceComplexity}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed break-words">{data.efficiency.spaceExplanation}</p>
          </div>
        </div>

        {/* Optimal Badge */}
        <div className={`p-3 rounded-xl border flex items-start gap-3 ${data.efficiency.isOptimal ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          {data.efficiency.isOptimal 
            ? <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
            : <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          }
          <p className={`text-[11px] font-medium leading-relaxed break-words ${data.efficiency.isOptimal ? 'text-green-300/80' : 'text-amber-300/80'}`}>
            {data.efficiency.optimalNote}
          </p>
        </div>
      </div>

      {/* Logic & Edge Cases */}
      <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logic & Edge Cases</span>
        </div>

        <div className={`p-3 rounded-xl border flex items-start gap-3 ${data.logic.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          {data.logic.isCorrect 
            ? <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
            : <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          }
          <p className={`text-[11px] font-medium leading-relaxed break-words ${data.logic.isCorrect ? 'text-green-300/80' : 'text-red-300/80'}`}>
            {data.logic.explanation}
          </p>
        </div>

        {/* Edge Cases Table */}
        <div className="space-y-2">
          {data.logic.edgeCases.map((ec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="shrink-0 mt-0.5">
                {ec.handled 
                  ? <CheckCircle2 size={14} className="text-green-500" />
                  : <XCircle size={14} className="text-red-500" />
                }
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-white block">{ec.case}</span>
                <span className="text-[10px] text-gray-500 break-words">{ec.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Code Suggestions */}
      {data.cleanCode && data.cleanCode.length > 0 && (
        <div className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Code size={14} className="text-pink-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clean Code Suggestions</span>
          </div>
          {data.cleanCode.map((cc, i) => (
            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
              <p className="text-[12px] text-gray-200 font-medium break-words">{cc.suggestion}</p>
              {cc.example && (
                <code className="block text-[11px] font-mono text-pink-300/80 bg-pink-500/5 px-3 py-2 rounded-lg border border-pink-500/10 break-all whitespace-pre-wrap">{cc.example}</code>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pro Tip */}
      <div className="p-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Lightbulb size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest block mb-1">Interviewer Pro-Tip</span>
            <p className="text-sm text-amber-200/80 font-medium leading-relaxed italic break-words">{data.proTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AICodeArchitect({ problemId, problemTitle }: AICodeArchitectProps) {
  const [code, setCode] = useState('');
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setReview(null);
    try {
      const res = await dsaApi.getAICodeReview(problemId, code);
      setReview(res.review);
    } catch (err) {
      console.error(err);
      setReview({ type: 'markdown', data: "### ⚠️ Analysis Failed\nPlease try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!review) return;
    const text = review.type === 'structured' ? JSON.stringify(review.data, null, 2) : review.data;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm("Clear code and results?")) {
      setCode('');
      setReview(null);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition-all duration-500 overflow-hidden
          ${isOpen 
            ? 'bg-blue-600 text-white border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
            : 'bg-white/5 text-blue-400 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5'}
        `}
      >
        <span className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <span className="relative z-10 flex items-center gap-2">
          {isOpen ? <Terminal size={14} /> : <Sparkles size={14} className="group-hover:animate-pulse" />}
          {isOpen ? 'Exit Architect Mode' : 'Begin Code Analysis'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 fade-in duration-700 ease-out overflow-hidden min-w-0">
          {/* Editor Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative bg-[#080808] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl min-w-0">
               {/* Terminal Header */}
               <div className="bg-[#121212] border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-80"></div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                    <Code size={10} className="text-blue-400" />
                    <span className="text-[9px] font-black text-blue-400 tracking-[0.1em] uppercase">solution</span>
                  </div>
               </div>

               {/* Textarea */}
               <div className="relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    placeholder={`// Paste your ${problemTitle} solution here...\n\nfunction solution() {\n  \n}`}
                    className="w-full h-56 bg-transparent p-6 text-sm font-mono text-blue-50/90 placeholder:text-white/10 outline-none resize-none leading-relaxed selection:bg-blue-500/30"
                  />
                  {code.length === 0 && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/5 pointer-events-none">
                       <Terminal size={40} />
                       <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Awaiting Source Code</span>
                    </div>
                  )}
               </div>

               {/* Footer */}
               <div className="px-6 py-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={handleClear}
                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={loading || !code.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                      ${loading || !code.trim() 
                        ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                        : 'bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/10'}
                    `}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {loading ? 'Processing...' : 'Run Analysis'}
                  </button>
               </div>
            </div>
          </div>

          {/* Analysis Result Section */}
          {(loading || review) && (
            <div className="p-5 sm:p-8 rounded-[2rem] bg-[#0c0c10] border border-white/5 relative overflow-hidden min-w-0">
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <ShieldCheck size={22} />
                   </div>
                   <div>
                      <h4 className="text-base font-black text-white tracking-tight uppercase flex items-center gap-2">
                        Architect&apos;s Report
                        {review && !loading && <span className="hidden sm:inline-block text-[9px] not-italic px-2 py-0.5 bg-blue-500/20 rounded border border-blue-500/30 text-blue-400">VERIFIED</span>}
                      </h4>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Neural Code Review</p>
                   </div>
                </div>

                {review && !loading && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400 transition-all border border-white/5"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-6 py-8">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Deconstructing solution...</span>
                  </div>
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="h-3 bg-white/5 rounded-full w-full animate-pulse" />
                    <div className="h-3 bg-white/5 rounded-full w-4/5 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="relative min-w-0">
                  {/* Render structured or markdown based on response type */}
                  {review?.type === 'structured' ? (
                    <StructuredReport data={review.data} />
                  ) : (
                    <div className="architect-report prose prose-invert prose-sm max-w-none min-w-0
                      text-gray-300/90 leading-relaxed
                      prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                      prose-strong:text-blue-400 prose-strong:font-black
                      prose-code:bg-white/10 prose-code:text-blue-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-ul:border-l prose-ul:border-blue-500/20 prose-ul:pl-6 prose-li:my-2
                    ">
                      <ReactMarkdown>{review?.data || ''}</ReactMarkdown>
                    </div>
                  )}

                  <div className="mt-8">
                    <AlgoPlayground problemId={problemId} problemTitle={problemTitle} initialCode={code} />
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-white/5 flex items-start gap-3">
                    <Info size={13} className="text-gray-700 mt-0.5 shrink-0" />
                    <p className="text-[9px] text-gray-700 font-medium leading-normal italic">
                      AI-generated analysis optimized for learning. Cross-verify with official documentation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
