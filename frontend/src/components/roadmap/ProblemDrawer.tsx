"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Topic, Problem } from "@/lib/api";
import Link from "next/link";
import {
  X,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

import { dsaApi } from "@/lib/api";
import { toast } from "sonner";

interface ProblemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  problems: Problem[];
  loading?: boolean;
  onProblemStatusChange?: (problemId: string, newStatus: "TODO" | "DOING" | "DONE") => void;
}

export default function ProblemDrawer({
  isOpen,
  onClose,
  topic,
  problems: initialProblems,
  loading = false,
  onProblemStatusChange,
}: ProblemDrawerProps) {
  const [localProblems, setLocalProblems] = useState<Problem[]>(initialProblems);

  useEffect(() => {
    setLocalProblems(initialProblems);
  }, [initialProblems]);

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TODO" | "DOING" | "DONE" | "DUE"
  >("ALL");

  const handleToggleStatus = async (problemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    if (nextStatus === "DONE") {
      soundEffects.playSuccess();
    } else {
      soundEffects.playClick();
    }

    // Optimistic Update
    setLocalProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, status: nextStatus as any } : p)),
    );
    onProblemStatusChange?.(problemId, nextStatus as any);

    try {
      await dsaApi.updateProgress(problemId, nextStatus as any, 0);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to save progress. Reverting...");
      setLocalProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, status: currentStatus as any } : p)),
      );
      onProblemStatusChange?.(problemId, currentStatus as any);
    }
  };

  const filteredProblems = useMemo(() => {
    return localProblems.filter((prob) => {
      const matchesSearch =
        !searchQuery.trim() ||
        prob.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff =
        difficultyFilter === "ALL" || prob.difficulty === difficultyFilter;

      const isDue =
        prob.status === "DONE" &&
        !!prob.nextReviewDate &&
        new Date(prob.nextReviewDate) <= new Date();

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "DUE"
            ? isDue
            : prob.status === statusFilter;

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [localProblems, searchQuery, difficultyFilter, statusFilter]);

  const solvedCount = localProblems.filter((p) => p.status === "DONE").length;
  const progressPct =
    localProblems.length > 0 ? Math.round((solvedCount / localProblems.length) * 100) : 0;

  if (!isOpen || !topic) return null;

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => {
          soundEffects.playClick();
          onClose();
        }}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[10px] font-black uppercase tracking-wider">
                <BookOpen size={11} />
                <span>Topic Curriculum</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-display">
                {topic.name}
              </h2>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer border border-[var(--border-subtle)]"
            >
              <X size={18} />
            </button>
          </div>

          {topic.description && (
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {topic.description}
            </p>
          )}

          {/* Progress Bar & Solved Gauge */}
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-[var(--text-muted)]">Mastery Progress</span>
              <span className="text-[var(--accent-primary)]">
                {solvedCount} / {localProblems.length} Solved ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search problem title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    soundEffects.playClick();
                    setDifficultyFilter(d);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    difficultyFilter === d
                      ? "bg-[var(--accent-primary)] text-black font-black shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {d}
                </button>
              ))}

              <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

              {(["ALL", "TODO", "DOING", "DONE", "DUE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundEffects.playClick();
                    setStatusFilter(s);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {s === "DUE" ? "Due Review" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-20 text-center text-xs text-[var(--text-muted)] font-mono">
              Loading problems...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-bold text-[var(--text-muted)]">
                No matching problems found
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Try loosening your filters or search query
              </p>
            </div>
          ) : (
            filteredProblems.map((p) => {
              const isDone = p.status === "DONE";
              const isDoing = p.status === "DOING";
              const isDue =
                isDone &&
                !!p.nextReviewDate &&
                new Date(p.nextReviewDate) <= new Date();

              return (
                <div
                  key={p.id}
                  className="group flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      className="shrink-0 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                      title={isDone ? "Mark as Incomplete" : "Mark as Solved"}
                    >
                      {isDone ? (
                        <CheckCircle2
                          size={20}
                          className="text-emerald-400 fill-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        />
                      ) : isDoing ? (
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <Circle
                          size={20}
                          className="text-[var(--text-muted)] hover:text-emerald-400 transition-colors"
                        />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${p.id}`}
                          onMouseEnter={() => {
                            void dsaApi.getProblem(p.id);
                          }}
                          onClick={() => soundEffects.playClick()}
                          className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate"
                        >
                          {p.title}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getDiffBadge(
                            p.difficulty,
                          )}`}
                        >
                          {p.difficulty}
                        </span>

                        {isDue && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                            <Clock size={10} /> Due Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/problems/${p.id}`}
                      onClick={() => soundEffects.playClick()}
                      className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40 transition-all"
                      title="Open in Workspace"
                    >
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
