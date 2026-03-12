import { StudyGuide } from "./types";

export const cppBasicsGuide: StudyGuide = {
  topicName: "C++ Basics for DSA",
  emoji: "⚡",
  tagline: "Master the C++ fundamentals and STL that power every algorithm",
  prerequisite: "Basic programming knowledge",
  sections: [
    {
      title: "Why C++ for DSA?",
      icon: "🎯",
      content: `C++ is the most widely used language for competitive programming and coding interviews at top companies. Its Standard Template Library (STL), zero-cost abstractions, and raw performance make it the go-to for DSA.

Key advantages:
• STL provides vector, map, set, queue, stack, priority_queue — all optimized
• O(1) average-case unordered_map and unordered_set
• std::sort is highly optimized (introsort) — fastest in practice
• No garbage collector = predictable, low latency
• Pass-by-reference avoids copying large arrays`,
    },
    {
      title: "Essential STL Data Structures",
      icon: "🧱",
      content: `▸ vector<T> — dynamic array (use instead of raw arrays)
  vector<int> v = {1, 2, 3};
  v.push_back(4);    // O(1) amortized — add to end
  v.pop_back();      // O(1) — remove from end
  v[i];             // O(1) — random access
  v.size();         // number of elements

▸ unordered_map<K,V> — hash map with O(1) average access
  unordered_map<string, int> freq;
  freq["hello"]++;
  freq.count("hello"); // 1 if exists, 0 if not
  freq.find("hello");  // iterator

▸ unordered_set<T> — hash set with O(1) average lookup
  unordered_set<int> seen;
  seen.insert(5);
  seen.count(5);   // O(1)

▸ map<K,V> / set<T> — balanced BST, O(log N), always sorted
  Use when you need ordered keys or lower_bound/upper_bound.`,
    },
    {
      title: "Critical Gotchas for Interviews",
      icon: "⚠️",
      content: `1. Integer overflow: int overflows at ~2×10⁹. Use long long for large values.
   long long x = 1e18; // Safe up to ~9.2×10¹⁸

2. std::sort needs a proper comparator:
   sort(v.begin(), v.end());              // ascending — ✅
   sort(v.begin(), v.end(), greater<int>()); // descending ✅
   // NEVER return true for equal elements — undefined behavior!

3. Uninitialized variables default to garbage in C++.
   int dp[1001] = {};        // zero-initialize ✅
   vector<int> dp(n+1, 0);  // preferred ✅

4. Pass vectors by reference to avoid O(N) copy cost:
   void solve(vector<int>& arr) { ... }  // ✅
   void solve(vector<int> arr)  { ... }  // ❌ copies every call

5. size() returns unsigned — (size() - 1) underflows if empty!
   Use (int)v.size() to cast to signed int.`,
    },
    {
      title: "Useful Patterns & Idioms",
      icon: "💡",
      content: `▸ Swapping values:
  swap(a, b);               // O(1), no temp needed

▸ Creating 2D vectors:
  vector<vector<int>> grid(m, vector<int>(n, 0));

▸ Frequency counter:
  unordered_map<char, int> freq;
  for (char ch : s) freq[ch]++;

▸ Stack:
  stack<int> st;
  st.push(x);  st.pop();  st.top();

▸ Queue (O(1) front/push):
  queue<int> q;
  q.push(x);  q.pop();  q.front();

▸ Min/Max helpers:
  int lo = INT_MIN, hi = INT_MAX;
  min(a, b);  max(a, b);  abs(x);

▸ Fast I/O (for competitive programming):
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);`,
    },
  ],
  patternTriggers: [
    {
      trigger: "Need to count occurrences",
      pattern: "Use unordered_map<T, int> as a frequency counter",
    },
    {
      trigger: "Need unique elements with O(1) lookup",
      pattern: "Use unordered_set<T>",
    },
    {
      trigger: "Need sorted keys or range queries",
      pattern: "Use map<K,V> or set<T> (O(log N))",
    },
    {
      trigger: "Need to sort a vector",
      pattern: "sort(v.begin(), v.end()) — always pass a valid comparator",
    },
  ],
  complexityTable: [
    {
      operation: "vector push_back / pop_back",
      time: "O(1) amortized",
      space: "O(1)",
    },
    {
      operation: "vector insert / erase (middle)",
      time: "O(N)",
      space: "O(1)",
    },
    { operation: "std::sort", time: "O(N log N)", space: "O(log N)" },
    {
      operation: "unordered_map get / set / count",
      time: "O(1) avg",
      space: "O(1)",
    },
    { operation: "map / set find / insert", time: "O(log N)", space: "O(1)" },
    {
      operation: "unordered_set insert / count",
      time: "O(1) avg",
      space: "O(1)",
    },
  ],
  codeExample: {
    title: "Two Sum using unordered_map",
    code: `vector<int> twoSum(vector<int>& nums, int target) {
  unordered_map<int, int> seen; // value -> index
  for (int i = 0; i < (int)nums.size(); i++) {
    int complement = target - nums[i];
    if (seen.count(complement)) {
      return {seen[complement], i};
    }
    seen[nums[i]] = i;
  }
  return {};
}`,
    walkthrough: `Input: nums = [2, 7, 11, 15], target = 9

Step 1: i=0, nums[0]=2, complement=7, seen={} → 7 not in map → store {2:0}
Step 2: i=1, nums[1]=7, complement=2, seen={2:0} → 2 IS in map! → return {0, 1} ✅

Key insight: Instead of checking every pair O(N²), we store seen numbers in an unordered_map for O(1) lookup, making the entire solution O(N).`,
  },
  keyTakeaways: [
    "Use long long instead of int when values can exceed ~2×10⁹",
    "Always pass vector<T>& (by reference) to avoid expensive copies",
    "unordered_map/set for O(1) lookups; map/set when order matters",
    "Cast size() to int: (int)v.size() to avoid underflow bugs",
    "std::sort is safe and fast — always pass a consistent comparator",
  ],
};
