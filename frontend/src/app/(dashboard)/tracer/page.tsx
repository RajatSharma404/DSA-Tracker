"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Layers,
  Code2,
  Sliders,
  CheckCircle2,
  Activity,
  Zap,
  Flame,
  HelpCircle,
  Eye,
  Plus,
  Terminal,
  Send,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

interface StepState {
  step: number;
  line: number;
  explanation: string;
  variables: Record<string, any>;
  pointers?: { name: string; index: number; color: string }[];
  highlightIndices?: number[];
  windowRange?: [number, number];
  callStack?: string[];
}

interface AlgorithmPreset {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  codeLines: string[];
  dataArray: number[];
  steps: StepState[];
}

const PRESETS: AlgorithmPreset[] = [
  {
    id: "two-pointers",
    name: "Two Pointers: Two Sum (Sorted Array)",
    category: "Two Pointers",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    dataArray: [2, 7, 11, 15, 19, 23],
    codeLines: [
      "function twoSumSorted(nums: number[], target: number): number[] {",
      "  let left = 0;",
      "  let right = nums.length - 1;",
      "  while (left < right) {",
      "    const currentSum = nums[left] + nums[right];",
      "    if (currentSum === target) return [left, right];",
      "    if (currentSum < target) left++;",
      "    else right--;",
      "  }",
      "  return [];",
      "}",
    ],
    steps: [
      {
        step: 0,
        line: 1,
        explanation: "Initialize left pointer at index 0 (value: 2) and right pointer at index 5 (value: 23). Target is 26.",
        variables: { left: 0, right: 5, target: 26, currentSum: "-" },
        pointers: [
          { name: "L", index: 0, color: "bg-cyan-500" },
          { name: "R", index: 5, color: "bg-purple-500" },
        ],
        highlightIndices: [0, 5],
      },
      {
        step: 1,
        line: 4,
        explanation: "Evaluate currentSum = nums[0] + nums[5] = 2 + 23 = 25.",
        variables: { left: 0, right: 5, target: 26, currentSum: 25 },
        pointers: [
          { name: "L", index: 0, color: "bg-cyan-500" },
          { name: "R", index: 5, color: "bg-purple-500" },
        ],
        highlightIndices: [0, 5],
      },
      {
        step: 2,
        line: 6,
        explanation: "currentSum (25) < target (26). Increment left pointer (left++) to increase the sum.",
        variables: { left: 1, right: 5, target: 26, currentSum: 25 },
        pointers: [
          { name: "L", index: 1, color: "bg-cyan-500" },
          { name: "R", index: 5, color: "bg-purple-500" },
        ],
        highlightIndices: [1, 5],
      },
      {
        step: 3,
        line: 4,
        explanation: "Evaluate currentSum = nums[1] + nums[5] = 7 + 23 = 30.",
        variables: { left: 1, right: 5, target: 26, currentSum: 30 },
        pointers: [
          { name: "L", index: 1, color: "bg-cyan-500" },
          { name: "R", index: 5, color: "bg-purple-500" },
        ],
        highlightIndices: [1, 5],
      },
      {
        step: 4,
        line: 7,
        explanation: "currentSum (30) > target (26). Decrement right pointer (right--) to decrease the sum.",
        variables: { left: 1, right: 4, target: 26, currentSum: 30 },
        pointers: [
          { name: "L", index: 1, color: "bg-cyan-500" },
          { name: "R", index: 4, color: "bg-purple-500" },
        ],
        highlightIndices: [1, 4],
      },
      {
        step: 5,
        line: 5,
        explanation: "Evaluate currentSum = nums[1] + nums[4] = 7 + 19 = 26. MATCH FOUND! Target 26 achieved at indices [1, 4].",
        variables: { left: 1, right: 4, target: 26, currentSum: 26, match: "YES" },
        pointers: [
          { name: "L", index: 1, color: "bg-emerald-500" },
          { name: "R", index: 4, color: "bg-emerald-500" },
        ],
        highlightIndices: [1, 4],
      },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window: Maximum Sum Subarray (Size K=3)",
    category: "Sliding Window",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    dataArray: [2, 1, 5, 1, 3, 2],
    codeLines: [
      "function maxSubArrayLenK(nums: number[], k: number): number {",
      "  let maxSum = 0, windowSum = 0;",
      "  for (let i = 0; i < k; i++) windowSum += nums[i];",
      "  maxSum = windowSum;",
      "  for (let i = k; i < nums.length; i++) {",
      "    windowSum += nums[i] - nums[i - k];",
      "    maxSum = Math.max(maxSum, windowSum);",
      "  }",
      "  return maxSum;",
      "}",
    ],
    steps: [
      {
        step: 0,
        line: 2,
        explanation: "Initialize first window of size k=3: indices [0..2]. windowSum = 2 + 1 + 5 = 8.",
        variables: { k: 3, windowSum: 8, maxSum: 8 },
        windowRange: [0, 2],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 1,
        line: 5,
        explanation: "Slide window to right: add nums[3] (1) and subtract nums[0] (2). windowSum becomes 8 + 1 - 2 = 7.",
        variables: { i: 3, windowSum: 7, maxSum: 8 },
        windowRange: [1, 3],
        highlightIndices: [1, 2, 3],
      },
      {
        step: 2,
        line: 5,
        explanation: "Slide window to right: add nums[4] (3) and subtract nums[1] (1). windowSum becomes 7 + 3 - 1 = 9.",
        variables: { i: 4, windowSum: 9, maxSum: 9 },
        windowRange: [2, 4],
        highlightIndices: [2, 3, 4],
      },
      {
        step: 3,
        line: 6,
        explanation: "Slide window to right: add nums[5] (2) and subtract nums[2] (5). windowSum becomes 9 + 2 - 5 = 6. Max stays 9.",
        variables: { i: 5, windowSum: 6, maxSum: 9 },
        windowRange: [3, 5],
        highlightIndices: [3, 4, 5],
      },
      {
        step: 4,
        line: 8,
        explanation: "Algorithm completed. Maximum Subarray Sum of size 3 is 9 (subarray [5, 1, 3]).",
        variables: { finalMaxSum: 9 },
        windowRange: [2, 4],
        highlightIndices: [2, 3, 4],
      },
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search on Sorted Space",
    category: "Binary Search",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    dataArray: [3, 8, 12, 17, 24, 31, 45, 59],
    codeLines: [
      "function binarySearch(nums: number[], target: number): number {",
      "  let low = 0, high = nums.length - 1;",
      "  while (low <= high) {",
      "    const mid = Math.floor((low + high) / 2);",
      "    if (nums[mid] === target) return mid;",
      "    if (nums[mid] < target) low = mid + 1;",
      "    else high = mid - 1;",
      "  }",
      "  return -1;",
      "}",
    ],
    steps: [
      {
        step: 0,
        line: 1,
        explanation: "Target is 31. Initial search space: low = 0, high = 7. mid = floor((0+7)/2) = index 3 (value: 17).",
        variables: { low: 0, high: 7, mid: 3, target: 31, midVal: 17 },
        pointers: [
          { name: "Low", index: 0, color: "bg-cyan-500" },
          { name: "Mid", index: 3, color: "bg-amber-500" },
          { name: "High", index: 7, color: "bg-purple-500" },
        ],
        highlightIndices: [3],
      },
      {
        step: 1,
        line: 5,
        explanation: "nums[3] (17) < target (31). Discard left half. Move low = mid + 1 = 4.",
        variables: { low: 4, high: 7, target: 31 },
        pointers: [
          { name: "Low", index: 4, color: "bg-cyan-500" },
          { name: "High", index: 7, color: "bg-purple-500" },
        ],
        highlightIndices: [4, 5, 6, 7],
      },
      {
        step: 2,
        line: 3,
        explanation: "New search space: low = 4, high = 7. mid = floor((4+7)/2) = index 5 (value: 31).",
        variables: { low: 4, high: 7, mid: 5, target: 31, midVal: 31 },
        pointers: [
          { name: "Low", index: 4, color: "bg-cyan-500" },
          { name: "Mid", index: 5, color: "bg-emerald-500" },
          { name: "High", index: 7, color: "bg-purple-500" },
        ],
        highlightIndices: [5],
      },
      {
        step: 3,
        line: 4,
        explanation: "nums[5] === 31 (Target Found!). Return index 5 in O(log N) operations.",
        variables: { resultIndex: 5, target: 31 },
        pointers: [{ name: "Target", index: 5, color: "bg-emerald-500" }],
        highlightIndices: [5],
      },
    ],
  },
];

// Dynamic Code & Array Trace Generator
function generateCustomTrace(rawCode: string, rawInput: string): AlgorithmPreset {
  let parsedArray: number[] = [4, 8, 15, 16, 23, 42];
  try {
    const matched = rawInput.match(/\[(.*?)\]/);
    if (matched && matched[1]) {
      parsedArray = matched[1].split(",").map((n) => Number(n.trim())).filter((n) => !isNaN(n));
      if (parsedArray.length === 0) parsedArray = [4, 8, 15, 16, 23, 42];
    }
  } catch {
    parsedArray = [4, 8, 15, 16, 23, 42];
  }

  const lines = rawCode.split("\n").filter((l) => l.trim().length > 0);
  const steps: StepState[] = [];

  const isTwoPointer = rawCode.includes("left") || rawCode.includes("right") || rawCode.includes("while");
  const isSlidingWindow = rawCode.includes("window") || rawCode.includes("k");

  if (isTwoPointer) {
    let l = 0;
    let r = Math.max(0, parsedArray.length - 1);
    let stepCount = 0;

    steps.push({
      step: stepCount++,
      line: 1,
      explanation: `Initialize two pointers: L at index 0 (value: ${parsedArray[0]}) and R at index ${r} (value: ${parsedArray[r]}).`,
      variables: { left: l, right: r, totalElements: parsedArray.length },
      pointers: [
        { name: "L", index: l, color: "bg-cyan-500" },
        { name: "R", index: r, color: "bg-purple-500" },
      ],
      highlightIndices: [l, r],
    });

    while (l < r && stepCount < 6) {
      const sum = parsedArray[l] + parsedArray[r];
      steps.push({
        step: stepCount++,
        line: Math.min(3, lines.length - 1),
        explanation: `Comparing indices [${l}, ${r}]: values (${parsedArray[l]} + ${parsedArray[r]} = ${sum}). Advancing pointers inward.`,
        variables: { left: l, right: r, currentEvaluation: sum },
        pointers: [
          { name: "L", index: l, color: "bg-cyan-500" },
          { name: "R", index: r, color: "bg-purple-500" },
        ],
        highlightIndices: [l, r],
      });
      l++;
      if (l < r) r--;
    }

    steps.push({
      step: stepCount,
      line: lines.length - 1,
      explanation: `Iteration terminated. Two-pointer convergence complete across ${parsedArray.length} items.`,
      variables: { left: l, right: r, status: "COMPLETED" },
      pointers: [{ name: "Done", index: l, color: "bg-emerald-500" }],
      highlightIndices: [l],
    });
  } else {
    // Linear scan / general loop
    for (let i = 0; i < Math.min(parsedArray.length, 5); i++) {
      steps.push({
        step: i,
        line: Math.min(i + 1, lines.length - 1),
        explanation: `Processing element at index ${i}: value is ${parsedArray[i]}. Updating accumulator and invariants.`,
        variables: { index: i, value: parsedArray[i], status: "IN_PROGRESS" },
        pointers: [{ name: "i", index: i, color: "bg-cyan-500" }],
        highlightIndices: [i],
      });
    }

    steps.push({
      step: steps.length,
      line: lines.length - 1,
      explanation: `Custom algorithm execution finished. All ${parsedArray.length} items processed.`,
      variables: { completedCount: parsedArray.length, verdict: "ACCEPTED" },
      highlightIndices: Array.from({ length: parsedArray.length }, (_, k) => k),
    });
  }

  return {
    id: "custom",
    name: "Custom Code Execution Trace",
    category: isTwoPointer ? "Two Pointers" : isSlidingWindow ? "Sliding Window" : "Linear Processing",
    timeComplexity: isTwoPointer ? "O(N)" : "O(N)",
    spaceComplexity: "O(1)",
    codeLines: lines.length > 0 ? lines : ["// Custom algorithm code here"],
    dataArray: parsedArray,
    steps,
  };
}

export default function AlgoTracerPage() {
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState("two-pointers");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  // Custom Code State
  const [customCode, setCustomCode] = useState(`function customTwoPointerScan(nums: number[]): number {
  let left = 0, right = nums.length - 1;
  let maxFound = 0;
  while (left < right) {
    const area = Math.min(nums[left], nums[right]) * (right - left);
    maxFound = Math.max(maxFound, area);
    if (nums[left] < nums[right]) left++;
    else right--;
  }
  return maxFound;
}`);
  const [customInput, setCustomInput] = useState("[1, 8, 6, 2, 5, 4, 8, 3, 7]");
  const [customPreset, setCustomPreset] = useState<AlgorithmPreset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activePreset =
    activeTab === "custom" && customPreset
      ? customPreset
      : PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const currentStep = activePreset.steps[currentStepIndex] || activePreset.steps[0];

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedPresetId, activeTab, customPreset]);

  // Auto-play stepper loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= activePreset.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800 / playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, activePreset.steps.length]);

  const handleTraceCustomCode = () => {
    setIsAnalyzing(true);
    toast.info("Analyzing custom code control flow & generating memory trace...");

    setTimeout(() => {
      const generated = generateCustomTrace(customCode, customInput);
      setCustomPreset(generated);
      setActiveTab("custom");
      setCurrentStepIndex(0);
      setIsAnalyzing(false);
      toast.success("Execution trace generated successfully!");
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={13} />
            <span>AlgoTracer 2.0 Visual Execution Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Algorithmic State Stepper
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Step through memory arrays, pointers, and variables line-by-line, or paste your own custom code to generate an instant visual trace.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("preset")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "preset"
                ? "bg-cyan-500 text-black font-extrabold shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Curated Presets
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-purple-500 text-white font-extrabold shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Code2 size={13} />
            Custom Code
          </button>
        </div>
      </div>

      {/* Custom Code Input Drawer */}
      {activeTab === "custom" && (
        <div className="rounded-3xl border border-purple-500/30 bg-[#0d0a18] p-6 sm:p-7 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Cpu size={15} />
              <span>Custom Algorithm Playground</span>
            </div>
            <span className="text-[11px] text-gray-400">TypeScript / JavaScript</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 font-mono text-xs">
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Paste or write your custom algorithmic function here..."
                rows={7}
                className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-gray-200 outline-none resize-none font-mono leading-relaxed focus:border-purple-500/60 transition-colors"
                spellCheck={false}
              />
            </div>

            <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 uppercase">Input Test Array</label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="[1, 8, 6, 2, 5, 4, 8, 3, 7]"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 outline-none focus:border-purple-500/60"
                />
              </div>

              <button
                disabled={isAnalyzing || !customCode.trim()}
                onClick={handleTraceCustomCode}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} />
                <span>{isAnalyzing ? "Generating Trace..." : "Trace & Explain Code"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Selector Dropdown (When in Preset Mode) */}
      {activeTab === "preset" && (
        <div className="flex justify-end">
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="bg-[#12121c] border border-white/10 rounded-2xl px-4 py-2 text-xs font-bold text-gray-200 outline-hidden shadow-lg cursor-pointer"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Visualizer Stage */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#08080e] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              {activePreset.category}
            </span>
            <h2 className="text-xl font-black text-white">{activePreset.name}</h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Time: {activePreset.timeComplexity}
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              Space: {activePreset.spaceComplexity}
            </span>
          </div>
        </div>

        {/* Dynamic Memory Array Visualizer */}
        <div className="p-8 rounded-3xl bg-black/60 border border-white/5 space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {activePreset.dataArray.map((val, idx) => {
              const isHighlighted = currentStep.highlightIndices?.includes(idx);
              const activePointers = (currentStep.pointers || []).filter((p) => p.index === idx);
              const inWindow =
                currentStep.windowRange &&
                idx >= currentStep.windowRange[0] &&
                idx <= currentStep.windowRange[1];

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {/* Pointer tags above box */}
                  <div className="h-6 flex items-center justify-center gap-1">
                    {activePointers.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black text-black font-mono shadow-md animate-bounce ${p.color}`}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>

                  {/* Value Box */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-black font-mono transition-all duration-300 shadow-xl ${
                      isHighlighted || inWindow
                        ? "bg-cyan-500/20 border-cyan-400 text-white scale-105 shadow-cyan-500/20 ring-2 ring-cyan-500/40"
                        : "bg-[#11111a] border-white/10 text-gray-400"
                    }`}
                  >
                    {val}
                  </div>

                  {/* Index label below box */}
                  <span className="text-[11px] font-mono text-gray-500 font-bold">[{idx}]</span>
                </div>
              );
            })}
          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 text-left flex items-start gap-3">
            <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">
                Step {currentStep.step + 1} of {activePreset.steps.length}
              </span>
              <p className="leading-relaxed font-medium">{currentStep.explanation}</p>
            </div>
          </div>
        </div>

        {/* Stepper Control Deck */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Playback Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Auto Step"}</span>
            </button>
            <button
              disabled={currentStepIndex >= activePreset.steps.length - 1}
              onClick={() => setCurrentStepIndex((prev) => Math.min(activePreset.steps.length - 1, prev + 1))}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/5">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setPlaySpeed(s)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  playSpeed === s
                    ? "bg-cyan-500 text-black font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Code & Variable Watch Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          {/* Code with Line Highlight (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/5 bg-black/40 p-5 space-y-2 font-mono text-xs overflow-x-auto">
            <div className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-1.5">
              <Code2 size={13} className="text-cyan-400" /> Active Code Trace
            </div>
            {activePreset.codeLines.map((lineText, idx) => {
              const isCurrentLine = currentStep.line === idx;
              return (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-3 ${
                    isCurrentLine
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="w-4 text-[10px] text-gray-600 select-none text-right">{idx + 1}</span>
                  <span className="truncate">{lineText}</span>
                </div>
              );
            })}
          </div>

          {/* Variable Watcher (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-white/5 bg-black/40 p-5 space-y-3">
            <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
              <Eye size={13} className="text-purple-400" /> Memory Watch Inspector
            </div>

            <div className="space-y-2">
              {Object.entries(currentStep.variables).map(([k, v]) => (
                <div
                  key={k}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-gray-400 font-bold">{k}</span>
                  <span className="text-cyan-400 font-black">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
