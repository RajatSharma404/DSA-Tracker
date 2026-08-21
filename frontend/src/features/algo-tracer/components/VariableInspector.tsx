import React from "react";
import { Eye, Variable } from "lucide-react";
import { TraceStep } from "../types";

interface VariableInspectorProps {
  step: TraceStep;
}

export function VariableInspector({ step }: VariableInspectorProps) {
  const variables = step?.variables || {};
  const entries = Object.entries(variables);

  return (
    <div className="rounded-3xl bg-[#0c0c16] border border-white/5 p-4 sm:p-5 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <Eye size={14} className="text-purple-400" />
          <span>Variable State Inspector</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {entries.length} active registers
        </span>
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {entries.map(([key, val]) => {
            const formattedVal =
              typeof val === "object" ? JSON.stringify(val) : String(val);

            return (
              <div
                key={key}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between transition-colors hover:border-purple-500/30"
              >
                <span className="text-[10px] font-mono font-bold text-gray-400 truncate">
                  {key}
                </span>
                <span className="text-xs font-mono font-black text-cyan-300 truncate mt-1">
                  {formattedVal}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-gray-500 font-mono italic">
          No variables registered at this step.
        </div>
      )}
    </div>
  );
}
