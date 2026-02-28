import { StudyGuide } from './types';

export const stackGuide: StudyGuide = {
  topicName: 'Stack',
  emoji: '📚',
  tagline: 'Last In, First Out — the backbone of parentheses, undo, and monotonic patterns',
  prerequisite: 'Arrays',
  sections: [
    { title: 'What Is a Stack?', icon: '🧠', content: `A stack is a LIFO (Last In, First Out) data structure. Think of stacking plates — you can only add/remove from the TOP.

  push(3) → [3]
  push(5) → [3, 5]
  push(1) → [3, 5, 1]
  pop()   → [3, 5]  (returns 1)
  peek()  → 5       (top element, don't remove)

In JavaScript: use an array!
  const stack = [];
  stack.push(x);     // O(1)
  stack.pop();       // O(1)
  stack[stack.length - 1]; // peek, O(1)` },
    { title: 'Stack Pattern: Matching Brackets', icon: '🔗', content: `The classic: validate parentheses/brackets.

Algorithm:
  For each character:
    If opening bracket → push to stack
    If closing bracket → pop and check if it matches

  function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    for (const ch of s) {
      if ('({['.includes(ch)) stack.push(ch);
      else if (stack.pop() !== pairs[ch]) return false;
    }
    return stack.length === 0;
  }

Why stack? Because the MOST RECENT opening bracket must match the NEXT closing bracket — LIFO order!` },
    { title: 'Monotonic Stack (Advanced)', icon: '🏔️', content: `A monotonic stack maintains elements in sorted order (increasing or decreasing). Used for "next greater/smaller element" problems.

Next Greater Element:
  For each element, find the first element to its RIGHT that is larger.

  Input:  [2, 1, 2, 4, 3]
  Output: [4, 2, 4, -1, -1]

  Algorithm: Traverse RIGHT to LEFT, maintain decreasing stack
  const stack = [];
  const result = new Array(n).fill(-1);
  for (let i = n-1; i >= 0; i--) {
    while (stack.length && stack[stack.length-1] <= nums[i]) {
      stack.pop(); // remove smaller elements
    }
    if (stack.length) result[i] = stack[stack.length-1];
    stack.push(nums[i]);
  }

This pattern solves: stock span, daily temperatures, largest rectangle in histogram.` },
    { title: 'Stack for Expression Evaluation', icon: '🧮', content: `Stacks evaluate mathematical expressions:

Infix:   3 + 4 * 2       (human readable)
Postfix: 3 4 2 * +       (stack friendly)

Evaluate postfix:
  Read 3 → push [3]
  Read 4 → push [3, 4]
  Read 2 → push [3, 4, 2]
  Read * → pop 2,4, push 4*2=8 → [3, 8]
  Read + → pop 8,3, push 3+8=11 → [11]

Also used for: calculator with +,-,*,/, handling nested parentheses.` }
  ],
  patternTriggers: [
    { trigger: '"Valid parentheses" or bracket matching', pattern: 'Stack — push open, pop and match close' },
    { trigger: '"Next greater element" or "daily temperatures"', pattern: 'Monotonic stack' },
    { trigger: '"Largest rectangle in histogram"', pattern: 'Monotonic increasing stack' },
    { trigger: '"Evaluate expression" or "calculator"', pattern: 'Two stacks (numbers + operators)' },
    { trigger: '"Undo/redo" or "browser history"', pattern: 'Two stacks' },
  ],
  complexityTable: [
    { operation: 'Push', time: 'O(1)', space: 'O(1)' },
    { operation: 'Pop', time: 'O(1)', space: 'O(1)' },
    { operation: 'Peek', time: 'O(1)', space: 'O(1)' },
    { operation: 'Monotonic stack pass', time: 'O(N) total', space: 'O(N)' },
  ],
  codeExample: {
    title: 'Daily Temperatures — Monotonic Stack',
    code: `function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = []; // stores indices
  
  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length-1]]) {
      const prevIdx = stack.pop();
      result[prevIdx] = i - prevIdx;
    }
    stack.push(i);
  }
  return result;
}`,
    walkthrough: `Input: [73, 74, 75, 71, 69, 72, 76, 73]

i=0: stack=[] → push 0 → [0]
i=1: 74>73 → pop 0, result[0]=1-0=1 → push 1 → [1]
i=2: 75>74 → pop 1, result[1]=2-1=1 → push 2 → [2]
i=3: 71<75 → push 3 → [2,3]
i=4: 69<71 → push 4 → [2,3,4]
i=5: 72>69 → pop 4, result[4]=5-4=1; 72>71 → pop 3, result[3]=5-3=2 → push 5 → [2,5]
i=6: 76>72 → pop 5, result[5]=6-5=1; 76>75 → pop 2, result[2]=6-2=4 → push 6 → [6]
i=7: 73<76 → push 7 → [6,7]

Result: [1, 1, 4, 2, 1, 1, 0, 0] ✅`
  },
  keyTakeaways: [
    'Stack = LIFO. Use JS array with push/pop.',
    'Bracket matching is the fundamental stack problem',
    'Monotonic stack finds next greater/smaller in O(N)',
    'Each element is pushed and popped AT MOST once → O(N) total',
    'When you see "nearest" or "next" — think monotonic stack'
  ]
};
