import { StudyGuide } from './types';

export const treesGuide: StudyGuide = {
  topicName: 'Trees',
  emoji: '🌲',
  tagline: 'Recursive thinking meets hierarchical data — the interview favorite',
  prerequisite: 'Linked List, Stack',
  sections: [
    { title: 'Tree Fundamentals', icon: '🧠', content: `A tree is a hierarchical data structure with nodes connected by edges. No cycles allowed.

          1        ← root
        /   \\
       2     3     ← children of 1
      / \\     \\
     4   5     6   ← leaf nodes (no children)

Key terms:
• Root: topmost node (1)
• Parent/Child: 1 is parent of 2,3
• Leaf: node with no children (4,5,6)
• Height: longest path from root to leaf
• Depth: distance from root to node

Binary Tree: each node has AT MOST 2 children (left, right)
BST (Binary Search Tree): left < parent < right` },
    { title: 'Traversal Methods', icon: '🚶', content: `Four ways to visit every node:

INORDER (Left → Root → Right) — gives SORTED order for BST
  function inorder(node) {
    if (!node) return;
    inorder(node.left);
    visit(node);
    inorder(node.right);
  }

PREORDER (Root → Left → Right) — used to COPY or SERIALIZE trees
POSTORDER (Left → Right → Root) — used to DELETE trees (children first)

LEVEL ORDER (BFS) — visit level by level using a queue
  function levelOrder(root) {
    const queue = [root], result = [];
    while (queue.length) {
      const level = [];
      for (let i = queue.length; i > 0; i--) {
        const node = queue.shift();
        level.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      result.push(level);
    }
    return result;
  }` },
    { title: 'The DFS Recursive Template', icon: '🔑', content: `90% of tree problems follow this template:

  function solve(node) {
    if (!node) return BASE_CASE;
    
    const leftResult = solve(node.left);
    const rightResult = solve(node.right);
    
    return COMBINE(node.val, leftResult, rightResult);
  }

Examples:
  Max depth:  return 1 + Math.max(solve(left), solve(right))
  Sum:        return node.val + solve(left) + solve(right)
  Is balanced: check |leftH - rightH| <= 1 at every node
  Diameter:   track maxPath through each node` },
    { title: 'BST Properties & Operations', icon: '🔍', content: `Binary Search Tree: for every node, LEFT < NODE < RIGHT

This gives us O(log N) search, insert, delete (if balanced).

  Search:
  function search(node, target) {
    if (!node) return null;
    if (target === node.val) return node;
    if (target < node.val) return search(node.left, target);
    return search(node.right, target);
  }

Key BST facts:
• Inorder traversal gives SORTED order
• Kth smallest = Kth element in inorder
• Validate BST: pass min/max bounds recursively
• LCA in BST: first node where p and q split (one goes left, one goes right)` }
  ],
  patternTriggers: [
    { trigger: '"Maximum depth" or "height of tree"', pattern: 'DFS recursive — 1 + max(left, right)' },
    { trigger: '"Level order" or "zigzag"', pattern: 'BFS with queue' },
    { trigger: '"Validate BST"', pattern: 'DFS with min/max bounds' },
    { trigger: '"Lowest common ancestor"', pattern: 'DFS — find where paths diverge' },
    { trigger: '"Serialize/deserialize tree"', pattern: 'Preorder with null markers' },
  ],
  complexityTable: [
    { operation: 'DFS traversal', time: 'O(N)', space: 'O(H)' },
    { operation: 'BFS traversal', time: 'O(N)', space: 'O(W)' },
    { operation: 'BST search/insert/delete', time: 'O(log N) avg', space: 'O(log N)' },
    { operation: 'BST worst case (skewed)', time: 'O(N)', space: 'O(N)' },
  ],
  codeExample: {
    title: 'Lowest Common Ancestor of BST',
    code: `function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) {
      node = node.left;      // both in left subtree
    } else if (p.val > node.val && q.val > node.val) {
      node = node.right;     // both in right subtree
    } else {
      return node;           // split point = LCA!
    }
  }
}`,
    walkthrough: `BST:      6
        /     \\
       2       8
      / \\     / \\
     0   4   7   9

Find LCA of 2 and 8:
  node=6: 2<6 but 8>6 → SPLIT → LCA = 6 ✅

Find LCA of 2 and 4:
  node=6: 2<6 and 4<6 → go left
  node=2: 2<=2 and 4>2 → SPLIT → LCA = 2 ✅`
  },
  keyTakeaways: [
    'Most tree problems = recursion. Think base case + combine children.',
    'BST inorder = sorted. Use this for Kth smallest, validation.',
    'BFS (queue) for level-by-level. DFS (recursion/stack) for depth problems.',
    'Balanced BST = O(log N). Skewed = O(N) = linked list!',
    'Always handle the null base case first in recursive functions.'
  ]
};
