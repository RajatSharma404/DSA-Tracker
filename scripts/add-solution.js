/**
 * scripts/add-solution.js
 * Quick interactive CLI tool to scaffold, document, and optionally commit LeetCode solutions.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const TOPICS = [
  { folder: '01-arrays-and-hashing', name: 'Arrays & Hashing' },
  { folder: '02-two-pointers', name: 'Two Pointers' },
  { folder: '03-sliding-window', name: 'Sliding Window' },
  { folder: '04-stack', name: 'Stack' },
  { folder: '05-binary-search', name: 'Binary Search' },
  { folder: '06-linked-list', name: 'Linked List' },
  { folder: '07-trees-and-tries', name: 'Trees & Tries' },
  { folder: '08-heap-priority-queue', name: 'Heap / Priority Queue' },
  { folder: '09-backtracking', name: 'Recursion & Backtracking' },
  { folder: '10-graphs', name: 'Graphs' },
  { folder: '11-dynamic-programming', name: 'Dynamic Programming' },
  { folder: '12-greedy', name: 'Greedy' },
  { folder: '13-bit-manipulation', name: 'Bit Manipulation' },
  { folder: '14-math-and-geometry', name: 'Math & Number Theory' },
  { folder: '15-advanced-topics', name: 'Advanced DSA' }
];

const EXTENSIONS = {
  '1': { name: 'C++', ext: 'cpp', comment: '//' },
  '2': { name: 'Python', ext: 'py', comment: '#' },
  '3': { name: 'Java', ext: 'java', comment: '//' },
  '4': { name: 'JavaScript', ext: 'js', comment: '//' },
  '5': { name: 'TypeScript', ext: 'ts', comment: '//' }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function padNumber(num) {
  return String(num).padStart(4, '0');
}

async function main() {
  console.log('\n=============================================');
  console.log('   🚀 DSA Tracker - New Solution Scaffolder  ');
  console.log('=============================================\n');

  const problemIdRaw = await ask('1. Problem Number (e.g. 1, 49, 206): ');
  const problemId = parseInt(problemIdRaw.trim(), 10);
  if (isNaN(problemId)) {
    console.error('❌ Invalid problem number.');
    rl.close();
    return;
  }

  const problemTitle = (await ask('2. Problem Title (e.g. Two Sum): ')).trim();
  if (!problemTitle) {
    console.error('❌ Problem title cannot be empty.');
    rl.close();
    return;
  }

  console.log('\nDifficulty: [1] Easy  [2] Medium  [3] Hard');
  const diffChoice = (await ask('Select difficulty (1/2/3) [Default 1]: ')).trim() || '1';
  const difficultyMap = { '1': 'Easy', '2': 'Medium', '3': 'Hard' };
  const difficulty = difficultyMap[diffChoice] || 'Easy';

  console.log('\nSelect Topic Category:');
  TOPICS.forEach((t, i) => {
    console.log(`  [${(i + 1).toString().padStart(2, ' ')}] ${t.name}`);
  });
  const topicChoice = (await ask('\nEnter topic number (1-15): ')).trim();
  const topicIdx = parseInt(topicChoice, 10) - 1;
  const selectedTopic = TOPICS[topicIdx] || TOPICS[0];

  console.log('\nSelect Language:');
  Object.keys(EXTENSIONS).forEach((key) => {
    console.log(`  [${key}] ${EXTENSIONS[key].name}`);
  });
  const langChoice = (await ask('Select language [Default 1 (C++)]: ')).trim() || '1';
  const langInfo = EXTENSIONS[langChoice] || EXTENSIONS['1'];

  const timeComp = (await ask('\nTime Complexity (e.g. O(n)) [Default O(n)]: ')).trim() || 'O(n)';
  const spaceComp = (await ask('Space Complexity (e.g. O(1)) [Default O(1)]: ')).trim() || 'O(1)';

  const autoCommit = (await ask('\nAuto commit with git? (y/n) [Default y]: ')).trim().toLowerCase() !== 'n';

  const slug = slugify(problemTitle);
  const fileName = `${padNumber(problemId)}-${slug}.${langInfo.ext}`;
  const solutionsRoot = path.join(__dirname, '..', 'solutions');
  const targetDir = path.join(solutionsRoot, selectedTopic.folder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;

  let template = '';
  if (langInfo.ext === 'py') {
    template = `"""
Problem: ${problemId}. ${problemTitle}
Difficulty: ${difficulty}
Topic: ${selectedTopic.name}
LeetCode Link: ${leetcodeUrl}

Complexity:
- Time: ${timeComp}
- Space: ${spaceComp}
"""

class Solution:
    def solve(self):
        # TODO: Paste your accepted solution here
        pass
`;
  } else if (langInfo.ext === 'cpp') {
    template = `/**
 * Problem: ${problemId}. ${problemTitle}
 * Difficulty: ${difficulty}
 * Topic: ${selectedTopic.name}
 * LeetCode Link: ${leetcodeUrl}
 * 
 * Complexity:
 * - Time: ${timeComp}
 * - Space: ${spaceComp}
 */

#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    // TODO: Paste your accepted solution here
};
`;
  } else if (langInfo.ext === 'java') {
    template = `/**
 * Problem: ${problemId}. ${problemTitle}
 * Difficulty: ${difficulty}
 * Topic: ${selectedTopic.name}
 * LeetCode Link: ${leetcodeUrl}
 * 
 * Complexity:
 * - Time: ${timeComp}
 * - Space: ${spaceComp}
 */

class Solution {
    // TODO: Paste your accepted solution here
}
`;
  } else {
    template = `/**
 * Problem: ${problemId}. ${problemTitle}
 * Difficulty: ${difficulty}
 * Topic: ${selectedTopic.name}
 * LeetCode Link: ${leetcodeUrl}
 * 
 * Complexity:
 * - Time: ${timeComp}
 * - Space: ${spaceComp}
 */

// TODO: Paste your accepted solution here
`;
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template, 'utf8');
    console.log(`\n✅ Created file: solutions/${selectedTopic.folder}/${fileName}`);
  } else {
    console.log(`\n⚠️ File already exists: solutions/${selectedTopic.folder}/${fileName}`);
  }

  // Run sync to update README
  try {
    const syncScript = path.join(__dirname, 'sync-solutions.js');
    if (fs.existsSync(syncScript)) {
      require(syncScript);
    }
  } catch (err) {
    console.error('Could not sync README:', err.message);
  }

  if (autoCommit) {
    try {
      execSync('git add solutions/', { cwd: path.join(__dirname, '..') });
      const commitMsg = `feat(solutions): add ${problemId}. ${problemTitle} (${difficulty})`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: path.join(__dirname, '..') });
      console.log(`\n🎉 Committed: "${commitMsg}"`);
      console.log('👉 Run "git push" to update your GitHub graph!');
    } catch (err) {
      console.log('\n⚠️ Git commit skipped or already up to date.');
    }
  }

  rl.close();
}

main();
