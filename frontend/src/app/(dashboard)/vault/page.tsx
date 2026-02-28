"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import {
  BookOpen, Code2, Search, ChevronDown, ChevronRight,
  Clock, Cpu, Lightbulb, AlertTriangle, Copy, Check,
  StickyNote, Tag, Trash2, Plus, Edit3, X, Save
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  whenToUse: string[];
  template: string;
  gotchas: string[];
}

interface ProblemNote {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  problem: { title: string; topic: { name: string } };
}

const NOTE_TYPE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  GOTCHA:   { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    label: '⚠️ Gotcha' },
  LEARNING: { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   label: '💡 Learning' },
  TIP:      { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  label: '✨ Tip' },
};

export default function VaultPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [notes, setNotes] = useState<ProblemNote[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'notes'>('templates');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, notesData] = await Promise.all([
        dsaApi.getTemplates(),
        dsaApi.getAllNotes()
      ]);
      setTemplates(templatesData);
      setNotes(notesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await dsaApi.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNotes = notes.filter(n =>
    !searchQuery || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.problem.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">The Vault</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">DSA Wiki & Cheat Sheets</p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 sm:ml-auto">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'templates' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'notes' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'
            }`}
          >
            <StickyNote size={14} />
            My Notes
            {notes.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px]">{notes.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'templates' ? 'Search patterns... (e.g. "binary search", "BFS")' : 'Search your notes...'}
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30 transition-colors"
        />
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Cards */}
          <div className="space-y-3">
            {filteredTemplates.map(t => {
              const isExpanded = expandedTemplate === t.id;
              return (
                <div key={t.id} className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                  {/* Header */}
                  <button
                    onClick={() => setExpandedTemplate(isExpanded ? null : t.id)}
                    className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-white">{t.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 break-words">{t.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Clock size={10} className="text-cyan-400" />
                        <span className="text-[9px] font-black text-cyan-400">{t.timeComplexity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Cpu size={10} className="text-purple-400" />
                        <span className="text-[9px] font-black text-purple-400">{t.spaceComplexity}</span>
                      </div>
                    </div>
                    <div className="text-gray-500">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                      {/* Complexity on mobile */}
                      <div className="flex sm:hidden items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <Clock size={10} className="text-cyan-400" />
                          <span className="text-[9px] font-black text-cyan-400">{t.timeComplexity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Cpu size={10} className="text-purple-400" />
                          <span className="text-[9px] font-black text-purple-400">{t.spaceComplexity}</span>
                        </div>
                      </div>

                      {/* When to Use */}
                      <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={12} className="text-green-400" />
                          <span className="text-[9px] font-black text-green-400/70 uppercase tracking-widest">When to use</span>
                        </div>
                        <ul className="space-y-1.5">
                          {t.whenToUse.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-green-200/70 font-medium">
                              <span className="text-green-500 mt-0.5">→</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Code Template */}
                      <div className="relative">
                        <div className="flex items-center justify-between bg-[#121218] border border-white/5 rounded-t-xl px-4 py-2">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Template Code</span>
                          <button
                            onClick={() => handleCopy(t.id, t.template)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 transition-all"
                          >
                            {copiedId === t.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            {copiedId === t.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-4 bg-[#0c0c12] border border-white/5 border-t-0 rounded-b-xl overflow-x-auto">
                          <code className="text-[11px] font-mono text-blue-200/80 leading-relaxed whitespace-pre-wrap break-words">{t.template}</code>
                        </pre>
                      </div>

                      {/* Gotchas */}
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={12} className="text-amber-400" />
                          <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest">Common Gotchas</span>
                        </div>
                        <ul className="space-y-2">
                          {t.gotchas.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-amber-200/70 font-medium">
                              <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                              <span className="break-words">{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="py-16 text-center text-gray-600">
                <Code2 size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">No templates match your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {filteredNotes.length === 0 ? (
            <div className="py-20 text-center">
              <StickyNote size={48} className="mx-auto mb-4 text-gray-800" />
              <h3 className="text-lg font-black text-gray-500 mb-1">No notes yet</h3>
              <p className="text-[11px] text-gray-600 font-medium max-w-sm mx-auto">
                Add notes to problems from the Topics page. Your gotchas, learnings, and tips will appear here for quick review before interviews.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredNotes.map(note => {
                const style = NOTE_TYPE_STYLES[note.type] || NOTE_TYPE_STYLES.LEARNING;
                return (
                  <div key={note.id} className="p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${style.bg} ${style.border} border rounded-lg ${style.text} text-[9px] font-black uppercase tracking-widest mb-2`}>
                          {style.label}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{note.problem.title}</h4>
                        <span className="text-[10px] text-gray-600 font-medium">{note.problem.topic.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-[12px] text-gray-300 leading-relaxed break-words whitespace-pre-wrap">{note.content}</p>
                    <p className="text-[9px] text-gray-700 mt-3 font-medium">
                      {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
