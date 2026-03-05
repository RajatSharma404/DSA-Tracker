"use client";

import React, { useEffect, useState } from "react";
import { dsaApi } from "@/lib/api";
import {
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Loader2,
  Bot,
  User,
} from "lucide-react";

interface Solution {
  id: string;
  code: string;
  language: string;
  verdict: string;
  score: number;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  isAIGenerated: boolean;
  createdAt: string;
}

interface SolutionHistoryProps {
  problemId: string;
}

export function SolutionHistory({ problemId }: SolutionHistoryProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [problemId]);

  const loadHistory = async () => {
    try {
      const data = await dsaApi.getSolutionHistory(problemId);
      setSolutions(data);
    } catch (err) {
      console.error("Failed to load solution history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm p-4">
        <Loader2 size={14} className="animate-spin" />
        Loading history...
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600 text-sm">
        <History className="mx-auto mb-2 text-gray-700" size={24} />
        No submissions yet.
      </div>
    );
  }

  const getVerdictStyle = (verdict: string) => {
    if (verdict === "ACCEPTED")
      return {
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
      };
    if (verdict === "WRONG_ANSWER")
      return {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
    if (verdict === "TIME_LIMIT_EXCEEDED")
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
      };
    return {
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1 mb-3">
        <History size={14} className="text-purple-400" />
        Submission History ({solutions.length})
      </h3>

      {solutions.map((sol) => {
        const style = getVerdictStyle(sol.verdict);
        const isExpanded = expandedId === sol.id;
        const date = new Date(sol.createdAt);

        return (
          <div
            key={sol.id}
            className={`rounded-xl border transition-all ${isExpanded ? "border-white/10 bg-[#0d0d0d]" : "border-white/5 bg-[#0a0a0a]"}`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : sol.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                {sol.verdict === "ACCEPTED" ? (
                  <CheckCircle2 size={14} className="text-green-400" />
                ) : (
                  <XCircle size={14} className="text-red-400" />
                )}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`}
                >
                  {sol.verdict.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-gray-500">{sol.language}</span>
                {sol.isAIGenerated ? (
                  <Bot size={12} className="text-amber-400" />
                ) : (
                  <User size={12} className="text-emerald-400" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold ${getScoreColor(sol.score)}`}
                >
                  {sol.score}/100
                </span>
                <span className="text-[10px] text-gray-600">
                  {date.toLocaleDateString()}{" "}
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isExpanded ? (
                  <ChevronUp size={14} className="text-gray-500" />
                ) : (
                  <ChevronDown size={14} className="text-gray-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {/* Complexity */}
                <div className="flex gap-4 text-xs">
                  {sol.timeComplexity && (
                    <span className="text-gray-400">
                      Time:{" "}
                      <span className="font-mono text-white">
                        {sol.timeComplexity}
                      </span>
                    </span>
                  )}
                  {sol.spaceComplexity && (
                    <span className="text-gray-400">
                      Space:{" "}
                      <span className="font-mono text-white">
                        {sol.spaceComplexity}
                      </span>
                    </span>
                  )}
                </div>

                {/* Code */}
                <pre className="bg-black/50 border border-white/5 rounded-lg p-4 text-xs text-gray-300 overflow-auto max-h-64 font-mono whitespace-pre-wrap">
                  {sol.code}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
