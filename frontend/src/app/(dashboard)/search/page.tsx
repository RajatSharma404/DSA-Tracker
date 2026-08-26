"use client";

import React, { useEffect, useState, useCallback } from "react";
import { dsaApi, Topic } from "@/lib/api";
import Link from "next/link";
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Tag,
  X,
  Plus,
  Loader2,
  ChevronDown,
  Download,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { getDifficultyStyle, getStatusStyle } from "@/lib/design-tokens";
import { soundEffects } from "@/lib/soundEffects";
import { queryCache } from "@/lib/queryCache";
import { FixedSizeList as List } from "react-window";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  link: string | null;
  difficulty: string;
  topicId: string;
  topicName: string;
  status: string;
  timeSpent: number;
  isBookmarked: boolean;
  tags: Array<{ id: string; name: string; color: string }>;
}

interface UserTag {
  id: string;
  name: string;
  color: string;
  problems: Array<{ id: string }>;
}

const getDifficultyColor = (d: string) => {
  const style = getDifficultyStyle(d as "EASY" | "MEDIUM" | "HARD");
  return `${style.text} ${style.bg} ${style.border}`;
};

const getStatusColor = (s: string) => {
  if (s === "DONE") {
    const style = getStatusStyle("success");
    return `${style.text} ${style.bg} ${style.border}`;
  }
  if (s === "DOING") {
    const style = getStatusStyle("info");
    return `${style.text} ${style.bg} ${style.border}`;
  }
  const style = getStatusStyle("warning");
  return `${style.text} ${style.bg} ${style.border}`;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const cachedTopics = queryCache.get<Topic[]>("topics");
  const cachedTags = queryCache.get<UserTag[]>("user_tags");
  const [topics, setTopics] = useState<Topic[]>(cachedTopics || []);
  const [tags, setTags] = useState<UserTag[]>(cachedTags || []);
  const [loading, setLoading] = useState(false);
  const [showTagCreate, setShowTagCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dsaApi
      .getTopics()
      .then((data) => {
        setTopics(data);
        queryCache.set("topics", data);
      })
      .catch(() => setTopics([]));
    dsaApi
      .getTags()
      .then((data) => {
        setTags(data);
        queryCache.set("user_tags", data);
      })
      .catch(() => {});
    handleSearch();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dsaApi.searchProblems({
        q: query || undefined,
        difficulty: difficulty || undefined,
        status: status || undefined,
        topicId: topicId || undefined,
        bookmarked: bookmarkedOnly || undefined,
        tagId: selectedTag || undefined,
      });
      setResults(res);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [query, difficulty, status, topicId, bookmarkedOnly, selectedTag]);

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [handleSearch]);

  const handleToggleBookmark = async (problemId: string) => {
    soundEffects.playClick();
    try {
      const result = await dsaApi.toggleBookmark(problemId);
      setResults((prev) =>
        prev.map((r) =>
          r.id === problemId ? { ...r, isBookmarked: result.bookmarked } : r,
        ),
      );
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleToggleStatus = async (problemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    if (nextStatus === "DONE") soundEffects.playSuccess();
    else soundEffects.playClick();

    // Optimistic UI Update
    setResults((prev) =>
      prev.map((r) => (r.id === problemId ? { ...r, status: nextStatus } : r)),
    );

    try {
      await dsaApi.updateProgress(problemId, nextStatus as any, 0);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status. Reverting...");
      setResults((prev) =>
        prev.map((r) => (r.id === problemId ? { ...r, status: currentStatus } : r)),
      );
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    soundEffects.playSuccess();
    try {
      const tag = await dsaApi.createTag(newTagName.trim(), newTagColor);
      setTags((prev) => [...prev, { ...tag, problems: [] }]);
      setNewTagName("");
      setShowTagCreate(false);
    } catch (err) {
      console.error("Tag creation failed:", err);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await dsaApi.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      if (selectedTag === tagId) setSelectedTag("");
    } catch (err) {
      console.error("Tag deletion failed:", err);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    soundEffects.playSuccess();
    setExporting(true);
    try {
      const data = await dsaApi.exportProgress(format);
      if (format === "csv") {
        const blob = new Blob([data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dsa-progress.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dsa-progress.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };



  const TAG_COLORS = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-[var(--text-primary)] font-display">
            <Search size={28} className="text-[var(--accent-primary)]" />
            <span>Explore Problems</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            Search, filter, bookmark, and tag your problems.
          </p>
        </div>
        <div className="flex gap-2 font-mono">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-colors border border-[var(--border-subtle)] cursor-pointer"
          >
            <Download size={14} />
            <span>{exporting ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-colors border border-[var(--border-subtle)] cursor-pointer"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          size={18}
        />
        <input
          type="text"
          placeholder="Search problems by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors text-sm"
        />
      </div>

      {/* Filters Toggle */}
      <button
        onClick={() => {
          soundEffects.playClick();
          setShowFilters(!showFilters)}
        }
        aria-expanded={showFilters}
        aria-controls="search-filters-panel"
        className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-mono"
      >
        <Filter size={14} />
        <span>{showFilters ? "Hide Filters" : "Show Advanced Filters"}</span>
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div
          id="search-filters-panel"
          className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm font-mono"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Difficulty Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  soundEffects.playClick();
                  setDifficulty(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  soundEffects.playClick();
                  setStatus(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="DOING">In Progress</option>
                <option value="DONE">Solved</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                Topic
              </label>
              <select
                value={topicId}
                onChange={(e) => {
                  soundEffects.playClick();
                  setTopicId(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bookmarked Only */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
                <input
                  type="checkbox"
                  checked={bookmarkedOnly}
                  onChange={(e) => {
                    soundEffects.playToggle();
                    setBookmarkedOnly(e.target.checked);
                  }}
                  className="rounded border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-0"
                />
                <Bookmark size={14} className="text-amber-400" />
                <span>Bookmarked Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs text-[var(--text-muted)] font-mono flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
            <span>Searching problems...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center text-[var(--text-muted)] space-y-2">
            <p className="text-base font-bold">No problems found</p>
            <p className="text-xs">Try adjusting your filters or search keywords</p>
          </div>
        ) : results.length > 30 ? (
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 overflow-hidden shadow-sm">
            <List
              height={Math.min(700, results.length * 88)}
              itemCount={results.length}
              itemSize={88}
              width="100%"
            >
              {({ index, style }) => {
                const p = results[index];
                return (
                  <div style={style} className="p-1">
                    <ProblemRow
                      problem={p}
                      onToggleBookmark={() => handleToggleBookmark(p.id)}
                      onToggleStatus={() => handleToggleStatus(p.id, p.status)}
                    />
                  </div>
                );
              }}
            </List>
          </div>
        ) : (
          results.map((p) => (
            <ProblemRow
              key={p.id}
              problem={p}
              onToggleBookmark={() => handleToggleBookmark(p.id)}
              onToggleStatus={() => handleToggleStatus(p.id, p.status)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProblemRow({
  problem: p,
  onToggleBookmark,
  onToggleStatus,
}: {
  problem: SearchResult;
  onToggleBookmark: () => void;
  onToggleStatus: () => void;
}) {
  const isDone = p.status === "DONE";

  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleStatus}
          className="shrink-0 cursor-pointer transition-transform active:scale-90 hover:scale-110"
          title={isDone ? "Mark as TODO" : "Mark as Solved"}
        >
          {isDone ? (
            <CheckCircle2
              size={20}
              className="text-emerald-400 fill-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          ) : (
            <Circle
              size={20}
              className="text-[var(--text-muted)] hover:text-emerald-400 transition-colors"
            />
          )}
        </button>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[10px] text-[var(--text-muted)] font-semibold">
              {p.topicName}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getDifficultyColor(
                p.difficulty,
              )}`}
            >
              {p.difficulty}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                p.status,
              )}`}
            >
              {p.status}
            </span>
          </div>

          <Link
            href={`/problems/${p.id}`}
            onMouseEnter={() => {
              // Pre-fetch problem details on hover for instant 0ms transition
              void dsaApi.getProblem(p.id);
            }}
            onClick={() => soundEffects.playClick()}
            className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors block truncate font-display"
          >
            {p.title}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            p.isBookmarked
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
          title={p.isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
        >
          {p.isBookmarked ? (
            <BookmarkCheck size={16} />
          ) : (
            <Bookmark size={16} />
          )}
        </button>

        {p.link && (
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Open on LeetCode"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
