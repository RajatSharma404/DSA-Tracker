"use client";

import { useState } from 'react';
import { getStudyGuide, StudyGuide } from '@/data/studyGuides';
import { BookOpen, ChevronDown, ChevronRight, Copy, Check, Lightbulb, Table, Code2, Brain, ArrowRight } from 'lucide-react';

type TopicCppRef = {
  whatIs: string;
  headers: string[];
  functions: string[];
  exampleTitle: string;
  exampleCode: string;
};

const topicCppReferences: Record<string, TopicCppRef> = {
  'c++ basics for dsa': {
    whatIs: 'C++ STL (Standard Template Library) gives you battle-tested containers and algorithms used in almost every DSA solution.',
    headers: ['<vector>', '<string>', '<algorithm>', '<unordered_map>', '<queue>', '<stack>'],
    functions: ['sort(begin, end)', 'reverse(begin, end)', 'max_element(begin, end)', 'accumulate(begin, end, init)'],
    exampleTitle: 'Sort and reverse a vector',
    exampleCode: `vector<int> a = {5, 2, 8, 1};
sort(a.begin(), a.end());      // 1 2 5 8
reverse(a.begin(), a.end());   // 8 5 2 1`,
  },
  arrays: {
    whatIs: 'Array problems in C++ are usually solved with vector and algorithm utilities for traversal, sorting, and transformations.',
    headers: ['<vector>', '<algorithm>', '<numeric>'],
    functions: ['v.push_back(x)', 'v.pop_back()', 'v.size()', 'sort(v.begin(), v.end())', 'accumulate(v.begin(), v.end(), 0)'],
    exampleTitle: 'Compute sum of array quickly',
    exampleCode: `vector<int> nums = {3, 1, 4, 1, 5};
int total = accumulate(nums.begin(), nums.end(), 0); // 14`,
  },
  hashing: {
    whatIs: 'Hashing stores key-value data for near O(1) average insert/find/erase operations.',
    headers: ['<unordered_map>', '<unordered_set>'],
    functions: ['mp[key]++', 'mp.find(key)', 'mp.count(key)', 'mp.erase(key)', 'st.insert(x)', 'st.count(x)'],
    exampleTitle: 'Frequency counting',
    exampleCode: `unordered_map<int, int> freq;
for (int x : nums) freq[x]++;
if (freq.count(target)) {
  // target exists
}`,
  },
  'two pointers': {
    whatIs: 'Two pointers is a traversal strategy over arrays/strings, often after sorting, to reduce brute-force loops.',
    headers: ['<vector>', '<algorithm>'],
    functions: ['sort(v.begin(), v.end())', 'while (l < r)', 'swap(v[l], v[r])'],
    exampleTitle: 'Two-sum in sorted array',
    exampleCode: `int l = 0, r = (int)v.size() - 1;
while (l < r) {
  int sum = v[l] + v[r];
  if (sum == target) break;
  if (sum < target) l++; else r--;
}`,
  },
  'sliding window': {
    whatIs: 'Sliding window keeps a moving subarray/substring and updates state incrementally instead of recomputing.',
    headers: ['<vector>', '<string>', '<unordered_map>'],
    functions: ['windowSum += a[r]', 'windowSum -= a[l]', 'while (condition)', 'freq[s[r]]++', 'freq[s[l]]--'],
    exampleTitle: 'Fixed window max sum of size k',
    exampleCode: `int sum = 0, best = INT_MIN;
for (int r = 0; r < n; r++) {
  sum += a[r];
  if (r >= k) sum -= a[r - k];
  if (r >= k - 1) best = max(best, sum);
}`,
  },
  stack: {
    whatIs: 'Stack follows LIFO and is used for expression parsing, monotonic problems, and matching brackets.',
    headers: ['<stack>', '<vector>'],
    functions: ['st.push(x)', 'st.pop()', 'st.top()', 'st.empty()'],
    exampleTitle: 'Balanced parentheses check',
    exampleCode: `stack<char> st;
for (char c : s) {
  if (c == '(') st.push(c);
  else if (c == ')') {
    if (st.empty()) return false;
    st.pop();
  }
}
return st.empty();`,
  },
  'binary search': {
    whatIs: 'Binary search cuts search space in half on sorted data or monotonic answer spaces.',
    headers: ['<vector>', '<algorithm>'],
    functions: ['lower_bound(begin, end, x)', 'upper_bound(begin, end, x)', 'mid = l + (r - l) / 2'],
    exampleTitle: 'Find first position >= target',
    exampleCode: `auto it = lower_bound(v.begin(), v.end(), target);
int idx = (it == v.end()) ? -1 : int(it - v.begin());`,
  },
  'linked list': {
    whatIs: 'Linked list is node-based dynamic storage where each node points to the next (or previous) node.',
    headers: ['<list>', '<forward_list>'],
    functions: ['lst.push_back(x)', 'lst.push_front(x)', 'lst.pop_front()', 'it = next(it)'],
    exampleTitle: 'Use std::list for O(1) middle erase (iterator known)',
    exampleCode: `list<int> lst = {10, 20, 30, 40};
auto it = lst.begin();
advance(it, 2); // points to 30
lst.erase(it);  // removes 30`,
  },
  trees: {
    whatIs: 'Tree problems model hierarchy with recursive decomposition (left subtree + right subtree + current node).',
    headers: ['<queue>', '<stack>', '<vector>'],
    functions: ['q.push(node)', 'q.front()', 'q.pop()', 'recursive dfs(node)'],
    exampleTitle: 'Level order traversal skeleton',
    exampleCode: `queue<TreeNode*> q;
q.push(root);
while (!q.empty()) {
  TreeNode* cur = q.front(); q.pop();
  if (cur->left) q.push(cur->left);
  if (cur->right) q.push(cur->right);
}`,
  },
  graphs: {
    whatIs: 'Graphs represent relationships; STL containers help build adjacency lists and run BFS/DFS efficiently.',
    headers: ['<vector>', '<queue>', '<stack>', '<unordered_map>'],
    functions: ['adj[u].push_back(v)', 'q.push(src)', 'visited[u] = true', 'for (int v : adj[u])'],
    exampleTitle: 'Adjacency list build (undirected)',
    exampleCode: `vector<vector<int>> adj(n);
for (auto &e : edges) {
  int u = e[0], v = e[1];
  adj[u].push_back(v);
  adj[v].push_back(u);
}`,
  },
  'dynamic programming': {
    whatIs: 'DP stores answers of overlapping subproblems to avoid recomputation.',
    headers: ['<vector>', '<algorithm>', '<climits>'],
    functions: ['vector<int> dp(n, init)', 'dp[i] = ...', 'dp[i] = max(dp[i], candidate)'],
    exampleTitle: 'Fibonacci tabulation',
    exampleCode: `vector<int> dp(n + 1, 0);
dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];`,
  },
  backtracking: {
    whatIs: 'Backtracking explores choices recursively and undoes changes after each recursive path.',
    headers: ['<vector>', '<string>', '<algorithm>'],
    functions: ['path.push_back(x)', 'path.pop_back()', 'dfs(index)', 'used[i] = true/false'],
    exampleTitle: 'Permutation path push/pop',
    exampleCode: `path.push_back(nums[i]);
used[i] = true;
dfs();
used[i] = false;
path.pop_back();`,
  },
  heaps: {
    whatIs: 'Heap gives fast access to min/max element and is ideal for top-k, scheduling, and streaming problems.',
    headers: ['<queue>', '<vector>', '<functional>'],
    functions: ['pq.push(x)', 'pq.pop()', 'pq.top()', 'priority_queue<int>', 'priority_queue<int, vector<int>, greater<int>>'],
    exampleTitle: 'Min-heap for k smallest',
    exampleCode: `priority_queue<int, vector<int>, greater<int>> minH;
for (int x : nums) minH.push(x);
for (int i = 0; i < k; i++) {
  cout << minH.top() << ' ';
  minH.pop();
}`,
  },
  tries: {
    whatIs: 'Trie stores words by prefix; each node maps characters to child nodes.',
    headers: ['<array>', '<vector>', '<string>'],
    functions: ['node->next[idx]', 'insert(word)', 'search(word)', 'startsWith(prefix)'],
    exampleTitle: 'Trie node with fixed alphabet',
    exampleCode: `struct Node {
  array<Node*, 26> next{};
  bool end = false;
};`,
  },
  'bit manipulation': {
    whatIs: 'Bit manipulation uses binary operations to optimize checks, toggles, and subset representations.',
    headers: ['<bitset>', '<climits>'],
    functions: ['x & (x - 1)', 'x | (1 << k)', 'x ^ (1 << k)', '(x >> k) & 1', '__builtin_popcount(x)'],
    exampleTitle: 'Check power of two',
    exampleCode: `bool isPowerOfTwo(int x) {
  return x > 0 && (x & (x - 1)) == 0;
}`,
  },
};

