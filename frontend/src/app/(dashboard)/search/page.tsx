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
} from "lucide-react";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTagCreate, setShowTagCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dsaApi.getTopics().then(setTopics);
    dsaApi
      .getTags()
      .then(setTags)
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

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
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

  const handleTagProblem = async (tagId: string, problemId: string) => {
    try {
      const result = await dsaApi.toggleProblemTag(tagId, problemId);
      // Refresh search to update tags
      handleSearch();
    } catch (err) {
      console.error("Tag problem failed:", err);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
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

  const getDifficultyColor = (d: string) => {
    if (d === "EASY")
      return "text-green-400 bg-green-500/10 border-green-500/20";
    if (d === "MEDIUM")
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getStatusColor = (s: string) => {
    if (s === "DONE")
      return "text-green-400 bg-green-500/10 border-green-500/20";
    if (s === "DOING") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-gray-400 bg-gray-500/10 border-gray-500/20";
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Search size={28} className="text-blue-400" />
            Explore Problems
          </h1>
          <p className="text-gray-400 mt-2">
            Search, filter, bookmark, and tag your problems.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => handleExport("json")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors"
          >
            <Download size={14} />
            JSON
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Search problems by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0d0d0d] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
        />
      </div>

      {/* Filters Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
      >
        <Filter size={14} />
        Filters & Tags
        <ChevronDown
          size={14}
          className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="">All</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="">All</option>
                <option value="TODO">To Do</option>
                <option value="DOING">In Progress</option>
                <option value="DONE">Solved</option>
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Topic
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bookmarked */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Bookmarks
              </label>
              <button
                onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-bold transition-all ${
                  bookmarkedOnly
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                {bookmarkedOnly ? (
                  <span className="flex items-center gap-2 justify-center">
                    <BookmarkCheck size={14} /> Bookmarked Only
                  </span>
                ) : (
                  "Show All"
                )}
              </button>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tags
              </label>
              <button
                onClick={() => setShowTagCreate(!showTagCreate)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus size={12} /> New Tag
              </button>
            </div>

            {/* Create Tag */}
            {showTagCreate && (
              <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-white/5">
                <input
                  type="text"
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:outline-none"
                />
                <div className="flex gap-1">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewTagColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${newTagColor === c ? "scale-125 ring-2 ring-white/30" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateTag}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/30"
                >
                  Create
                </button>
              </div>
            )}

            {/* Tag List */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag("")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  !selectedTag
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <div key={tag.id} className="relative group">
                  <button
                    onClick={() =>
                      setSelectedTag(selectedTag === tag.id ? "" : tag.id)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      selectedTag === tag.id
                        ? "border-white/20 text-white"
                        : "border-white/5 text-gray-400 hover:text-gray-200"
                    }`}
                    style={{
                      backgroundColor:
                        selectedTag === tag.id
                          ? `${tag.color}20`
                          : "transparent",
                      borderColor:
                        selectedTag === tag.id ? `${tag.color}40` : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    <span className="text-gray-600">
                      ({tag.problems.length})
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>
            {results.length} problem{results.length !== 1 ? "s" : ""} found
          </span>
          {loading && <Loader2 size={14} className="animate-spin" />}
        </div>

        {results.map((problem) => (
          <div
            key={problem.id}
            className="p-4 rounded-xl bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Bookmark Button */}
              <button
                onClick={() => handleToggleBookmark(problem.id)}
                className="shrink-0 transition-colors"
              >
                {problem.isBookmarked ? (
                  <BookmarkCheck
                    size={18}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ) : (
                  <Bookmark
                    size={18}
                    className="text-gray-600 hover:text-yellow-400"
                  />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="font-medium text-gray-200 hover:text-white transition-colors truncate"
                  >
                    {problem.title}
                  </Link>
                  {problem.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}30`,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600">
                    {problem.topicName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}
                  >
                    {problem.difficulty}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(problem.status)}`}
                  >
                    {problem.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Tag dropdown and link */}
            <div className="flex items-center gap-2">
              {tags.length > 0 && (
                <div className="relative group/tag">
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-300 transition-colors">
                    <Tag size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 hidden group-hover/tag:block z-10 shadow-xl">
                    {tags.map((tag) => {
                      const isTagged = problem.tags.some(
                        (t) => t.id === tag.id,
                      );
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleTagProblem(tag.id, problem.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isTagged
                              ? "bg-white/10 text-white"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                          {isTagged && (
                            <span className="ml-auto text-green-400">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-300 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}

        {results.length === 0 && !loading && (
          <div className="p-12 rounded-2xl bg-[#0d0d0d] border border-white/5 text-center">
            <Search className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">
              No problems found
            </h3>
            <p className="text-gray-400 text-sm">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
