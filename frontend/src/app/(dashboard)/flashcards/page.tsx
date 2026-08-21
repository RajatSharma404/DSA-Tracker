"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Brain,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen,
  Award,
  Flame,
  Layers,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { soundEffects } from "@/lib/soundEffects";

interface Flashcard {
  id: string;
  topic: string;
  front: {
    title: string;
    question: string;
    tags: string[];
  };
  back: {
    coreInvariant: string;
    timeComplexity: string;
    spaceComplexity: string;
    keyTakeaway: string;
    codeTemplate?: string;
  };
  category: "DP" | "Graphs" | "Pointers" | "Trees" | "Math" | "Arrays";
}

const FLASHCARDS: Flashcard[] = [
  {
    id: "kadane",
    topic: "Dynamic Programming / Arrays",
    category: "DP",
    front: {
      title: "Kadane's Algorithm Invariant",
      question:
        "What is the core state invariant of Kadane's maximum subarray sum algorithm?",
      tags: ["Maximum Subarray", "Dynamic Programming", "O(N)"],
    },
    back: {
      coreInvariant:
        "At every index i, max_ending_here = max(nums[i], max_ending_here + nums[i]). Either extend the previous subarray or start a fresh one.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "If adding the previous sum makes the current value smaller than itself, discard the prefix immediately.",
      codeTemplate:
        "currMax = Math.max(x, currMax + x);\nglobalMax = Math.max(globalMax, currMax);",
    },
  },
  {
    id: "floyd-cycle",
    topic: "Two Pointers / Linked Lists",
    category: "Pointers",
    front: {
      title: "Floyd's Cycle Finding (Tortoise & Hare)",
      question:
        "How does slow/fast pointers prove cycle existence and locate the exact cycle entry node?",
      tags: ["Cycle Detection", "Math Invariant", "Fast & Slow"],
    },
    back: {
      coreInvariant:
        "Fast pointer moves 2 steps while slow moves 1 step. Relative speed is 1 step/tick, guaranteeing intersection within the loop of length C.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "After collision, reset slow to head. Move both pointers at 1 step/tick; they will collide precisely at the cycle entrance.",
    },
  },
  {
    id: "monotonic-stack",
    topic: "Monotonic Stack",
    category: "Arrays",
    front: {
      title: "Monotonic Decreasing Stack Invariant",
      question:
        "When should you use a monotonic decreasing stack and what does each pop signify?",
      tags: ["Next Greater Element", "Daily Temperatures", "Stock Span"],
    },
    back: {
      coreInvariant:
        "Elements in stack maintain strictly decreasing order. When encountering a larger element x, pop all smaller elements because x is their Next Greater Element.",
      timeComplexity:
        "O(N) amortized (each element pushed and popped at most once)",
      spaceComplexity: "O(N)",
      keyTakeaway:
        "Maintains optimal candidates for nearest boundary questions.",
      codeTemplate:
        "while (stack.length && nums[stack.top()] < x) {\n  res[stack.pop()] = x;\n}\nstack.push(i);",
    },
  },
  {
    id: "dijkstra",
    topic: "Graphs / Shortest Path",
    category: "Graphs",
    front: {
      title: "Dijkstra Greedy Choice Invariant",
      question:
        "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
      tags: ["Shortest Path", "Priority Queue", "Greedy Invariant"],
    },
    back: {
      coreInvariant:
        "Once a node u is popped from the min-heap, its shortest distance dist[u] is permanently finalized under non-negative weights.",
      timeComplexity: "O((V + E) log V) with Binary Heap",
      spaceComplexity: "O(V)",
      keyTakeaway:
        "Negative edges violate the greedy assumption that extracting the smallest tentative distance guarantees the optimal shortest path.",
    },
  },
  {
    id: "binary-search-answer",
    topic: "Binary Search",
    category: "Math",
    front: {
      title: "Binary Search on Monotonic Answer Space",
      question:
        "What mathematical property must hold to binary search over an answer space [1..max]?",
      tags: ["Koko Eating Bananas", "Capacity to Ship", "Monotonic Predicate"],
    },
    back: {
      coreInvariant:
        "The feasibility function f(x) must be monotonic (e.g. False, False, ..., True, True). If f(k) is valid, all values >= k are also valid.",
      timeComplexity: "O(N log(Range))",
      spaceComplexity: "O(1)",
      keyTakeaway:
        "Frame the problem as: Find the minimum k such that f(k) === true.",
    },
  },
];

