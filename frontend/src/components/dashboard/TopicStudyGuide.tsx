"use client";

import { useState } from 'react';
import { getStudyGuide, StudyGuide } from '@/data/studyGuides';
import { BookOpen, ChevronDown, ChevronRight, Copy, Check, Lightbulb, Table, Code2, Brain, ArrowRight } from 'lucide-react';

export default function TopicStudyGuide({ topicName }: { topicName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState(false);

  const guide = getStudyGuide(topicName);
  if (!guide) return null;

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    if (expandedSections.size === guide.sections.length + 3) {
      setExpandedSections(new Set());
    } else {
      const all = new Set<number>();
      for (let i = 0; i < guide.sections.length + 3; i++) all.add(i);
      setExpandedSections(all);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(guide.codeExample.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && expandedSections.size === 0) setExpandedSections(new Set([0])); }}
        className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <BookOpen size={14} />
        {isOpen ? 'Hide Study Guide' : `📖 Study Guide: ${guide.tagline}`}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-in fade-in zoom-in-95 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{guide.emoji}</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">{guide.topicName}</h3>
                <p className="text-[10px] text-gray-500">Prerequisite: {guide.prerequisite}</p>
              </div>
            </div>
            <button onClick={expandAll} className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest hover:text-emerald-400 transition-colors">
              {expandedSections.size === guide.sections.length + 3 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Concept Sections */}
          {guide.sections.map((section, idx) => (
            <div key={idx} className="border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center gap-2 p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
              >
                <span className="text-sm">{section.icon}</span>
                <span className="text-[11px] font-bold text-white flex-1">{section.title}</span>
                {expandedSections.has(idx) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
              </button>
              {expandedSections.has(idx) && (
                <div className="p-4 bg-black/20">
                  <pre className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-mono break-words">{section.content}</pre>
                </div>
              )}
            </div>
          ))}

          {/* Pattern Triggers */}
          <div className="border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(guide.sections.length)}
              className="w-full flex items-center gap-2 p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
            >
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold text-white flex-1">🎯 Pattern Recognition — &quot;When I See X, I Think Y&quot;</span>
              {expandedSections.has(guide.sections.length) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length) && (
              <div className="p-4 bg-black/20 space-y-2">
                {guide.patternTriggers.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-amber-400 shrink-0 mt-0.5">▸</span>
                    <div className="min-w-0">
                      <span className="text-gray-400">If you see </span>
                      <span className="text-white font-bold break-words">{pt.trigger}</span>
                      <ArrowRight size={10} className="inline mx-1 text-gray-600" />
                      <span className="text-emerald-400 font-medium break-words">{pt.pattern}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complexity Table */}
          <div className="border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(guide.sections.length + 1)}
              className="w-full flex items-center gap-2 p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
            >
              <Table size={14} className="text-blue-400" />
              <span className="text-[11px] font-bold text-white flex-1">⏱️ Complexity Reference</span>
              {expandedSections.has(guide.sections.length + 1) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length + 1) && (
              <div className="p-4 bg-black/20 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-gray-500 uppercase tracking-widest border-b border-white/5">
                      <th className="text-left py-2 pr-4 font-black">Operation</th>
                      <th className="text-left py-2 pr-4 font-black">Time</th>
                      <th className="text-left py-2 font-black">Space</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.complexityTable.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="py-1.5 pr-4 text-gray-300 font-medium">{row.operation}</td>
                        <td className="py-1.5 pr-4 text-blue-400 font-bold">{row.time}</td>
                        <td className="py-1.5 text-purple-400 font-bold">{row.space}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Worked Example */}
          <div className="border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(guide.sections.length + 2)}
              className="w-full flex items-center gap-2 p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
            >
              <Code2 size={14} className="text-green-400" />
              <span className="text-[11px] font-bold text-white flex-1">🧪 Worked Example: {guide.codeExample.title}</span>
              {expandedSections.has(guide.sections.length + 2) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length + 2) && (
              <div className="p-4 bg-black/20 space-y-3">
                <div className="relative">
                  <pre className="text-[11px] text-green-300 bg-black/40 p-4 rounded-lg overflow-x-auto font-mono whitespace-pre">{guide.codeExample.code}</pre>
                  <button onClick={copyCode} className="absolute top-2 right-2 p-1.5 bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                    {copiedCode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Step-by-step Walkthrough:</span>
                  <pre className="mt-2 text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-mono break-words">{guide.codeExample.walkthrough}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaways */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Key Takeaways</span>
            </div>
            <ul className="space-y-1">
              {guide.keyTakeaways.map((t, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span className="break-words">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
