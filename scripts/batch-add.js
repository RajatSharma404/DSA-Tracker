/**
 * scripts/batch-add.js
 * CLI helper to quickly add multiple problem templates in one go.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOPIC_MAP = {
  'array': '01-arrays-and-hashing',
  'arrays': '01-arrays-and-hashing',
  'hashing': '01-arrays-and-hashing',
  'two-pointers': '02-two-pointers',
  'sliding-window': '03-sliding-window',
  'stack': '04-stack',
  'binary-search': '05-binary-search',
  'linked-list': '06-linked-list',
  'trees': '07-trees-and-tries',
  'heap': '08-heap-priority-queue',
  'backtracking': '09-backtracking',
  'graphs': '10-graphs',
  'dp': '11-dynamic-programming',
  'greedy': '12-greedy',
  'bit': '13-bit-manipulation',
  'math': '14-math-and-geometry',
  'advanced': '15-advanced-topics'
};

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

/**
 * Example usage:
 * node scripts/batch-add.js 1 "Two Sum" array Easy cpp
 * node scripts/batch-add.js 206 "Reverse Linked List" linked-list Easy cpp
 */
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: node scripts/batch-add.js <id> "<title>" <topic-key> <Easy|Medium|Hard> [cpp|py|java|js]');
  console.log('Topic keys:', Object.keys(TOPIC_MAP).join(', '));
  process.exit(0);
}

const [id, title, topicKey, difficulty, lang = 'cpp'] = args;
const folder = TOPIC_MAP[topicKey.toLowerCase()] || '01-arrays-and-hashing';
const slug = slugify(title);
const padId = String(id).padStart(4, '0');
const ext = lang === 'python' ? 'py' : lang;
const fileName = `${padId}-${slug}.${ext}`;
const targetDir = path.join(__dirname, '..', 'solutions', folder);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const filePath = path.join(targetDir, fileName);
if (!fs.existsSync(filePath)) {
  const content = `/**
 * Problem: ${id}. ${title}
 * Difficulty: ${difficulty}
 * Topic: ${folder}
 * LeetCode: https://leetcode.com/problems/${slug}/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

// Paste your accepted solution here
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created ${folder}/${fileName}`);
  require('./sync-solutions');
} else {
  console.log(`⚠️ Already exists: ${fileName}`);
}
