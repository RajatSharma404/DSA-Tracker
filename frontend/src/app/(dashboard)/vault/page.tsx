"use client";

import { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import {
  BookOpen,
  Code2,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Lightbulb,
  AlertTriangle,
  Copy,
  Check,
  StickyNote,
  Tag,
  Trash2,
  Plus,
  Edit3,
  X,
  Save,
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import { toast } from "sonner";

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

interface SolutionHistory {
  id: string;
  problem: { title: string; topic: { name: string } };
  code: string;
  language: string;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  isOptimal: boolean;
  createdAt: string;
}

const NOTE_TYPE_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  GOTCHA: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    label: "⚠️ Gotcha",
  },
  LEARNING: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    label: "💡 Learning",
  },
  TIP: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    label: "✨ Tip",
  },
};

export default function VaultPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [notes, setNotes] = useState<ProblemNote[]>([]);
  const [solutions, setSolutions] = useState<SolutionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<
    "templates" | "notes" | "solutions"
  >("templates");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, notesData, solutionsData] = await Promise.all([
        dsaApi.getTemplates(),
        dsaApi.getAllNotes(),
        dsaApi.getAllSolutionHistory(),
      ]);
      setTemplates(templatesData);
      setNotes(notesData);
      setSolutions(solutionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, code: string) => {
    soundEffects.playSuccess();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await dsaApi.deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredNotes = notes.filter(
    (n) =>
      !searchQuery ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.problem.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-sm">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-display">
                The Vault
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest font-mono">
                DSA Invariants & Algorithmic Templates
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-subtle)] sm:ml-auto font-mono">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab("templates");
            }}
            aria-pressed={activeTab === "templates"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Code2 size={14} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab("notes");
            }}
            aria-pressed={activeTab === "notes"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <StickyNote size={14} />
            <span>My Notes</span>
            {notes.length > 0 && (
              <span className="px-1.5 py-0.5 bg-black/20 rounded text-[9px]">
                {notes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab("solutions");
            }}
            aria-pressed={activeTab === "solutions"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === "solutions"
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Code2 size={14} />
            <span>My Solutions</span>
            {solutions.length > 0 && (
              <span className="px-1.5 py-0.5 bg-black/20 rounded text-[9px]">
                {solutions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === "templates"
              ? 'Search patterns... (e.g. "binary search", "BFS", "Dijkstra")'
              : "Search your notes..."
          }
          className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveCategory(cat);
                }}
                aria-pressed={activeCategory === cat}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[var(--accent-primary)] text-black font-extrabold shadow-sm"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Cards */}
          <div className="space-y-3">
            {filteredTemplates.map((t) => {
              const isExpanded = expandedTemplate === t.id;
              return (
                <div
                  key={t.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden transition-all hover:border-[var(--border-medium)] shadow-sm"
                >
                  {/* Header */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setExpandedTemplate(isExpanded ? null : t.id);
                    }}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center gap-4 p-5 text-left cursor-pointer"
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-[var(--text-primary)] font-display">
                        {t.name}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 break-words">
                        {t.description}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0 font-mono">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--accent-primary)]/20">
                        <Clock size={10} className="text-[var(--accent-primary)]" />
                        <span className="text-[9px] font-black text-[var(--accent-primary)]">
                          {t.timeComplexity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Cpu size={10} className="text-purple-400" />
                        <span className="text-[9px] font-black text-purple-400">
                          {t.spaceComplexity}
                        </span>
                      </div>
                    </div>
                    <div className="text-[var(--text-muted)]">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-subtle)] pt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                      {/* Complexity on mobile */}
                      <div className="flex sm:hidden items-center gap-3 mb-2 font-mono">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--accent-primary)]/20">
                          <Clock size={10} className="text-[var(--accent-primary)]" />
                          <span className="text-[9px] font-black text-[var(--accent-primary)]">
                            {t.timeComplexity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Cpu size={10} className="text-purple-400" />
                          <span className="text-[9px] font-black text-purple-400">
                            {t.spaceComplexity}
                          </span>
                        </div>
                      </div>

                      {/* When to Use */}
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={12} className="text-emerald-400" />
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                            When to use
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {t.whenToUse.map((w, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)] font-medium"
                            >
                              <span className="text-emerald-400 mt-0.5">→</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Code Template */}
                      <div className="relative">
                        <div className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-t-2xl px-4 py-2">
                          <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">
                            Template Code
                          </span>
                          <button
                            onClick={() => handleCopy(t.id, t.template)}
                            aria-label={
                              copiedId === t.id
                                ? "Copied template code"
                                : "Copy template code"
                            }
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] transition-all cursor-pointer border border-[var(--border-subtle)] font-mono"
                          >
                            {copiedId === t.id ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedId === t.id ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] border-t-0 rounded-b-2xl overflow-x-auto">
                          <code className="text-[11px] font-mono text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
                            {t.template}
                          </code>
                        </pre>
                      </div>

                      {/* Gotchas */}
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={12} className="text-amber-400" />
                          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">
                            Common Gotchas
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {t.gotchas.map((g, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)] font-medium"
                            >
                              <span className="text-amber-400 shrink-0 mt-0.5">
                                ⚠
                              </span>
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
              <div className="py-16 text-center text-[var(--text-muted)]">
                <Code2 size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">
                  No templates match your search
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {filteredNotes.length === 0 ? (
            <div className="py-20 text-center">
              <StickyNote size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
              <h3 className="text-lg font-black text-[var(--text-muted)] mb-1 font-display">
                No notes yet
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium max-w-sm mx-auto">
                Add notes to problems from the Topics page. Your gotchas,
                learnings, and tips will appear here for quick review before
                interviews.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredNotes.map((note) => {
                const style =
                  NOTE_TYPE_STYLES[note.type] || NOTE_TYPE_STYLES.LEARNING;
                return (
                  <div
                    key={note.id}
                    className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl hover:border-[var(--border-medium)] transition-all group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono ${style.bg} ${style.border} ${style.text}`}
                        >
                          {style.label}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1 font-display">
                        {note.problem?.title || "Problem Note"}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono pt-3 border-t border-[var(--border-subtle)] mt-3">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Solutions Tab */}
      {activeTab === "solutions" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {solutions.length === 0 ? (
            <div className="py-20 text-center">
              <Code2 size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
              <h3 className="text-lg font-black text-[var(--text-muted)] mb-1 font-display">
                No archived solutions yet
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium max-w-sm mx-auto">
                Submit solutions in the Code Editor to automatically archive your code history and Big-O milestones.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {solutions.map((sol) => (
                <div
                  key={sol.id}
                  className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] font-display">
                        {sol.problem?.title || "Problem Solution"}
                      </h4>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {sol.problem?.topic?.name} • {sol.language}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(sol.id, sol.code)}
                      className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl font-bold font-mono transition-all cursor-pointer"
                    >
                      {copiedId === sol.id ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-x-auto">
                    <code className="text-xs font-mono text-[var(--text-primary)]">
                      {sol.code}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