const CATEGORIES = ["All", "DP", "Graphs", "Pointers", "Arrays", "Math"];

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const filteredCards = useMemo(() => {
    if (selectedCategory === "All") return FLASHCARDS;
    return FLASHCARDS.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    soundEffects.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    soundEffects.playClick();
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredCards.length) % filteredCards.length,
    );
  };

  const handleGrade = (quality: string) => {
    soundEffects.playSuccess();
    if (quality === "Easy" || quality === "Good") {
      setMasteredIds((prev) => new Set([...prev, currentCard.id]));
      toast.success(
        `SM-2 Interval expanded for "${currentCard.front.title}"`,
      );
    } else {
      toast.info(
        `Scheduled for short-interval recall: "${currentCard.front.title}"`,
      );
    }
    handleNext();
  };

  // Keyboard navigation & rating keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        soundEffects.playToggle();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "1") {
        handleGrade("Forgot");
      } else if (e.key === "2") {
        handleGrade("Hard");
      } else if (e.key === "3") {
        handleGrade("Good");
      } else if (e.key === "4") {
        handleGrade("Easy");
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredCards]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Brain size={13} />
            <span>FlashRecall SM-2 Deck</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 font-display">
            Algorithmic Invariant Flashcards
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Drill high-yield algorithmic invariants, mathematical proofs, and core code templates with 3D spaced repetition.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] self-start sm:self-auto flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-purple-500 text-white font-extrabold shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Stage */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Card Progress */}
        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] px-2 font-mono">
          <span>
            Card {currentIndex + 1} of {filteredCards.length}
          </span>
          <span className="text-purple-400 font-bold">
            {masteredIds.size} Mastered Invariants
          </span>
        </div>

        {/* 3D Flashcard Container */}
        <div
          onClick={() => {
            soundEffects.playToggle();
            setIsFlipped(!isFlipped);
          }}
          className="relative min-h-[380px] rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-10 shadow-2xl cursor-pointer hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between select-none group"
          style={{ perspective: 1000 }}
        >
          {/* Card Front */}
          {!isFlipped ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                  {currentCard.topic}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <RotateCw size={13} /> Click or Space to Flip
                </span>
              </div>

              <div className="space-y-3 pt-4">
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] group-hover:text-purple-400 transition-colors font-display">
                  {currentCard.front.title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                  {currentCard.front.question}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6">
                {currentCard.front.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Card Back */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 size={13} /> Invariant Proof & Solution
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <RotateCw size={13} /> Click to Flip Front
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Core Invariant
                </span>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
                  {currentCard.back.coreInvariant}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] font-sans uppercase">
                    Time
                  </span>
                  <div className="text-emerald-400 font-bold mt-0.5">
                    {currentCard.back.timeComplexity}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] font-sans uppercase">
                    Space
                  </span>
                  <div className="text-cyan-400 font-bold mt-0.5">
                    {currentCard.back.spaceComplexity}
                  </div>
                </div>
              </div>

              {currentCard.back.codeTemplate && (
                <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs text-purple-300 overflow-x-auto">
                  <pre>{currentCard.back.codeTemplate}</pre>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)] font-mono">
            {isFlipped
              ? "Grade recall [1-4] to update SM-2 schedule"
              : "Press Space or tap anywhere on card to reveal invariant answer"}
          </div>
        </div>

        {/* SM-2 Recall Rating Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            {
              label: "Forgot",
              key: "1",
              color:
                "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
            },
            {
              label: "Hard",
              key: "2",
              color:
                "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
            },
            {
              label: "Good",
              key: "3",
              color:
                "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
            },
            {
              label: "Easy",
              key: "4",
              color:
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
            },
          ].map((q) => (
            <button
              key={q.label}
              onClick={() => handleGrade(q.label)}
              className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${q.color}`}
            >
              <div>{q.label}</div>
              <div className="text-[9px] opacity-60 font-mono">[{q.key}]</div>
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold transition-all cursor-pointer border border-[var(--border-subtle)]"
          >
            <ChevronLeft size={14} />
            <span>Previous Card</span>
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold transition-all cursor-pointer border border-[var(--border-subtle)]"
          >
            <span>Next Card</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
