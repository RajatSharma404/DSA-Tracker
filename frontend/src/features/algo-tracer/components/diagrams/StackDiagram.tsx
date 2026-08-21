import React from "react";
import { TraceStep } from "../../types";
import { Layers, ArrowDown, ArrowUp } from "lucide-react";

interface StackDiagramProps {
  step: TraceStep;
}

export function StackDiagram({ step }: StackDiagramProps) {
  const stackItems =
    step.dataStructureState || (step.variables?.stack ? JSON.parse(String(step.variables.stack).replace(/'/g, '"')) : [10, 20, 30]);

  const topIndex = stackItems.length - 1;

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold">
          <Layers size={15} />
          <span>LIFO Stack Memory Model</span>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Size: <strong className="text-white">{stackItems.length}</strong>
        </div>
      </div>

      {/* Main Stack Tube */}
      <div className="flex-1 flex flex-col items-center justify-end py-4">
        <div className="w-48 sm:w-56 border-b-4 border-l-4 border-r-4 border-purple-500/40 rounded-b-2xl p-2 bg-black/40 flex flex-col-reverse gap-2 min-h-36">
          {stackItems.length > 0 ? (
            stackItems.map((val: string | number, idx: number) => {
              const isTop = idx === topIndex;

              return (
                <div
                  key={idx}
                  className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-mono font-bold transition-all duration-300 ${
                    isTop
                      ? "bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                      : "bg-[#161626] border-white/10 text-gray-300"
                  }`}
                >
                  <span className="text-[10px] text-gray-500 font-mono">[{idx}]</span>
                  <span className="text-sm font-black text-white">{val}</span>
                  {isTop ? (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500 text-black text-[9px] font-black uppercase">
                      TOP
                    </span>
                  ) : (
                    <span className="w-7" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-600 italic py-6">
              Stack is Empty (Underflow)
            </div>
          )}
        </div>
      </div>

      {/* Stack Summary Subtext */}
      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
        <span>Operation Type:</span>
        <span className="text-purple-400 font-bold uppercase">{step.type}</span>
      </div>
    </div>
  );
}
