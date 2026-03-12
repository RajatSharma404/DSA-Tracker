import React, { memo, useMemo } from "react";
import { Handle, Position } from "reactflow";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface ProblemNodeProps {
  data: {
    label: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    status: "TODO" | "DOING" | "DONE";
    link?: string;
    nextReviewDate?: string | Date;
  };
}

const ProblemNode = ({ data }: ProblemNodeProps) => {
  const isDone = data.status === "DONE";
  const isDoing = data.status === "DOING";

  const isRevisionDue = useMemo(() => {
    if (!data.nextReviewDate || !isDone) return false;
    return new Date(data.nextReviewDate) <= new Date();
  }, [data.nextReviewDate, isDone]);

  const diffColors = {
    EASY: "text-green-400 bg-green-400/10 border-green-400/20",
    MEDIUM: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    HARD: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div
      className={`problem-node-3d group px-4 py-3 rounded-xl border-2 shadow-lg backdrop-blur-md transition-all duration-300 min-w-[200px]
      ${
        isRevisionDue
          ? "bg-orange-500/10 border-orange-500 shadow-orange-500/20 animate-pulse"
          : isDone
            ? "bg-green-500/5 border-green-500/30"
            : isDoing
              ? "bg-blue-500/5 border-blue-500/30"
              : "bg-[#0d0d0d] border-[#222] hover:border-[#333]"
      }
    `}
    >
      <Handle type="target" position={Position.Left} className="!bg-[#333]" />

      <div className="flex items-center gap-3">
        <div
          className={`p-1.5 rounded-lg ${
            isRevisionDue
              ? "bg-orange-500/20 text-orange-400"
              : isDone
                ? "bg-green-500/20 text-green-400"
                : isDoing
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-800 text-gray-500"
          }`}
        >
          {isRevisionDue ? (
            <AlertCircle size={16} />
          ) : isDone ? (
            <CheckCircle2 size={16} />
          ) : (
            <Circle size={16} />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-sm font-bold truncate ${isDone && !isRevisionDue ? "text-gray-400 line-through" : "text-white"}`}
            >
              {data.label}
            </h4>
            {isRevisionDue && (
              <span className="text-[8px] font-black text-orange-400 uppercase">
                Review
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${diffColors[data.difficulty]}`}
            >
              {data.difficulty}
            </span>
            {data.link && (
              <a
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors"
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-[#333]" />
    </div>
  );
};

export default memo(ProblemNode);
