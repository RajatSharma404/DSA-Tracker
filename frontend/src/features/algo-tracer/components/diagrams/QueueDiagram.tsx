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
    <div className="flex flex-col h-full w-full justify-between p-2.5 bg-[#0a0a12]/90 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-1 border-b border-white/5 shrink-0 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <MoveRight size={13} />
          <span>FIFO Queue</span>
        </div>
        <div className="text-gray-400">
          Length: <strong className="text-white">{queueItems.length}</strong>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2 min-h-0">
        <div className="flex items-center gap-2 w-full max-w-sm justify-center overflow-x-auto p-1">
          <span className="text-[9px] font-mono text-emerald-400 font-bold shrink-0">
            EXIT
          </span>

          <div className="flex items-center gap-1.5 border-t border-b border-cyan-500/40 p-2 bg-black/40 rounded-lg min-w-36 justify-center">
            {queueItems.length > 0 ? (
              queueItems.map((val: string | number, idx: number) => {
                const isFront = idx === 0;
                const isRear = idx === queueItems.length - 1;

                return (
                  <div
                    key={idx}
                    className={`px-2 py-1.5 rounded-lg border flex flex-col items-center gap-0.5 font-mono text-[11px] transition-all ${
                      isFront
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                        : isRear
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-[#141422] border-white/10 text-gray-300"
                    }`}
                  >
                    <span className="font-black">{val}</span>
                    <span className="text-[8px] text-gray-500">
                      {isFront ? "FRONT" : isRear ? "REAR" : `[${idx}]`}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-[10px] text-gray-600 italic py-1">Empty</span>
            )}
          </div>

          <span className="text-[9px] font-mono text-cyan-400 font-bold shrink-0">
            ENTER
          </span>
        </div>
      </div>
    </div>
  );
}
