"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dsaApi } from '@/lib/api';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Lightbulb, Code2, Cpu, Zap, ArrowRight,
  Brain, Eye, Binary, Loader2, ChevronRight
} from 'lucide-react';

interface Variable {
  name: string;
  value: string;
  changed: boolean;
}

interface DSItem {
  value: string;
  state: 'default' | 'active' | 'highlight' | 'done' | 'compare';
}

interface DataStructure {
  type: string;
  label: string;
  items: DSItem[];
}

interface TraceStep {
  step: number;
  phase: string;
  codeLine: string;
  narrative: string;
  thinking: string;
  variables: Variable[];
  dataStructure: DataStructure;
}

interface TraceData {
  sampleInput: string;
  expectedOutput: string;
  approach: string;
  steps: TraceStep[];
}

interface AlgoPlaygroundProps {
  problemId: string;
  problemTitle: string;
  initialCode?: string;
}

const PHASE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  INIT:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30', icon: <Binary size={12} /> },
  PROCESS: { color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30', icon: <Cpu size={12} /> },
  CHECK:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: <Eye size={12} /> },
  FOUND:   { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30', icon: <Zap size={12} /> },
  RETURN:  { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30', icon: <ArrowRight size={12} /> },
  LOOP:    { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: <RotateCcw size={12} /> },
};

const DS_ITEM_STYLES: Record<string, string> = {
  default: 'bg-white/5 border-white/10 text-gray-400',
  active:  'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] scale-110',
  highlight: 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.3)] scale-110',
  done:    'bg-white/[0.02] border-white/5 text-gray-600',
  compare: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.3)] scale-105',
};

