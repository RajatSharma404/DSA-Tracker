import React from "react";
import { Eye } from "lucide-react";
import { TraceStep } from "../types";

interface VariableInspectorProps {
  step: TraceStep;
}

export function VariableInspector({ step }: VariableInspectorProps) {
  const variables = step?.variables || {};
  const entries = Object.entries(variables);

  return (
    <div className="flex-1 min-h-0 rounded-2xl bg-[#0c0c16] border border-white/5 p-2.5 flex flex-col shadow-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
          <Eye size={12} className="text-purple-400" />
          <span>Variable Inspector</span>
        </div>
        <span className="text-[9px] font-mono text-gray-500">
          {entries.length} tracked
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [-ms-overflow-style:none]">
        {entries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {entries.map(([key, val]) => {
              const formattedVal =
                typeof val === "object" ? JSON.stringify(val) : String(val);

              return (
                <div
                  key={key}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between transition-colors hover:border-purple-500/30"
                >
                  <span className="text-[9px] font-mono font-bold text-gray-400 truncate">
                    {key}
                  </span>
                  <span className="text-[11px] font-mono font-black text-cyan-300 truncate mt-0.5">
                    {formattedVal}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[10px] text-gray-600 font-mono italic">
            No variables registered at this step.
          </div>
        )}
      </div>
    </div>
  );
}
