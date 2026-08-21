import React from "react";
import { TraceStep } from "../../types";
import { ArrowRight, MoveRight } from "lucide-react";

interface QueueDiagramProps {
  step: TraceStep;
}

export function QueueDiagram({ step }: QueueDiagramProps) {
  const queueItems =
    step.dataStructureState || (step.variables?.queue ? JSON.parse(String(step.variables.queue).replace(/'/g, '"')) : [10, 20, 30]);

  return (
    <div className="flex flex-col h-full w-full justify-between p-4 sm:p-6 bg-[#0a0a12]/80 rounded-3xl border border-white/5 shadow-2xl min-h-70">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
          <MoveRight size={15} />
          <span>FIFO Queue Pipe Model</span>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Length: <strong className="text-white">{queueItems.length}</strong>
        </div>
      </div>

      {/* Main Pipe */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="flex items-center gap-3 w-full max-w-lg justify-center overflow-x-auto p-2">
          {/* Dequeue Exit Indicator */}
          <div className="flex flex-col items-center text-[10px] font-mono text-emerald-400 font-bold shrink-0">
            <ArrowRight size={16} className="text-emerald-400" />
            <span>EXIT (Front)</span>
          </div>

          {/* Queue Pipe Container */}
          <div className="flex items-center gap-2 border-t-2 border-b-2 border-cyan-500/40 p-3 bg-black/40 rounded-xl min-w-48 justify-center">
            {queueItems.length > 0 ? (
              queueItems.map((val: string | number, idx: number) => {
                const isFront = idx === 0;
                const isRear = idx === queueItems.length - 1;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-xs transition-all duration-300 ${
                      isFront
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow"
                        : isRear
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow"
                          : "bg-[#141422] border-white/10 text-gray-300"
                    }`}
                  >
                    <span className="text-sm font-black">{val}</span>
                    <span className="text-[9px] text-gray-500">
                      {isFront ? "FRONT" : isRear ? "REAR" : `[${idx}]`}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-gray-600 italic py-2">Queue is Empty</span>
            )}
          </div>

          {/* Enqueue Entrance Indicator */}
          <div className="flex flex-col items-center text-[10px] font-mono text-cyan-400 font-bold shrink-0">
            <ArrowRight size={16} className="text-cyan-400" />
            <span>ENTER (Rear)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
        <span>Active Action:</span>
        <span className="text-cyan-400 font-bold uppercase">{step.type}</span>
      </div>
    </div>
  );
}
