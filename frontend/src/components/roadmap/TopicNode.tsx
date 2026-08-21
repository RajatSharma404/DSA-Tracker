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
import { soundEffects } from "@/lib/soundEffects";

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
      onClick={() => {
        soundEffects.playClick();
        data.onOpenDrawer?.();
      }}
      className={`group relative px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer min-w-68 max-w-76 select-none shadow-xl
        ${
          isTarget
            ? "ring-4 ring-[var(--accent-primary)]/40 bg-[var(--bg-card)] border-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-glow)]"
            : isCompleted
              ? "bg-[var(--bg-card)] border-emerald-500/60 hover:border-emerald-400 shadow-emerald-500/10"
              : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 hover:shadow-[0_0_15px_var(--accent-glow)]"
        }
        hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]
      `}
      style={{ willChange: "transform" }}
    >
      {/* Target & Source Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-[var(--accent-primary)]! border-2! border-black! rounded-full!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-[var(--accent-primary)]! border-2! border-black! rounded-full!"
      />

      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
            }`}
          >
            <BookOpen size={14} />
          </div>
          {data.tier && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)] truncate font-mono">
              {data.tier}
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          <span
            className={`text-xs font-black font-mono ${
              isCompleted ? "text-emerald-400" : "text-[var(--accent-primary)]"
            }`}
          >
            {data.solvedProblems}/{data.totalProblems}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1 mb-3">
        <h3 className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug line-clamp-1 font-display">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Click Trigger */}
      <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] font-mono">
          <span>Mastery</span>
          <span
            className={
              isCompleted
                ? "text-emerald-400"
                : "text-[var(--accent-primary)] font-mono"
            }
          >
            {data.progressPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? "bg-emerald-500" : "bg-[var(--accent-primary)]"
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
              soundEffects.playClick();
              data.onToggleExpand?.();
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-mono ${
              isExpanded
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
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
          <span className="text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors inline-flex items-center gap-0.5 font-mono">
            <span>Matrix</span>
            <ChevronRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(TopicNode);
