# AlgoTracer 2.0 - Future Roadmap & Engine Backlog

This document captures deeper architectural enhancements for **AlgoTracer 2.0** deferred beyond the Phase 5 showpiece scope.

---

## 1. Multi-Dimensional & Tree Data Structure Visualizations
- [ ] **Binary Tree & BST Renderers**: Dynamic SVG/Canvas tree graph layout algorithm (e.g. Reingold-Tilford "Tidy Trees") supporting in-order, pre-order, post-order, and level-order pointer updates.
- [ ] **2D Matrix / Grid Heatmap**: Dedicated cell highlighting for dynamic programming tables (e.g. 0/1 Knapsack, Longest Common Subsequence) and grid pathfinding (BFS/DFS flood fill).
- [ ] **Linked List Visualizer**: Singly and doubly linked list pointer updates (`node.next = prev`, fast/slow pointer cycles).

## 2. Advanced Client-Side Static Analysis (AST Engine)
- [ ] **Babel/Acorn AST Parser**: Replace heuristic regex scanning with true abstract syntax tree instrumenter to generate execution steps directly from arbitrary JavaScript code without hardcoded templates.
- [ ] **Variable Memory Scope Tree**: Local stack frame visualization tracking closure scopes, recursion depth, and heap object allocations.

## 3. Playback & Export Enhancements
- [ ] **GIF & MP4 Animation Export**: Offscreen canvas recording of step transitions via `MediaRecorder` API or WebCodecs.
- [ ] **Step Bookmarks & Annotations**: Allow students and tutors to attach notes to specific step indices during playback.
- [ ] **Audio Narration Synthesizer**: Web Speech API narration of step descriptions for accessibility and auditory learners.

