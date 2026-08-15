"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ProblemNodeProps {
  data: {
    label: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    status?: "TODO" | "DOING" | "DONE";
    link?: string;
    nextReviewDate?: string | Date;
    problemId?: string;
    isMoreNode?: boolean;
    moreCount?: number;
    onOpenDrawer?: () => void;
  };
}

const ProblemNode = ({ data }: ProblemNodeProps) => {
  if (data.isMoreNode) {
    return (
      <div
        onClick={data.onOpenDrawer}
        className="group relative px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-linear-to-r from-cyan-950/40 via-[#0d121f] to-[#070d18] hover:border-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer min-w-56 select-none shadow-md flex items-center justify-between"
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5! h-2.5! bg-cyan-400! border-2! border-black! rounded-full!"
        />
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
          <span className="text-cyan-400 font-mono font-black">+{data.moreCount}</span>
          <span>More in Matrix Drawer</span>
        </div>
        <ChevronRight size={13} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    );
  }

  const isDone = data.status === "DONE";
  const isDoing = data.status === "DOING";

  const isRevisionDue =
    !!data.nextReviewDate &&
    isDone &&
    new Date(data.nextReviewDate) <= new Date();

  const getDiffBadge = (diff?: string) => {
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
    <div
      className={`group relative px-3 py-2 rounded-xl border transition-all duration-150 min-w-56 max-w-64 select-none shadow-sm
        ${
          isRevisionDue
            ? "bg-amber-950/30 border-amber-500/40 shadow-amber-500/10"
            : isDone
              ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
              : isDoing
                ? "bg-blue-950/20 border-blue-500/30 hover:border-blue-500/60"
                : "bg-[#0e0e16] border-white/10 hover:border-white/20"
        }
        hover:-translate-y-0.5 hover:scale-[1.01]
      `}
      style={{ willChange: "transform" }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5! h-2.5! bg-gray-400! border-2! border-black! rounded-full!"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="shrink-0">
            {isRevisionDue ? (
              <AlertCircle size={13} className="text-amber-400" />
            ) : isDone ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <Circle size={13} className="text-gray-600" />
            )}
          </div>

          {data.problemId ? (
            <Link
              href={`/problems/${data.problemId}`}
              className="text-xs font-bold text-gray-200 group-hover:text-cyan-300 transition-colors truncate block"
            >
              {data.label}
            </Link>
          ) : (
            <span className="text-xs font-bold text-gray-200 group-hover:text-cyan-300 transition-colors truncate block">
              {data.label}
            </span>
          )}
        </div>

        {data.difficulty && (
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md border shrink-0 ${getDiffBadge(data.difficulty)}`}
          >
            {data.difficulty}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(ProblemNode);
