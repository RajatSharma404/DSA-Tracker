const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const problems = [
  {
    id: 134,
    title: 'Gas Station',
    folder: '12-greedy',
    fileName: '0134-gas-station.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 134. Gas Station
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/gas-station/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <numeric>

using namespace std;

class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int totalGas = 0, totalCost = 0;
        for (int i = 0; i < gas.size(); ++i) {
            totalGas += gas[i];
            totalCost += cost[i];
        }
        if (totalGas < totalCost) return -1;

        int startIndex = 0;
        int currentTank = 0;

        for (int i = 0; i < gas.size(); ++i) {
            currentTank += gas[i] - cost[i];
            if (currentTank < 0) {
                startIndex = i + 1;
                currentTank = 0;
            }
        }
        return startIndex;
    }
};
`
  },
  {
    id: 846,
    title: 'Hand of Straights',
    folder: '12-greedy',
    fileName: '0846-hand-of-straights.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n log n)',
    space: 'O(n)',
    code: `/**
 * Problem: 846. Hand of Straights
 * Difficulty: Medium
 * Topic: Greedy / Ordered Map
 * LeetCode Link: https://leetcode.com/problems/hand-of-straights/
 * 
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(n)
 */

#include <vector>
#include <map>

using namespace std;

class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;

        map<int, int> count;
        for (int card : hand) count[card]++;

        for (auto& [card, freq] : count) {
            if (freq > 0) {
                int needed = freq;
                for (int i = 0; i < groupSize; ++i) {
                    if (count[card + i] < needed) return false;
                    count[card + i] -= needed;
                }
            }
        }
        return true;
    }
};
`
  },
  {
    id: 1899,
    title: 'Merge Triplets to Form Target Triplet',
    folder: '12-greedy',
    fileName: '1899-merge-triplets-to-form-target-triplet.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 1899. Merge Triplets to Form Target Triplet
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/merge-triplets-to-form-target-triplet/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        bool has0 = false, has1 = false, has2 = false;

        for (const auto& t : triplets) {
            if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) {
                if (t[0] == target[0]) has0 = true;
                if (t[1] == target[1]) has1 = true;
                if (t[2] == target[2]) has2 = true;
            }
        }
        return has0 && has1 && has2;
    }
};
`
  },
  {
    id: 763,
    title: 'Partition Labels',
    folder: '12-greedy',
    fileName: '0763-partition-labels.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 763. Partition Labels
 * Difficulty: Medium
 * Topic: Greedy / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/partition-labels/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) (26 characters)
 */

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> lastIndex(26, 0);
        for (int i = 0; i < s.length(); ++i) {
            lastIndex[s[i] - 'a'] = i;
        }

        vector<int> result;
        int start = 0, end = 0;

        for (int i = 0; i < s.length(); ++i) {
            end = max(end, lastIndex[s[i] - 'a']);
            if (i == end) {
                result.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return result;
    }
};
`
  },
  {
    id: 678,
    title: 'Valid Parenthesis String',
    folder: '12-greedy',
    fileName: '0678-valid-parenthesis-string.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 678. Valid Parenthesis String
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/valid-parenthesis-string/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    bool checkValidString(string s) {
        int cmin = 0, cmax = 0; // min and max open parentheses count

        for (char c : s) {
            if (c == '(') {
                cmin++;
                cmax++;
            } else if (c == ')') {
                cmin = max(cmin - 1, 0);
                cmax--;
            } else { // '*'
                cmin = max(cmin - 1, 0);
                cmax++;
            }

            if (cmax < 0) return false;
        }
        return cmin == 0;
    }
};
`
  },
  {
    id: 136,
    title: 'Single Number',
    folder: '13-bit-manipulation',
    fileName: '0136-single-number.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 136. Single Number
 * Difficulty: Easy
 * Topic: Bit Manipulation (XOR)
 * LeetCode Link: https://leetcode.com/problems/single-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
};
`
  },
  {
    id: 191,
    title: 'Number of 1 Bits',
    folder: '13-bit-manipulation',
    fileName: '0191-number-of-1-bits.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    time: 'O(1)',
    space: 'O(1)',
    code: `/**
 * Problem: 191. Number of 1 Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation (Brian Kernighan's Algorithm)
 * LeetCode Link: https://leetcode.com/problems/number-of-1-bits/
 * 
 * Complexity:
 * - Time: O(1) (at most 32 iterations)
 * - Space: O(1)
 */

#include <cstdint>

using namespace std;

class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1);
            count++;
        }
        return count;
    }
};
`
  },
  {
    id: 338,
    title: 'Counting Bits',
    folder: '13-bit-manipulation',
    fileName: '0338-counting-bits.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    time: 'O(n)',
    space: 'O(1) excluding output',
    code: `/**
 * Problem: 338. Counting Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation / DP
 * LeetCode Link: https://leetcode.com/problems/counting-bits/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) auxiliary
 */

#include <vector>

using namespace std;

class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> dp(n + 1, 0);
        for (int i = 1; i <= n; ++i) {
            dp[i] = dp[i >> 1] + (i & 1);
        }
        return dp;
    }
};
`
  },
  {
    id: 190,
    title: 'Reverse Bits',
    folder: '13-bit-manipulation',
    fileName: '0190-reverse-bits.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    time: 'O(1)',
    space: 'O(1)',
    code: `/**
 * Problem: 190. Reverse Bits
 * Difficulty: Easy
 * Topic: Bit Manipulation
 * LeetCode Link: https://leetcode.com/problems/reverse-bits/
 * 
 * Complexity:
 * - Time: O(1) (32 bits)
 * - Space: O(1)
 */

#include <cstdint>

using namespace std;

class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; ++i) {
            result = (result << 1) | (n & 1);
            n >>= 1;
        }
        return result;
    }
};
`
  },
  {
    id: 268,
    title: 'Missing Number',
    folder: '13-bit-manipulation',
    fileName: '0268-missing-number.cpp',
    difficulty: 'Easy',
    topic: 'Bit Manipulation',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 268. Missing Number
 * Difficulty: Easy
 * Topic: Bit Manipulation (XOR)
 * LeetCode Link: https://leetcode.com/problems/missing-number/
 * 
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        int missing = n;
        for (int i = 0; i < n; ++i) {
            missing ^= i ^ nums[i];
        }
        return missing;
    }
};
`
  }
];

const rootDir = path.join(__dirname, '..');
const solutionsDir = path.join(rootDir, 'solutions');

for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const targetDir = path.join(solutionsDir, p.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, p.fileName);
  fs.writeFileSync(filePath, p.code, 'utf8');

  sync();

  const commitMsg = `feat(solutions): add ${p.id}. ${p.title} (${p.difficulty})`;
  execSync('git add .', { cwd: rootDir });
  execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir });
  console.log(`[${i + 1}/10] Committed: "${commitMsg}"`);
}

console.log('\n🚀 Pushing all 10 commits to GitHub...');
try {
  const pushOutput = execSync('git push origin main', { cwd: rootDir }).toString();
  console.log(pushOutput);
  console.log('\n🎉 Successfully committed and pushed 10 questions to GitHub!');
} catch (err) {
  console.error('Push error:', err.message);
}
