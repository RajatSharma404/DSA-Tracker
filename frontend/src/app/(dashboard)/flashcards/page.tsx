"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  
  // Drag & Swipe Gesture State
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  const filteredCards = useMemo(() => {
    if (selectedCategory === "All") return FLASHCARDS;
    return FLASHCARDS.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    soundEffects.playClick();
    setIsFlipped(false);
    setDragOffset(0);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    soundEffects.playClick();
    setIsFlipped(false);
    setDragOffset(0);
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

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (dragOffset > 85) {
      handleGrade("Easy");
    } else if (dragOffset < -85) {
      handleGrade("Hard");
    }
    touchStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null || !isDragging) return;
    const diff = e.clientX - mouseStartX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (dragOffset > 90) {
      handleGrade("Easy");
    } else if (dragOffset < -90) {
      handleGrade("Hard");
    }
    mouseStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
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

  const swipeRotation = (dragOffset / 200) * 8;

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
            Drill high-yield algorithmic invariants, mathematical proofs, and core code templates with swipe gesture spaced repetition.
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
        {/* Card Progress & Swipe Hints */}
        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] px-2 font-mono">
          <span className="flex items-center gap-2">
            <span>Card {currentIndex + 1} of {filteredCards.length}</span>
            <span className="hidden sm:inline text-[10px] text-purple-400 font-normal">
              (Swipe Left: Hard &bull; Swipe Right: Easy)
            </span>
          </span>
          <span className="text-purple-400 font-bold">
            {masteredIds.size} Mastered Invariants
          </span>
        </div>

        {/* Swipe Visual Feedback Indicators */}
        <div className="relative">
          {dragOffset > 25 && (
            <div className="absolute top-1/2 right-6 -translate-y-1/2 z-30 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black uppercase tracking-widest shadow-lg animate-pulse pointer-events-none">
              EASY &bull; MASTERED &rarr;
            </div>
          )}
          {dragOffset < -25 && (
            <div className="absolute top-1/2 left-6 -translate-y-1/2 z-30 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-black uppercase tracking-widest shadow-lg animate-pulse pointer-events-none">
              &larr; HARD &bull; REVIEW AGAIN
            </div>
          )}

          {/* 3D Flashcard Container with Swipe Gesture */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => {
              if (Math.abs(dragOffset) < 10) {
                soundEffects.playToggle();
                setIsFlipped(!isFlipped);
              }
            }}
            className={`relative min-h-[400px] rounded-[2.5rem] border bg-[var(--bg-card)] p-8 sm:p-10 shadow-2xl cursor-grab active:cursor-grabbing transition-all duration-150 flex flex-col justify-between select-none group ${
              dragOffset > 30
                ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                : dragOffset < -30
                  ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)]"
                  : "border-[var(--border-subtle)] hover:border-purple-500/40"
            }`}
            style={{
              transform: `translateX(${dragOffset}px) rotate(${swipeRotation}deg)`,
              touchAction: "pan-y",
            }}
          >
            {/* Card Front */}
            {!isFlipped ? (
              <div className="space-y-6 animate-in fade-in duration-300 pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    {currentCard.topic}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <RotateCw size={13} /> Tap or Space to Reveal Invariant
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
              /* Card Back — Cheat Codes & Invariant Proof */
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 size={13} /> Algorithm Pattern Cheat Code
                  </span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                    <RotateCw size={13} /> Click to Flip Front
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)] font-mono">
                    Key Invariant Formula
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                    {currentCard.back.coreInvariant}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase">Time</span>
                    <div className="text-emerald-400 font-bold mt-0.5">{currentCard.back.timeComplexity}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <span className="text-[9px] text-[var(--text-muted)] uppercase">Space</span>
                    <div className="text-cyan-400 font-bold mt-0.5">{currentCard.back.spaceComplexity}</div>
                  </div>
                </div>

                {currentCard.back.codeTemplate && (
                  <div className="p-3 rounded-2xl bg-black/80 border border-purple-500/20 font-mono text-[11px] text-purple-300 overflow-x-auto shadow-inner">
                    <pre>{currentCard.back.codeTemplate}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[var(--border-subtle)] text-center text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between">
              <span>Swipe left for Hard</span>
              <span>Tap to flip</span>
              <span>Swipe right for Easy</span>
            </div>
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
