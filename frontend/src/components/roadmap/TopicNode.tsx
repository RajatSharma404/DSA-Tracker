"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TopicNodeProps {
  data: {
    label: string;
    description?: string;
    progressPercentage: number;
    solvedProblems: number;
    totalProblems: number;
    tier?: string;
    isTarget?: boolean;
    isExpanded?: boolean;
    onOpenDrawer?: () => void;
    onToggleExpand?: () => void;
  };
}

const TopicNode = ({ data }: TopicNodeProps) => {
  const isCompleted = data.progressPercentage === 100;
  const isTarget = !!data.isTarget;
  const isExpanded = !!data.isExpanded;

  return (
    <div
      onClick={data.onOpenDrawer}
      className={`group relative px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer min-w-68 max-w-76 select-none shadow-xl
        ${
          isTarget
            ? "ring-4 ring-cyan-500/50 bg-[#121024] border-cyan-400 shadow-cyan-500/20"
            : isCompleted
              ? "bg-linear-to-b from-[#0a1812] to-[#070e0a] border-emerald-500/60 hover:border-emerald-400 shadow-emerald-500/10"
              : "bg-linear-to-b from-[#101018] to-[#0a0a0f] border-white/10 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
        }
        hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]
      `}
      style={{ willChange: "transform" }}
    >
      {/* Target & Source Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-cyan-400! border-2! border-black! rounded-full!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-cyan-400! border-2! border-black! rounded-full!"
      />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-cyan-500/20 text-cyan-400"
            }`}
          >
            <BookOpen size={14} />
          </div>
          {data.tier && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 truncate">
              {data.tier}
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          <span
            className={`text-xs font-black font-mono ${
              isCompleted ? "text-emerald-400" : "text-cyan-400"
            }`}
          >
            {data.solvedProblems}/{data.totalProblems}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1 mb-3">
        <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-1">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Click Trigger */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
          <span>Mastery</span>
          <span className={isCompleted ? "text-emerald-400" : "text-cyan-400 font-mono"}>
            {data.progressPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-emerald-500"
                : "bg-linear-to-r from-cyan-500 to-blue-500"
            }`}
            style={{ width: `${data.progressPercentage}%` }}
          />
        </div>

        {/* Action Bar with Expand & Drawer triggers */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Expand on Graph Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleExpand?.();
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              isExpanded
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                <span>Hide Nodes</span>
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                <span>Expand Nodes</span>
              </>
            )}
          </button>

          {/* Drawer trigger */}
          <span className="text-[10px] font-bold text-gray-500 group-hover:text-cyan-400 transition-colors inline-flex items-center gap-0.5">
            <span>Matrix</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(TopicNode);