export default function AlgoPlayground({ problemId, problemTitle, initialCode = '' }: AlgoPlaygroundProps) {
  const [traceData, setTraceData] = useState<TraceData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateTrace = async () => {
    if (!initialCode.trim()) return;
    setLoading(true);
    setTraceData(null);
    setCurrentIdx(0);
    try {
      const res = await dsaApi.getAlgoTrace(problemId, initialCode);
      setTraceData(res.trace);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && traceData) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= traceData.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playSpeed, traceData]);

  const handleNext = () => {
    if (traceData && currentIdx < traceData.steps.length - 1) setCurrentIdx(currentIdx + 1);
  };
  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };
  const handleReset = () => {
    setCurrentIdx(0);
    setIsPlaying(false);
  };
  const togglePlay = () => setIsPlaying(!isPlaying);

  const currentStep = traceData?.steps[currentIdx];
  const phase = currentStep ? PHASE_CONFIG[currentStep.phase] || PHASE_CONFIG.PROCESS : PHASE_CONFIG.INIT;

  return (
    <div className="mt-8 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/20">
            <Brain size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Dry Run Visualizer</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Step-by-step mind mapper</p>
          </div>
        </div>
        <button
          onClick={generateTrace}
          disabled={loading || !initialCode}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {loading ? 'Building Trace...' : traceData ? 'Re-Trace' : 'Generate Dry Run'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col items-center gap-4 animate-in fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 animate-spin border-t-indigo-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={20} className="text-indigo-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-white uppercase tracking-tight">Building Execution Trace</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Analyzing code flow & variable mutations...</p>
          </div>
        </div>
      )}

      {/* Main Visualizer */}
      {traceData && traceData.steps.length > 0 && !loading && (
        <div className="bg-[#070709] border border-white/5 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-700 min-w-0">
          
          {/* Context Bar */}
          <div className="px-6 py-4 bg-[#0c0c0e] border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Code2 size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Input</span>
              </div>
              <span className="text-xs font-mono text-gray-300 truncate">{traceData.sampleInput}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronRight size={12} className="text-gray-600" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                <Zap size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Output</span>
              </div>
              <span className="text-xs font-mono text-green-300">{traceData.expectedOutput}</span>
            </div>
          </div>

          {/* Approach Banner */}
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-500/5 to-transparent border-b border-white/5">
            <p className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={12} className="text-indigo-400" />
              Strategy: {traceData.approach}
            </p>
          </div>

          {/* Timeline Progress */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-1.5">
              {traceData.steps.map((s, i) => {
                const stepPhase = PHASE_CONFIG[s.phase] || PHASE_CONFIG.PROCESS;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); setIsPlaying(false); }}
                    className={`group relative flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIdx 
                        ? `${stepPhase.bg} shadow-lg` 
                        : i < currentIdx 
                          ? 'bg-white/10' 
                          : 'bg-white/[0.03]'
                    }`}
                  >
                    {i === currentIdx && (
                      <div className={`absolute -top-1 -bottom-1 inset-x-0 rounded-full ${stepPhase.bg} ${stepPhase.border} border animate-pulse`} />
                    )}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-[8px] text-gray-500 font-bold whitespace-nowrap">
                      {s.phase}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} disabled={currentIdx === 0} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-20 transition-all"><SkipBack size={14} /></button>
              <button onClick={togglePlay} className={`p-2.5 rounded-lg transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'}`}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={handleNext} disabled={currentIdx >= (traceData?.steps.length || 0) - 1} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 disabled:opacity-20 transition-all"><SkipForward size={14} /></button>
              <button onClick={handleReset} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-all"><RotateCcw size={14} /></button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[3000, 2000, 1000].map((speed, i) => (
                  <button
                    key={speed}
                    onClick={() => setPlaySpeed(speed)}
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${playSpeed === speed ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    {['1x', '2x', '3x'][i]}
                  </button>
                ))}
              </div>
              <div className={`px-3 py-1 rounded-full ${phase.bg} ${phase.border} border ${phase.color} text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                {phase.icon}
                Step {currentIdx + 1}/{traceData.steps.length}
              </div>
            </div>
          </div>

          {currentStep && (
            <div className="px-6 pb-6 space-y-4 min-w-0">
              {/* Code Line Being Executed */}
              <div className="p-4 bg-[#0d0d12] border border-white/5 rounded-2xl font-mono text-sm overflow-x-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${phase.color === 'text-green-400' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse shadow-lg`} />
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Executing</span>
                </div>
                <code className="text-blue-300 break-words whitespace-pre-wrap">{currentStep.codeLine}</code>
              </div>

              {/* Narrative + Thinking */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* What's happening */}
                <div className={`p-5 rounded-2xl border-l-4 ${phase.border.replace('/30', '/50')} bg-[#0d0d12] border border-white/5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">What&apos;s happening</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium break-words">{currentStep.narrative}</p>
                </div>

                {/* Why it matters */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={12} className="text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest">Interviewer Insight</span>
                  </div>
                  <p className="text-sm text-amber-200/70 leading-relaxed font-medium italic break-words">{currentStep.thinking}</p>
                </div>
              </div>

              {/* Data Structure Visualization */}
              {currentStep.dataStructure && currentStep.dataStructure.items && (
                <div className="p-5 bg-[#0d0d12] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{currentStep.dataStructure.label || 'Data Structure'}</span>
                    <span className="text-[8px] font-bold text-gray-700 uppercase px-2 py-0.5 bg-white/5 rounded">{currentStep.dataStructure.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    {currentStep.dataStructure.items.map((item, i) => (
                      <div
                        key={`${currentIdx}-${i}`}
                        className={`
                          relative flex flex-col items-center gap-1 transition-all duration-500
                          ${DS_ITEM_STYLES[item.state] || DS_ITEM_STYLES.default}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-sm font-black
                          transition-all duration-500
                          ${DS_ITEM_STYLES[item.state] || DS_ITEM_STYLES.default}
                        `}>
                          {item.value}
                        </div>
                        <span className="text-[8px] font-bold text-gray-600">{i}</span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-500/50" /><span className="text-[8px] font-bold text-gray-500 uppercase">Active</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-500/40 border border-green-500/50" /><span className="text-[8px] font-bold text-gray-500 uppercase">Match</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-yellow-500/40 border border-yellow-500/50" /><span className="text-[8px] font-bold text-gray-500 uppercase">Compare</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10" /><span className="text-[8px] font-bold text-gray-500 uppercase">Done</span></div>
                  </div>
                </div>
              )}

              {/* Variable Watch Panel */}
              <div className="p-5 bg-[#0d0d12] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={12} className="text-gray-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Variable Watch</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {currentStep.variables.map((v, i) => (
                    <div
                      key={`${v.name}-${currentIdx}`}
                      className={`
                        p-3 rounded-xl border transition-all duration-500
                        ${v.changed 
                          ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]' 
                          : 'bg-white/[0.02] border-white/5'}
                      `}
                    >
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        {v.name}
                        {v.changed && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      </div>
                      <div className={`text-xs font-mono font-black break-all ${v.changed ? 'text-blue-300' : 'text-gray-400'}`}>
                        {v.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
