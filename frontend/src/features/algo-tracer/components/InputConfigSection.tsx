import React, { useState } from "react";
import { Sliders, Shuffle, ArrowUpDown, Edit3, Network, Hash } from "lucide-react";

interface InputConfigSectionProps {
  arrayInput: number[];
  setArrayInput: (arr: number[]) => void;
  targetInput: number;
  setTargetInput: (t: number) => void;
  graphInput: string;
  setGraphInput: (g: string) => void;
  onRerun: () => void;
  showGraphInput?: boolean;
}

export function InputConfigSection({
  arrayInput,
  setArrayInput,
  targetInput,
  setTargetInput,
  graphInput,
  setGraphInput,
  onRerun,
  showGraphInput = false,
}: InputConfigSectionProps) {
  const [rawArrayStr, setRawArrayStr] = useState(JSON.stringify(arrayInput));
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [arraySize, setArraySize] = useState(arrayInput.length || 7);

  const handleRandomize = () => {
    const newArr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 80) + 5,
    );
    setArrayInput(newArr);
    setRawArrayStr(JSON.stringify(newArr));
    // Pick one element as target randomly
    const randomTarget = newArr[Math.floor(Math.random() * newArr.length)];
    setTargetInput(randomTarget);
    setTimeout(onRerun, 50);
  };

  const handleSortAsc = () => {
    const sorted = [...arrayInput].sort((a, b) => a - b);
    setArrayInput(sorted);
    setRawArrayStr(JSON.stringify(sorted));
    setTimeout(onRerun, 50);
  };

  const handleReverse = () => {
    const reversed = [...arrayInput].reverse();
    setArrayInput(reversed);
    setRawArrayStr(JSON.stringify(reversed));
    setTimeout(onRerun, 50);
  };

  const handleApplyManualArray = () => {
    try {
      const parsed = JSON.parse(rawArrayStr);
      if (Array.isArray(parsed)) {
        const numArr = parsed.map(Number).filter((n) => !isNaN(n));
        if (numArr.length > 0) {
          setArrayInput(numArr);
          setArraySize(numArr.length);
          setIsManualEditing(false);
          setTimeout(onRerun, 50);
        }
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-3xl bg-[#0c0c16] border border-white/5 p-4 sm:p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <Sliders size={14} className="text-cyan-400" />
          <span>Custom Input Configuration</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          Injected into runtime variable
        </span>
      </div>

      <div className="space-y-3">
        {/* Array Input & Action Toolbar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="font-bold uppercase">Input Array</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRandomize}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Shuffle size={11} /> Randomize
              </button>
              <button
                onClick={handleSortAsc}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowUpDown size={11} /> Sort
              </button>
              <button
                onClick={handleReverse}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold cursor-pointer transition-colors"
              >
                Reverse
              </button>
            </div>
          </div>

          {isManualEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={rawArrayStr}
                onChange={(e) => setRawArrayStr(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 outline-none"
              />
              <button
                onClick={handleApplyManualArray}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs cursor-pointer"
              >
                Apply
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsManualEditing(true)}
              className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {arrayInput.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 text-xs font-mono font-bold"
                  >
                    {val}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Edit3 size={11} /> Edit
              </span>
            </div>
          )}
        </div>

        {/* Target Input for Search / Two Pointers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1">
              <Hash size={12} className="text-purple-400" /> Target Value
            </label>
            <input
              type="number"
              value={targetInput}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTargetInput(val);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-purple-300 outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Array Size Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span className="font-bold uppercase">Size: {arraySize} items</span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              value={arraySize}
              onChange={(e) => {
                const size = Number(e.target.value);
                setArraySize(size);
                const newArr = Array.from({ length: size }, () =>
                  Math.floor(Math.random() * 80) + 5,
                );
                setArrayInput(newArr);
                setRawArrayStr(JSON.stringify(newArr));
                setTimeout(onRerun, 50);
              }}
              className="w-full accent-cyan-500 cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Graph Input (if applicable) */}
        {showGraphInput && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1">
              <Network size={12} className="text-cyan-400" /> Adjacency Graph (JSON)
            </label>
            <input
              type="text"
              value={graphInput}
              onChange={(e) => {
                setGraphInput(e.target.value);
                setTimeout(onRerun, 100);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-gray-300 outline-none focus:border-cyan-500/50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
