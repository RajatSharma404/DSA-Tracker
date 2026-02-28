import { StudyGuide } from './types';

export const linkedListGuide: StudyGuide = {
  topicName: 'Linked List',
  emoji: '🔗',
  tagline: 'Nodes and pointers — master the art of O(1) insertion and deletion',
  prerequisite: 'Arrays, Two Pointers',
  sections: [
    { title: 'What Is a Linked List?', icon: '🧠', content: `A linked list is a chain of nodes where each node holds data and a pointer to the next.

  HEAD → [10|→] → [20|→] → [30|→] → null

  class ListNode {
    constructor(val, next = null) {
      this.val = val;
      this.next = next;
    }
  }

vs Array:
• Array: O(1) access, O(N) insert/delete in middle
• Linked List: O(N) access, O(1) insert/delete (if you have the node)

Types: Singly linked, Doubly linked (prev + next), Circular` },
    { title: 'The Dummy Node Trick', icon: '🎭', content: `The #1 technique for linked list problems: use a DUMMY head node.

Why? Avoids edge cases with the head node.

  function removeElements(head, val) {
    const dummy = new ListNode(0, head);
    let curr = dummy;
    while (curr.next) {
      if (curr.next.val === val) {
        curr.next = curr.next.next; // skip the node
      } else {
        curr = curr.next;
      }
    }
    return dummy.next; // new head
  }

Without dummy, you'd need special handling when head itself needs removal. Dummy eliminates that.` },
    { title: 'Slow & Fast Pointer', icon: '🐢🐇', content: `The Floyd's cycle detection / tortoise and hare pattern.

CYCLE DETECTION:
  slow moves 1 step, fast moves 2 steps
  If they meet → cycle exists
  If fast reaches null → no cycle

FIND MIDDLE:
  Same technique — when fast reaches end, slow is at middle
  
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  // slow is now at the middle!

This is used for: cycle detection, find middle, palindrome check, find cycle start.` },
    { title: 'Reverse a Linked List', icon: '🔄', content: `The most important linked list operation. Must be able to do it in your sleep.

  function reverseList(head) {
    let prev = null, curr = head;
    while (curr) {
      const next = curr.next;  // save next
      curr.next = prev;        // reverse pointer
      prev = curr;             // move prev forward
      curr = next;             // move curr forward
    }
    return prev; // new head
  }

Step-by-step:
  1→2→3→null
  null←1  2→3→null  (prev=1, curr=2)
  null←1←2  3→null  (prev=2, curr=3)
  null←1←2←3        (prev=3, curr=null)
  Return prev = 3 → 3→2→1→null ✅` }
  ],
  patternTriggers: [
    { trigger: '"Reverse linked list" (whole or partial)', pattern: 'prev/curr/next pointer reversal' },
    { trigger: '"Detect cycle" or "find loop"', pattern: 'Floyd\'s slow/fast pointer' },
    { trigger: '"Find middle of list"', pattern: 'Slow/fast — slow at middle when fast at end' },
    { trigger: '"Merge two sorted lists"', pattern: 'Dummy node + compare heads' },
    { trigger: '"Remove Nth from end"', pattern: 'Two pointers — fast moves N ahead first' },
  ],
  complexityTable: [
    { operation: 'Access by index', time: 'O(N)', space: 'O(1)' },
    { operation: 'Insert/Delete at head', time: 'O(1)', space: 'O(1)' },
    { operation: 'Insert/Delete at tail', time: 'O(N) singly / O(1) doubly', space: 'O(1)' },
    { operation: 'Search', time: 'O(N)', space: 'O(1)' },
    { operation: 'Reverse', time: 'O(N)', space: 'O(1)' },
  ],
  codeExample: {
    title: 'Merge Two Sorted Lists',
    code: `function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  curr.next = l1 || l2; // attach remaining
  return dummy.next;
}`,
    walkthrough: `Input: l1=[1→2→4], l2=[1→3→4]

dummy→ (curr=dummy)
Compare 1 vs 1: pick l1(1), dummy→1, l1=[2→4]
Compare 2 vs 1: pick l2(1), dummy→1→1, l2=[3→4]
Compare 2 vs 3: pick l1(2), dummy→1→1→2, l1=[4]
Compare 4 vs 3: pick l2(3), dummy→1→1→2→3, l2=[4]
Compare 4 vs 4: pick l1(4), dummy→1→1→2→3→4, l1=null
Attach l2(4): dummy→1→1→2→3→4→4

Result: [1,1,2,3,4,4] ✅`
  },
  keyTakeaways: [
    'Always use a dummy node to avoid head edge cases',
    'Reverse: prev→curr→next, save next, point curr back, advance',
    'Slow/fast finds middle and detects cycles',
    'Draw the pointers on paper! Linked list bugs are pointer bugs.',
    'For "Nth from end": move fast N steps ahead, then move both'
  ]
};