export default function TopicStudyGuide({ topicName }: { topicName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState(false);

  const guide = getStudyGuide(topicName);
  if (!guide) return null;
  const cppRef = topicCppReferences[guide.topicName.toLowerCase()] || null;
  const totalExpandableSections = guide.sections.length + (cppRef ? 4 : 3);

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    if (expandedSections.size === totalExpandableSections) {
      setExpandedSections(new Set());
    } else {
      const all = new Set<number>();
      for (let i = 0; i < totalExpandableSections; i++) all.add(i);
      setExpandedSections(all);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(guide.codeExample.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && expandedSections.size === 0) setExpandedSections(new Set([0])); }}
        className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <BookOpen size={14} />
        {isOpen ? 'Hide Study Guide' : `📖 Study Guide: ${guide.tagline}`}
      </button>

      {isOpen && (
        <div className="relative mt-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-in fade-in zoom-in-95 space-y-4 overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.25)]">
          <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/6 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/6 blur-3xl" />
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{guide.emoji}</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">{guide.topicName}</h3>
                <p className="text-[10px] text-gray-500">Prerequisite: {guide.prerequisite}</p>
              </div>
            </div>
            <button onClick={expandAll} className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest hover:text-emerald-400 transition-colors">
              {expandedSections.size === totalExpandableSections ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {/* Concept Sections */}
          {guide.sections.map((section, idx) => (
            <div key={idx} className="relative z-10 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center gap-2 p-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
              >
                <span className="text-sm">{section.icon}</span>
                <span className="text-[11px] font-bold text-white flex-1">{section.title}</span>
                {expandedSections.has(idx) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
              </button>
              {expandedSections.has(idx) && (
                <div className="p-4 bg-black/20">
                  <pre className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-mono wrap-break-word">{section.content}</pre>
                </div>
              )}
            </div>
          ))}

          {/* Pattern Triggers */}
          <div className="relative z-10 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
            <button
              onClick={() => toggleSection(guide.sections.length)}
              className="w-full flex items-center gap-2 p-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
            >
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold text-white flex-1">🎯 Pattern Recognition — &quot;When I See X, I Think Y&quot;</span>
              {expandedSections.has(guide.sections.length) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length) && (
              <div className="p-4 bg-black/20 space-y-2">
                {guide.patternTriggers.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-amber-400 shrink-0 mt-0.5">▸</span>
                    <div className="min-w-0">
                      <span className="text-gray-400">If you see </span>
                      <span className="text-white font-bold wrap-break-word">{pt.trigger}</span>
                      <ArrowRight size={10} className="inline mx-1 text-gray-600" />
                      <span className="text-emerald-400 font-medium wrap-break-word">{pt.pattern}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complexity Table */}
          {cppRef && (
            <div className="border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(guide.sections.length + 1)}
                className="w-full flex items-center gap-2 p-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
              >
                <Code2 size={14} className="text-cyan-400" />
                <span className="text-[11px] font-bold text-white flex-1">🧰 C++ STL Quick Reference</span>
                {expandedSections.has(guide.sections.length + 1) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
              </button>
              {expandedSections.has(guide.sections.length + 1) && (
                <div className="p-4 bg-black/20 space-y-3">
                  <p className="text-[11px] text-gray-300 leading-relaxed">{cppRef.whatIs}</p>
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Libraries</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {cppRef.headers.map((header) => (
                        <span key={header} className="px-2 py-1 text-[10px] rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono transition-all duration-300 hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(6,182,212,0.16)]">{header}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Key Sub-functions</span>
                    <ul className="mt-2 space-y-1">
                      {cppRef.functions.map((fn) => (
                        <li key={fn} className="text-[11px] text-gray-300 flex items-start gap-2">
                          <span className="text-cyan-400 shrink-0">•</span>
                          <span className="font-mono wrap-break-word">{fn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Mini Example: {cppRef.exampleTitle}</span>
                    <pre className="mt-2 text-[11px] text-cyan-200 bg-black/40 p-3 rounded-lg overflow-x-auto font-mono whitespace-pre border border-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_16px_rgba(0,0,0,0.28)]">{cppRef.exampleCode}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complexity Table */}
          <div className="relative z-10 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
            <button
              onClick={() => toggleSection(guide.sections.length + (cppRef ? 2 : 1))}
              className="w-full flex items-center gap-2 p-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
            >
              <Table size={14} className="text-blue-400" />
              <span className="text-[11px] font-bold text-white flex-1">⏱️ Complexity Reference</span>
              {expandedSections.has(guide.sections.length + (cppRef ? 2 : 1)) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length + (cppRef ? 2 : 1)) && (
              <div className="p-4 bg-black/20 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-gray-500 uppercase tracking-widest border-b border-white/5">
                      <th className="text-left py-2 pr-4 font-black">Operation</th>
                      <th className="text-left py-2 pr-4 font-black">Time</th>
                      <th className="text-left py-2 font-black">Space</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.complexityTable.map((row, i) => (
                      <tr key={i} className="border-b border-white/3">
                        <td className="py-1.5 pr-4 text-gray-300 font-medium">{row.operation}</td>
                        <td className="py-1.5 pr-4 text-blue-400 font-bold">{row.time}</td>
                        <td className="py-1.5 text-purple-400 font-bold">{row.space}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Worked Example */}
          <div className="relative z-10 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
            <button
              onClick={() => toggleSection(guide.sections.length + (cppRef ? 3 : 2))}
              className="w-full flex items-center gap-2 p-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
            >
              <Code2 size={14} className="text-green-400" />
              <span className="text-[11px] font-bold text-white flex-1">🧪 Worked Example: {guide.codeExample.title}</span>
              {expandedSections.has(guide.sections.length + (cppRef ? 3 : 2)) ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
            </button>
            {expandedSections.has(guide.sections.length + (cppRef ? 3 : 2)) && (
              <div className="p-4 bg-black/20 space-y-3">
                <div className="relative">
                  <pre className="text-[11px] text-green-300 bg-black/40 p-4 rounded-lg overflow-x-auto font-mono whitespace-pre">{guide.codeExample.code}</pre>
                  <button onClick={copyCode} className="absolute top-2 right-2 p-1.5 bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                    {copiedCode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Step-by-step Walkthrough:</span>
                  <pre className="mt-2 text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-mono wrap-break-word">{guide.codeExample.walkthrough}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaways */}
          <div className="relative z-10 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Key Takeaways</span>
            </div>
            <ul className="space-y-1">
              {guide.keyTakeaways.map((t, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0">✓</span>
                  <span className="wrap-break-word">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
