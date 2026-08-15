"use client";

import React, { useState, useMemo } from "react";
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

interface ProblemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  problems: Problem[];
  loading?: boolean;
}

export default function ProblemDrawer({
  isOpen,
  onClose,
  topic,
  problems,
  loading = false,
}: ProblemDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TODO" | "DOING" | "DONE" | "DUE"
  >("ALL");

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
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
  }, [problems, searchQuery, difficultyFilter, statusFilter]);

  const solvedCount = problems.filter((p) => p.status === "DONE").length;
  const progressPct =
    problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

  if (!isOpen || !topic) return null;

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HARD":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#0c0c14] shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="border-b border-white/10 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                <BookOpen size={11} />
                <span>Topic Curriculum</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {topic.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {topic.description && (
            <p className="text-xs text-gray-400 leading-relaxed">
              {topic.description}
            </p>
          )}

          {/* Progress Bar & Solved Gauge */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-400">Mastery Progress</span>
              <span className="text-cyan-400">
                {solvedCount} / {problems.length} Solved ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search problem title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    difficultyFilter === d
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}

              <div className="w-px h-4 bg-white/10 mx-1" />

              {(["ALL", "TODO", "DOING", "DONE", "DUE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:text-white"
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
            <div className="py-20 text-center text-xs text-gray-500">
              Loading problems...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-bold text-gray-400">
                No matching problems found
              </p>
              <p className="text-xs text-gray-600">
                Try clearing your search or filter selections.
              </p>
            </div>
          ) : (
            filteredProblems.map((prob) => {
              const isDone = prob.status === "DONE";
              const isDue =
                isDone &&
                !!prob.nextReviewDate &&
                new Date(prob.nextReviewDate) <= new Date();

              return (
                <div
                  key={prob.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isDue
                      ? "bg-amber-950/20 border-amber-500/30"
                      : isDone
                        ? "bg-emerald-950/10 border-emerald-500/20"
                        : "bg-[#11111a] border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isDue ? (
                          <AlertTriangle size={16} className="text-amber-400" />
                        ) : isDone ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Circle size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/problems/${prob.id}`}
                          className="text-sm font-bold text-white hover:text-cyan-400 transition-colors block line-clamp-1"
                        >
                          {prob.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          {prob.timeSpent > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {prob.timeSpent}m
                            </span>
                          )}
                          {isDue && (
                            <span className="text-amber-400 font-bold">
                              • Due for SM-2 Review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getDiffBadge(prob.difficulty)}`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {prob.link ? (
                      <a
                        href={prob.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={12} />
                        LeetCode
                      </a>
                    ) : (
                      <span className="text-[11px] text-gray-600">
                        Standard Problem
                      </span>
                    )}

                    <Link
                      href={`/problems/${prob.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-bold transition-all"
                    >
                      <span>Solve in IDE</span>
                      <ChevronRight size={14} />
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
