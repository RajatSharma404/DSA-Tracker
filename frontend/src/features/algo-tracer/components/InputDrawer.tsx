import React, { useState } from "react";
import { Sliders, Shuffle, ArrowUpDown, Edit3, Network, Hash, X, Check } from "lucide-react";

interface InputDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  arrayInput: number[];
  setArrayInput: (arr: number[]) => void;
  targetInput: number;
  setTargetInput: (t: number) => void;
  graphInput: string;
  setGraphInput: (g: string) => void;
  onRerun: () => void;
  showGraphInput?: boolean;
}

export function InputDrawer({
  isOpen,
  onClose,
  arrayInput,
  setArrayInput,
  targetInput,
  setTargetInput,
  graphInput,
  setGraphInput,
  onRerun,
  showGraphInput = false,
}: InputDrawerProps) {
  const [rawArrayStr, setRawArrayStr] = useState(JSON.stringify(arrayInput));
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [arraySize, setArraySize] = useState(arrayInput.length || 7);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const newArr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 80) + 5,
    );
    setArrayInput(newArr);
    setRawArrayStr(JSON.stringify(newArr));
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
      let numArr: number[] = [];
      const trimmed = rawArrayStr.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          numArr = parsed.map(Number).filter((n) => !isNaN(n));
        }
      } else {
        // Fallback: parse comma or space separated values
        numArr = trimmed
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => !isNaN(n));
      }

      if (numArr.length > 0) {
        setArrayInput(numArr);
        setRawArrayStr(JSON.stringify(numArr));
        setArraySize(numArr.length);
        setIsManualEditing(false);
        setTimeout(onRerun, 50);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#0e0e1a] border border-cyan-500/30 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-200 shrink-0">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          <Sliders size={13} />
          <span>Input Configuration Drawer</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs font-mono">
        {/* Array Pills / Manual Edit (7 cols) */}
        <div className="lg:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-bold uppercase">Array:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRandomize}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Shuffle size={10} /> Random
              </button>
              <button
                onClick={handleSortAsc}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowUpDown size={10} /> Sort
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
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={rawArrayStr}
                onChange={(e) => setRawArrayStr(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 outline-none"
              />
              <button
                onClick={handleApplyManualArray}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Check size={12} /> Set
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsManualEditing(true)}
              className="p-1.5 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all min-h-8.5"
            >
              <div className="flex items-center gap-1 flex-wrap">
                {arrayInput.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 rounded bg-white/5 text-cyan-300 text-[11px] font-bold"
                  >
                    {val}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 px-1">
                <Edit3 size={10} /> Edit
              </span>
            </div>
          )}
        </div>

        {/* Target & Size Controls (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <Hash size={11} className="text-purple-400" /> Target
            </label>
            <input
              type="number"
              value={targetInput}
              onChange={(e) => {
                setTargetInput(Number(e.target.value));
                setTimeout(onRerun, 50);
              }}
              className="w-full px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-purple-300 outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Size: {arraySize}</span>
            </div>
            <input
              type="range"
              min="4"
              max="14"
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
              className="w-full accent-cyan-500 cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {showGraphInput && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">
            Graph JSON:
          </span>
          <input
            type="text"
            value={graphInput}
            onChange={(e) => {
              setGraphInput(e.target.value);
              setTimeout(onRerun, 100);
            }}
            className="flex-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-300 outline-none focus:border-cyan-500/50"
          />
        </div>
      )}
    </div>
  );
}
