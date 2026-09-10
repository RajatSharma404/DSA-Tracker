const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sync = require('./sync-solutions');

const rootDir = path.join(__dirname, '..');
const solutionsDir = path.join(rootDir, 'solutions');

const problems = [
  // 1. Arrays & Hashing
  {
    id: 26,
    title: 'Remove Duplicates from Sorted Array',
    folder: '01-arrays-and-hashing',
    fileName: '0026-remove-duplicates-from-sorted-array.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 26. Remove Duplicates from Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int k = 1;
        for (int i = 1; i < nums.size(); ++i) {
            if (nums[i] != nums[i - 1]) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
};
`
  },
  {
    id: 27,
    title: 'Remove Element',
    folder: '01-arrays-and-hashing',
    fileName: '0027-remove-element.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 27. Remove Element
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/remove-element/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
        int k = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] != val) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
};
`
  },
  {
    id: 88,
    title: 'Merge Sorted Array',
    folder: '01-arrays-and-hashing',
    fileName: '0088-merge-sorted-array.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(m + n)',
    space: 'O(1)',
    code: `/**
 * Problem: 88. Merge Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/merge-sorted-array/
 *
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int p1 = m - 1, p2 = n - 1, p = m + n - 1;
        while (p1 >= 0 && p2 >= 0) {
            if (nums1[p1] > nums2[p2]) {
                nums1[p--] = nums1[p1--];
            } else {
                nums1[p--] = nums2[p2--];
            }
        }
        while (p2 >= 0) {
            nums1[p--] = nums2[p2--];
        }
    }
};
`
  },
  {
    id: 169,
    title: 'Majority Element',
    folder: '01-arrays-and-hashing',
    fileName: '0169-majority-element.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 169. Majority Element
 * Difficulty: Easy
 * Topic: Arrays & Hashing (Boyer-Moore Voting Algorithm)
 * LeetCode Link: https://leetcode.com/problems/majority-element/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidate = nums[0], count = 0;
        for (int num : nums) {
            if (count == 0) candidate = num;
            count += (num == candidate) ? 1 : -1;
        }
        return candidate;
    }
};
`
  },
  {
    id: 189,
    title: 'Rotate Array',
    folder: '01-arrays-and-hashing',
    fileName: '0189-rotate-array.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 189. Rotate Array
 * Difficulty: Medium
 * Topic: Arrays & Hashing / In-Place Reversal
 * LeetCode Link: https://leetcode.com/problems/rotate-array/
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
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
`
  },
  {
    id: 14,
    title: 'Longest Common Prefix',
    folder: '01-arrays-and-hashing',
    fileName: '0014-longest-common-prefix.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(S)',
    space: 'O(1)',
    code: `/**
 * Problem: 14. Longest Common Prefix
 * Difficulty: Easy
 * Topic: Arrays & Hashing / String
 * LeetCode Link: https://leetcode.com/problems/longest-common-prefix/
 *
 * Complexity:
 * - Time: O(S) where S is the sum of all characters in all strings
 * - Space: O(1)
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        if (strs.empty()) return "";
        for (int i = 0; i < strs[0].size(); ++i) {
            char c = strs[0][i];
            for (int j = 1; j < strs.size(); ++j) {
                if (i >= strs[j].size() || strs[j][i] != c) {
                    return strs[0].substr(0, i);
                }
            }
        }
        return strs[0];
    }
};
`
  },
  {
    id: 58,
    title: 'Length of Last Word',
    folder: '01-arrays-and-hashing',
    fileName: '0058-length-of-last-word.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 58. Length of Last Word
 * Difficulty: Easy
 * Topic: Arrays & Hashing / String
 * LeetCode Link: https://leetcode.com/problems/length-of-last-word/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int lengthOfLastWord(string s) {
        int i = s.size() - 1;
        while (i >= 0 && s[i] == ' ') i--;
        int len = 0;
        while (i >= 0 && s[i] != ' ') {
            len++;
            i--;
        }
        return len;
    }
};
`
  },
  {
    id: 383,
    title: 'Ransom Note',
    folder: '01-arrays-and-hashing',
    fileName: '0383-ransom-note.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(m + n)',
    space: 'O(1)',
    code: `/**
 * Problem: 383. Ransom Note
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Table
 * LeetCode Link: https://leetcode.com/problems/ransom-note/
 *
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(1) constant alphabet space
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool canConstruct(string ransomNote, string magazine) {
        vector<int> count(26, 0);
        for (char c : magazine) count[c - 'a']++;
        for (char c : ransomNote) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
};
`
  },
  {
    id: 205,
    title: 'Isomorphic Strings',
    folder: '01-arrays-and-hashing',
    fileName: '0205-isomorphic-strings.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 205. Isomorphic Strings
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/isomorphic-strings/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    bool isIsomorphic(string s, string t) {
        if (s.size() != t.size()) return false;
        vector<int> m1(256, 0), m2(256, 0);
        for (int i = 0; i < s.size(); ++i) {
            if (m1[(unsigned char)s[i]] != m2[(unsigned char)t[i]]) return false;
            m1[(unsigned char)s[i]] = i + 1;
            m2[(unsigned char)t[i]] = i + 1;
        }
        return true;
    }
};
`
  },
  {
    id: 290,
    title: 'Word Pattern',
    folder: '01-arrays-and-hashing',
    fileName: '0290-word-pattern.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n + m)',
    space: 'O(w)',
    code: `/**
 * Problem: 290. Word Pattern
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/word-pattern/
 *
 * Complexity:
 * - Time: O(n + m)
 * - Space: O(w) where w is number of unique words
 */

#include <string>
#include <sstream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool wordPattern(string pattern, string s) {
        stringstream ss(s);
        string word;
        vector<string> words;
        while (ss >> word) words.push_back(word);
        
        if (pattern.size() != words.size()) return false;
        unordered_map<char, string> p2w;
        unordered_map<string, char> w2p;
        
        for (int i = 0; i < pattern.size(); ++i) {
            char c = pattern[i];
            const string& w = words[i];
            if (p2w.count(c) && p2w[c] != w) return false;
            if (w2p.count(w) && w2p[w] != c) return false;
            p2w[c] = w;
            w2p[w] = c;
        }
        return true;
    }
};
`
  },
  {
    id: 219,
    title: 'Contains Duplicate II',
    folder: '01-arrays-and-hashing',
    fileName: '0219-contains-duplicate-ii.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(min(n, k))',
    code: `/**
 * Problem: 219. Contains Duplicate II
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Hash Map
 * LeetCode Link: https://leetcode.com/problems/contains-duplicate-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(min(n, k))
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    bool containsNearbyDuplicate(vector<int>& nums, int k) {
        unordered_map<int, int> pos;
        for (int i = 0; i < nums.size(); ++i) {
            if (pos.count(nums[i]) && i - pos[nums[i]] <= k) {
                return true;
            }
            pos[nums[i]] = i;
        }
        return false;
    }
};
`
  },
  {
    id: 387,
    title: 'First Unique Character in a String',
    folder: '01-arrays-and-hashing',
    fileName: '0387-first-unique-character-in-a-string.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 387. First Unique Character in a String
 * Difficulty: Easy
 * Topic: Arrays & Hashing
 * LeetCode Link: https://leetcode.com/problems/first-unique-character-in-a-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    int firstUniqChar(string s) {
        vector<int> freq(26, 0);
        for (char c : s) freq[c - 'a']++;
        for (int i = 0; i < s.size(); ++i) {
            if (freq[s[i] - 'a'] == 1) return i;
        }
        return -1;
    }
};
`
  },
  {
    id: 448,
    title: 'Find All Numbers Disappeared in an Array',
    folder: '01-arrays-and-hashing',
    fileName: '0448-find-all-numbers-disappeared-in-an-array.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 448. Find All Numbers Disappeared in an Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing (In-place Sign Inversion)
 * LeetCode Link: https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) extra space
 */

#include <vector>
#include <cmath>

using namespace std;

class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        for (int i = 0; i < nums.size(); ++i) {
            int idx = abs(nums[i]) - 1;
            if (nums[idx] > 0) nums[idx] = -nums[idx];
        }
        vector<int> res;
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] > 0) res.push_back(i + 1);
        }
        return res;
    }
};
`
  },
  {
    id: 283,
    title: 'Move Zeroes',
    folder: '01-arrays-and-hashing',
    fileName: '0283-move-zeroes.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 283. Move Zeroes
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/move-zeroes/
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
    void moveZeroes(vector<int>& nums) {
        int nonZero = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (nums[i] != 0) {
                swap(nums[nonZero++], nums[i]);
            }
        }
    }
};
`
  },
  {
    id: 977,
    title: 'Squares of a Sorted Array',
    folder: '01-arrays-and-hashing',
    fileName: '0977-squares-of-a-sorted-array.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 977. Squares of a Sorted Array
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/squares-of-a-sorted-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) extra space excluding output
 */

#include <vector>
#include <cmath>

using namespace std;

class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n);
        int l = 0, r = n - 1, idx = n - 1;
        while (l <= r) {
            int leftSq = nums[l] * nums[l];
            int rightSq = nums[r] * nums[r];
            if (leftSq > rightSq) {
                res[idx--] = leftSq;
                l++;
            } else {
                res[idx--] = rightSq;
                r--;
            }
        }
        return res;
    }
};
`
  },
  {
    id: 724,
    title: 'Find Pivot Index',
    folder: '01-arrays-and-hashing',
    fileName: '0724-find-pivot-index.cpp',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 724. Find Pivot Index
 * Difficulty: Easy
 * Topic: Arrays & Hashing / Prefix Sum
 * LeetCode Link: https://leetcode.com/problems/find-pivot-index/
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
    int pivotIndex(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        int leftSum = 0;
        for (int i = 0; i < nums.size(); ++i) {
            if (leftSum == total - leftSum - nums[i]) return i;
            leftSum += nums[i];
        }
        return -1;
    }
};
`
  },
  {
    id: 560,
    title: 'Subarray Sum Equals K',
    folder: '01-arrays-and-hashing',
    fileName: '0560-subarray-sum-equals-k.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 560. Subarray Sum Equals K
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Prefix Sum Hash Map
 * LeetCode Link: https://leetcode.com/problems/subarray-sum-equals-k/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixCounts;
        prefixCounts[0] = 1;
        int sum = 0, count = 0;
        for (int num : nums) {
            sum += num;
            if (prefixCounts.count(sum - k)) {
                count += prefixCounts[sum - k];
            }
            prefixCounts[sum]++;
        }
        return count;
    }
};
`
  },
  {
    id: 525,
    title: 'Contiguous Array',
    folder: '01-arrays-and-hashing',
    fileName: '0525-contiguous-array.cpp',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 525. Contiguous Array
 * Difficulty: Medium
 * Topic: Arrays & Hashing / Prefix Sum
 * LeetCode Link: https://leetcode.com/problems/contiguous-array/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findMaxLength(vector<int>& nums) {
        unordered_map<int, int> mp;
        mp[0] = -1;
        int sum = 0, maxLen = 0;
        for (int i = 0; i < nums.size(); ++i) {
            sum += (nums[i] == 1 ? 1 : -1);
            if (mp.count(sum)) {
                maxLen = max(maxLen, i - mp[sum]);
            } else {
                mp[sum] = i;
            }
        }
        return maxLen;
    }
};
`
  },

  // 2. Two Pointers
  {
    id: 28,
    title: 'Find the Index of the First Occurrence in a String',
    folder: '02-two-pointers',
    fileName: '0028-find-the-index-of-the-first-occurrence-in-a-string.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n * m)',
    space: 'O(1)',
    code: `/**
 * Problem: 28. Find the Index of the First Occurrence in a String
 * Difficulty: Easy
 * Topic: Two Pointers / String Matching
 * LeetCode Link: https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/
 *
 * Complexity:
 * - Time: O((N - M + 1) * M)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size(), m = needle.size();
        if (m == 0) return 0;
        for (int i = 0; i <= n - m; ++i) {
            int j = 0;
            while (j < m && haystack[i + j] == needle[j]) ++j;
            if (j == m) return i;
        }
        return -1;
    }
};
`
  },
  {
    id: 344,
    title: 'Reverse String',
    folder: '02-two-pointers',
    fileName: '0344-reverse-string.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 344. Reverse String
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/reverse-string/
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
    void reverseString(vector<char>& s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            swap(s[l++], s[r--]);
        }
    }
};
`
  },
  {
    id: 345,
    title: 'Reverse Vowels of a String',
    folder: '02-two-pointers',
    fileName: '0345-reverse-vowels-of-a-string.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 345. Reverse Vowels of a String
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/reverse-vowels-of-a-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <unordered_set>
#include <algorithm>

using namespace std;

class Solution {
public:
    string reverseVowels(string s) {
        unordered_set<char> vowels = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'};
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !vowels.count(s[l])) l++;
            while (l < r && !vowels.count(s[r])) r--;
            if (l < r) {
                swap(s[l++], s[r--]);
            }
        }
        return s;
    }
};
`
  },
  {
    id: 680,
    title: 'Valid Palindrome II',
    folder: '02-two-pointers',
    fileName: '0680-valid-palindrome-ii.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 680. Valid Palindrome II
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/valid-palindrome-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
private:
    bool isPal(const string& s, int l, int r) {
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    }

public:
    bool validPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            if (s[l] != s[r]) {
                return isPal(s, l + 1, r) || isPal(s, l, r - 1);
            }
            l++;
            r--;
        }
        return true;
    }
};
`
  },
  {
    id: 392,
    title: 'Is Subsequence',
    folder: '02-two-pointers',
    fileName: '0392-is-subsequence.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(t)',
    space: 'O(1)',
    code: `/**
 * Problem: 392. Is Subsequence
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/is-subsequence/
 *
 * Complexity:
 * - Time: O(t) where t is length of target string
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    bool isSubsequence(string s, string t) {
        int i = 0, j = 0;
        while (i < s.size() && j < t.size()) {
            if (s[i] == t[j]) ++i;
            ++j;
        }
        return i == s.size();
    }
};
`
  },
  {
    id: 844,
    title: 'Backspace String Compare',
    folder: '02-two-pointers',
    fileName: '0844-backspace-string-compare.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n + m)',
    space: 'O(1)',
    code: `/**
 * Problem: 844. Backspace String Compare
 * Difficulty: Easy
 * Topic: Two Pointers (Reverse Traversal)
 * LeetCode Link: https://leetcode.com/problems/backspace-string-compare/
 *
 * Complexity:
 * - Time: O(n + m)
 * - Space: O(1)
 */

#include <string>

using namespace std;

class Solution {
public:
    bool backspaceCompare(string s, string t) {
        int i = s.size() - 1, j = t.size() - 1;
        int skipS = 0, skipT = 0;
        while (i >= 0 || j >= 0) {
            while (i >= 0) {
                if (s[i] == '#') { skipS++; i--; }
                else if (skipS > 0) { skipS--; i--; }
                else break;
            }
            while (j >= 0) {
                if (t[j] == '#') { skipT++; j--; }
                else if (skipT > 0) { skipT--; j--; }
                else break;
            }
            if (i >= 0 && j >= 0 && s[i] != t[j]) return false;
            if ((i >= 0) != (j >= 0)) return false;
            i--; j--;
        }
        return true;
    }
};
`
  },
  {
    id: 905,
    title: 'Sort Array By Parity',
    folder: '02-two-pointers',
    fileName: '0905-sort-array-by-parity.cpp',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 905. Sort Array By Parity
 * Difficulty: Easy
 * Topic: Two Pointers
 * LeetCode Link: https://leetcode.com/problems/sort-array-by-parity/
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
    vector<int> sortArrayByParity(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            if (nums[l] % 2 > nums[r] % 2) {
                swap(nums[l], nums[r]);
            }
            if (nums[l] % 2 == 0) l++;
            if (nums[r] % 2 == 1) r--;
        }
        return nums;
    }
};
`
  },

  // 3. Sliding Window
  {
    id: 209,
    title: 'Minimum Size Subarray Sum',
    folder: '03-sliding-window',
    fileName: '0209-minimum-size-subarray-sum.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 209. Minimum Size Subarray Sum
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/minimum-size-subarray-sum/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int l = 0, sum = 0, minLen = INT_MAX;
        for (int r = 0; r < nums.size(); ++r) {
            sum += nums[r];
            while (sum >= target) {
                minLen = min(minLen, r - l + 1);
                sum -= nums[l++];
            }
        }
        return minLen == INT_MAX ? 0 : minLen;
    }
};
`
  },
  {
    id: 643,
    title: 'Maximum Average Subarray I',
    folder: '03-sliding-window',
    fileName: '0643-maximum-average-subarray-i.cpp',
    difficulty: 'Easy',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 643. Maximum Average Subarray I
 * Difficulty: Easy
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/maximum-average-subarray-i/
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
    double findMaxAverage(vector<int>& nums, int k) {
        double sum = 0;
        for (int i = 0; i < k; ++i) sum += nums[i];
        double maxSum = sum;
        for (int i = k; i < nums.size(); ++i) {
            sum += nums[i] - nums[i - k];
            maxSum = max(maxSum, sum);
        }
        return maxSum / k;
    }
};
`
  },
  {
    id: 1004,
    title: 'Max Consecutive Ones III',
    folder: '03-sliding-window',
    fileName: '1004-max-consecutive-ones-iii.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 1004. Max Consecutive Ones III
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/max-consecutive-ones-iii/
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
    int longestOnes(vector<int>& nums, int k) {
        int l = 0, zeros = 0, maxLen = 0;
        for (int r = 0; r < nums.size(); ++r) {
            if (nums[r] == 0) zeros++;
            while (zeros > k) {
                if (nums[l++] == 0) zeros--;
            }
            maxLen = max(maxLen, r - l + 1);
        }
        return maxLen;
    }
};
`
  },
  {
    id: 1456,
    title: 'Maximum Number of Vowels in a Substring of Given Length',
    folder: '03-sliding-window',
    fileName: '1456-maximum-number-of-vowels-in-a-substring-of-given-length.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 1456. Maximum Number of Vowels in a Substring of Given Length
 * Difficulty: Medium
 * Topic: Sliding Window
 * LeetCode Link: https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <string>
#include <algorithm>

using namespace std;

class Solution {
private:
    bool isVowel(char c) {
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }

public:
    int maxVowels(string s, int k) {
        int count = 0;
        for (int i = 0; i < k; ++i) {
            if (isVowel(s[i])) count++;
        }
        int maxCount = count;
        for (int i = k; i < s.size(); ++i) {
            if (isVowel(s[i])) count++;
            if (isVowel(s[i - k])) count--;
            maxCount = max(maxCount, count);
        }
        return maxCount;
    }
};
`
  },
  {
    id: 438,
    title: 'Find All Anagrams in a String',
    folder: '03-sliding-window',
    fileName: '0438-find-all-anagrams-in-a-string.cpp',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 438. Find All Anagrams in a String
 * Difficulty: Medium
 * Topic: Sliding Window / Frequency Array
 * LeetCode Link: https://leetcode.com/problems/find-all-anagrams-in-a-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1) fixed 26 alphabet size
 */

#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> res;
        if (s.size() < p.size()) return res;
        vector<int> pCount(26, 0), sCount(26, 0);
        for (char c : p) pCount[c - 'a']++;
        
        int k = p.size();
        for (int i = 0; i < k; ++i) sCount[s[i] - 'a']++;
        if (sCount == pCount) res.push_back(0);
        
        for (int i = k; i < s.size(); ++i) {
            sCount[s[i] - 'a']++;
            sCount[s[i - k] - 'a']--;
            if (sCount == pCount) res.push_back(i - k + 1);
        }
        return res;
    }
};
`
  },

  // 4. Stack
  {
    id: 71,
    title: 'Simplify Path',
    folder: '04-stack',
    fileName: '0071-simplify-path.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 71. Simplify Path
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/simplify-path/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>
#include <vector>
#include <sstream>

using namespace std;

class Solution {
public:
    string simplifyPath(string path) {
        vector<string> st;
        stringstream ss(path);
        string part;
        while (getline(ss, part, '/')) {
            if (part == "" || part == ".") continue;
            if (part == "..") {
                if (!st.empty()) st.pop_back();
            } else {
                st.push_back(part);
            }
        }
        string res = "";
        for (const string& dir : st) {
            res += "/" + dir;
        }
        return res.empty() ? "/" : res;
    }
};
`
  },
  {
    id: 1047,
    title: 'Remove All Adjacent Duplicates In String',
    folder: '04-stack',
    fileName: '1047-remove-all-adjacent-duplicates-in-string.cpp',
    difficulty: 'Easy',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 1047. Remove All Adjacent Duplicates In String
 * Difficulty: Easy
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <string>

using namespace std;

class Solution {
public:
    string removeDuplicates(string s) {
        string res = "";
        for (char c : s) {
            if (!res.empty() && res.back() == c) {
                res.pop_back();
            } else {
                res.push_back(c);
            }
        }
        return res;
    }
};
`
  },
  {
    id: 394,
    title: 'Decode String',
    folder: '04-stack',
    fileName: '0394-decode-string.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(maxK * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 394. Decode String
 * Difficulty: Medium
 * Topic: Stack
 * LeetCode Link: https://leetcode.com/problems/decode-string/
 *
 * Complexity:
 * - Time: O(maxK * n)
 * - Space: O(n)
 */

#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    string decodeString(string s) {
        stack<string> strSt;
        stack<int> numSt;
        string currStr = "";
        int num = 0;
        
        for (char c : s) {
            if (isdigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '[') {
                numSt.push(num);
                strSt.push(currStr);
                num = 0;
                currStr = "";
            } else if (c == ']') {
                int repeat = numSt.top(); numSt.pop();
                string prevStr = strSt.top(); strSt.pop();
                string expanded = "";
                for (int i = 0; i < repeat; ++i) expanded += currStr;
                currStr = prevStr + expanded;
            } else {
                currStr += c;
            }
        }
        return currStr;
    }
};
`
  },
  {
    id: 946,
    title: 'Validate Stack Sequences',
    folder: '04-stack',
    fileName: '0946-validate-stack-sequences.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(n)',
    space: 'O(n)',
    code: `/**
 * Problem: 946. Validate Stack Sequences
 * Difficulty: Medium
 * Topic: Stack Simulation
 * LeetCode Link: https://leetcode.com/problems/validate-stack-sequences/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(n)
 */

#include <vector>
#include <stack>

using namespace std;

class Solution {
public:
    bool validateStackSequences(vector<int>& pushed, vector<int>& popped) {
        stack<int> st;
        int j = 0;
        for (int x : pushed) {
            st.push(x);
            while (!st.empty() && j < popped.size() && st.top() == popped[j]) {
                st.pop();
                j++;
            }
        }
        return st.empty();
    }
};
`
  },
  {
    id: 853,
    title: 'Car Fleet',
    folder: '04-stack',
    fileName: '0853-car-fleet.cpp',
    difficulty: 'Medium',
    topic: 'Stack',
    time: 'O(n log n)',
    space: 'O(n)',
    code: `/**
 * Problem: 853. Car Fleet
 * Difficulty: Medium
 * Topic: Stack / Monotonic Stack
 * LeetCode Link: https://leetcode.com/problems/car-fleet/
 *
 * Complexity:
 * - Time: O(n log n)
 * - Space: O(n)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<pair<int, double>> cars(n);
        for (int i = 0; i < n; ++i) {
            cars[i] = {position[i], (double)(target - position[i]) / speed[i]};
        }
        sort(cars.begin(), cars.end(), [](const auto& a, const auto& b) {
            return a.first > b.first;
        });
        
        int fleets = 0;
        double maxTime = 0.0;
        for (const auto& car : cars) {
            if (car.second > maxTime) {
                fleets++;
                maxTime = car.second;
            }
        }
        return fleets;
    }
};
`
  },

  // 5. Binary Search
  {
    id: 35,
    title: 'Search Insert Position',
    folder: '05-binary-search',
    fileName: '0035-search-insert-position.cpp',
    difficulty: 'Easy',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 35. Search Insert Position
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/search-insert-position/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return l;
    }
};
`
  },
  {
    id: 34,
    title: 'Find First and Last Position of Element in Sorted Array',
    folder: '05-binary-search',
    fileName: '0034-find-first-and-last-position-of-element-in-sorted-array.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 34. Find First and Last Position of Element in Sorted Array
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
private:
    int findBound(const vector<int>& nums, int target, bool isFirst) {
        int l = 0, r = nums.size() - 1, ans = -1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) {
                ans = mid;
                if (isFirst) r = mid - 1;
                else l = mid + 1;
            } else if (nums[mid] < target) {
                l = mid + 1;
            } else {
                r = mid - 1;
            }
        }
        return ans;
    }

public:
    vector<int> searchRange(vector<int>& nums, int target) {
        return {findBound(nums, target, true), findBound(nums, target, false)};
    }
};
`
  },
  {
    id: 69,
    title: 'Sqrt(x)',
    folder: '05-binary-search',
    fileName: '0069-sqrtx.cpp',
    difficulty: 'Easy',
    topic: 'Binary Search',
    time: 'O(log x)',
    space: 'O(1)',
    code: `/**
 * Problem: 69. Sqrt(x)
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/sqrtx/
 *
 * Complexity:
 * - Time: O(log x)
 * - Space: O(1)
 */

class Solution {
public:
    int mySqrt(int x) {
        if (x < 2) return x;
        int l = 1, r = x / 2, ans = 1;
        while (l <= r) {
            long long mid = l + (r - l) / 2;
            if (mid * mid <= x) {
                ans = mid;
                l = mid + 1;
            } else {
                r = mid - 1;
            }
        }
        return ans;
    }
};
`
  },
  {
    id: 162,
    title: 'Find Peak Element',
    folder: '05-binary-search',
    fileName: '0162-find-peak-element.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 162. Find Peak Element
 * Difficulty: Medium
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/find-peak-element/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[mid + 1]) {
                r = mid;
            } else {
                l = mid + 1;
            }
        }
        return l;
    }
};
`
  },
  {
    id: 278,
    title: 'First Bad Version',
    folder: '05-binary-search',
    fileName: '0278-first-bad-version.cpp',
    difficulty: 'Easy',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 278. First Bad Version
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/first-bad-version/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

bool isBadVersion(int version);

class Solution {
public:
    int firstBadVersion(int n) {
        int l = 1, r = n, ans = n;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (isBadVersion(mid)) {
                ans = mid;
                r = mid - 1;
            } else {
                l = mid + 1;
            }
        }
        return ans;
    }
};
`
  },
  {
    id: 367,
    title: 'Valid Perfect Square',
    folder: '05-binary-search',
    fileName: '0367-valid-perfect-square.cpp',
    difficulty: 'Easy',
    topic: 'Binary Search',
    time: 'O(log num)',
    space: 'O(1)',
    code: `/**
 * Problem: 367. Valid Perfect Square
 * Difficulty: Easy
 * Topic: Binary Search
 * LeetCode Link: https://leetcode.com/problems/valid-perfect-square/
 *
 * Complexity:
 * - Time: O(log num)
 * - Space: O(1)
 */

class Solution {
public:
    bool isPerfectSquare(int num) {
        if (num < 1) return false;
        long long l = 1, r = num;
        while (l <= r) {
            long long mid = l + (r - l) / 2;
            long long sq = mid * mid;
            if (sq == num) return true;
            else if (sq < num) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
};
`
  },
  {
    id: 540,
    title: 'Single Element in a Sorted Array',
    folder: '05-binary-search',
    fileName: '0540-single-element-in-a-sorted-array.cpp',
    difficulty: 'Medium',
    topic: 'Binary Search',
    time: 'O(log n)',
    space: 'O(1)',
    code: `/**
 * Problem: 540. Single Element in a Sorted Array
 * Difficulty: Medium
 * Topic: Binary Search (Even-Odd Index Invariant)
 * LeetCode Link: https://leetcode.com/problems/single-element-in-a-sorted-array/
 *
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int singleNonDuplicate(vector<int>& nums) {
        int l = 0, r = nums.size() - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (mid % 2 == 1) mid--;
            if (nums[mid] == nums[mid + 1]) {
                l = mid + 2;
            } else {
                r = mid;
            }
        }
        return nums[l];
    }
};
`
  },

  // 6. Linked List
  {
    id: 83,
    title: 'Remove Duplicates from Sorted List',
    folder: '06-linked-list',
    fileName: '0083-remove-duplicates-from-sorted-list.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 83. Remove Duplicates from Sorted List
 * Difficulty: Easy
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/remove-duplicates-from-sorted-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        ListNode* curr = head;
        while (curr && curr->next) {
            if (curr->val == curr->next->val) {
                curr->next = curr->next->next;
            } else {
                curr = curr->next;
            }
        }
        return head;
    }
};
`
  },
  {
    id: 92,
    title: 'Reverse Linked List II',
    folder: '06-linked-list',
    fileName: '0092-reverse-linked-list-ii.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 92. Reverse Linked List II
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/reverse-linked-list-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        if (!head || left == right) return head;
        ListNode dummy(0);
        dummy.next = head;
        ListNode* prev = &dummy;
        for (int i = 0; i < left - 1; ++i) prev = prev->next;
        
        ListNode* curr = prev->next;
        for (int i = 0; i < right - left; ++i) {
            ListNode* temp = curr->next;
            curr->next = temp->next;
            temp->next = prev->next;
            prev->next = temp;
        }
        return dummy.next;
    }
};
`
  },
  {
    id: 61,
    title: 'Rotate List',
    folder: '06-linked-list',
    fileName: '0061-rotate-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 61. Rotate List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/rotate-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k) {
        if (!head || !head->next || k == 0) return head;
        int len = 1;
        ListNode* tail = head;
        while (tail->next) {
            tail = tail->next;
            len++;
        }
        tail->next = head;
        k %= len;
        int stepsToNewTail = len - k;
        ListNode* newTail = tail;
        while (stepsToNewTail--) newTail = newTail->next;
        ListNode* newHead = newTail->next;
        newTail->next = nullptr;
        return newHead;
    }
};
`
  },
  {
    id: 86,
    title: 'Partition List',
    folder: '06-linked-list',
    fileName: '0086-partition-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 86. Partition List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/partition-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* partition(ListNode* head, int x) {
        ListNode lessDummy(0), greaterDummy(0);
        ListNode *less = &lessDummy, *greater = &greaterDummy;
        while (head) {
            if (head->val < x) {
                less->next = head;
                less = less->next;
            } else {
                greater->next = head;
                greater = greater->next;
            }
            head = head->next;
        }
        greater->next = nullptr;
        less->next = greaterDummy.next;
        return lessDummy.next;
    }
};
`
  },
  {
    id: 160,
    title: 'Intersection of Two Linked Lists',
    folder: '06-linked-list',
    fileName: '0160-intersection-of-two-linked-lists.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(m + n)',
    space: 'O(1)',
    code: `/**
 * Problem: 160. Intersection of Two Linked Lists
 * Difficulty: Easy
 * Topic: Linked List / Two Pointers
 * LeetCode Link: https://leetcode.com/problems/intersection-of-two-linked-lists/
 *
 * Complexity:
 * - Time: O(m + n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        ListNode *pA = headA, *pB = headB;
        while (pA != pB) {
            pA = pA ? pA->next : headB;
            pB = pB ? pB->next : headA;
        }
        return pA;
    }
};
`
  },
  {
    id: 234,
    title: 'Palindrome Linked List',
    folder: '06-linked-list',
    fileName: '0234-palindrome-linked-list.cpp',
    difficulty: 'Easy',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 234. Palindrome Linked List
 * Difficulty: Easy
 * Topic: Linked List / Fast and Slow Pointers
 * LeetCode Link: https://leetcode.com/problems/palindrome-linked-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    bool isPalindrome(ListNode* head) {
        if (!head || !head->next) return true;
        ListNode *slow = head, *fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode *prev = nullptr, *curr = slow->next;
        while (curr) {
            ListNode* nxt = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nxt;
        }
        ListNode *p1 = head, *p2 = prev;
        while (p2) {
            if (p1->val != p2->val) return false;
            p1 = p1->next;
            p2 = p2->next;
        }
        return true;
    }
};
`
  },
  {
    id: 328,
    title: 'Odd Even Linked List',
    folder: '06-linked-list',
    fileName: '0328-odd-even-linked-list.cpp',
    difficulty: 'Medium',
    topic: 'Linked List',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 328. Odd Even Linked List
 * Difficulty: Medium
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/odd-even-linked-list/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* oddEvenList(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode *odd = head, *even = head->next, *evenHead = even;
        while (even && even->next) {
            odd->next = even->next;
            odd = odd->next;
            even->next = odd->next;
            even = even->next;
        }
        odd->next = evenHead;
        return head;
    }
};
`
  },

  // 7. Trees & Tries
  {
    id: 94,
    title: 'Binary Tree Inorder Traversal',
    folder: '07-trees-and-tries',
    fileName: '0094-binary-tree-inorder-traversal.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 94. Binary Tree Inorder Traversal
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/binary-tree-inorder-traversal/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h) where h is height of tree
 */

#include <vector>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    void inorder(TreeNode* root, vector<int>& res) {
        if (!root) return;
        inorder(root->left, res);
        res.push_back(root->val);
        inorder(root->right, res);
    }

public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res;
        inorder(root, res);
        return res;
    }
};
`
  },
  {
    id: 101,
    title: 'Symmetric Tree',
    folder: '07-trees-and-tries',
    fileName: '0101-symmetric-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 101. Symmetric Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/symmetric-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    bool isMirror(TreeNode* t1, TreeNode* t2) {
        if (!t1 && !t2) return true;
        if (!t1 || !t2) return false;
        return (t1->val == t2->val) && isMirror(t1->left, t2->right) && isMirror(t1->right, t2->left);
    }

public:
    bool isSymmetric(TreeNode* root) {
        return isMirror(root, root);
    }
};
`
  },
  {
    id: 108,
    title: 'Convert Sorted Array to Binary Search Tree',
    folder: '07-trees-and-tries',
    fileName: '0108-convert-sorted-array-to-binary-search-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(log n)',
    code: `/**
 * Problem: 108. Convert Sorted Array to Binary Search Tree
 * Difficulty: Easy
 * Topic: Trees & Tries / Divide and Conquer
 * LeetCode Link: https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(log n) call stack
 */

#include <vector>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    TreeNode* build(const vector<int>& nums, int l, int r) {
        if (l > r) return nullptr;
        int mid = l + (r - l) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = build(nums, l, mid - 1);
        root->right = build(nums, mid + 1, r);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
`
  },
  {
    id: 111,
    title: 'Minimum Depth of Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0111-minimum-depth-of-binary-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 111. Minimum Depth of Binary Tree
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/minimum-depth-of-binary-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <algorithm>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int minDepth(TreeNode* root) {
        if (!root) return 0;
        if (!root->left) return 1 + minDepth(root->right);
        if (!root->right) return 1 + minDepth(root->left);
        return 1 + min(minDepth(root->left), minDepth(root->right));
    }
};
`
  },
  {
    id: 112,
    title: 'Path Sum',
    folder: '07-trees-and-tries',
    fileName: '0112-path-sum.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 112. Path Sum
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/path-sum/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root) return false;
        if (!root->left && !root->right) return root->val == targetSum;
        return hasPathSum(root->left, targetSum - root->val) || hasPathSum(root->right, targetSum - root->val);
    }
};
`
  },
  {
    id: 129,
    title: 'Sum Root to Leaf Numbers',
    folder: '07-trees-and-tries',
    fileName: '0129-sum-root-to-leaf-numbers.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 129. Sum Root to Leaf Numbers
 * Difficulty: Medium
 * Topic: Trees & Tries / DFS
 * LeetCode Link: https://leetcode.com/problems/sum-root-to-leaf-numbers/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    int dfs(TreeNode* node, int currentSum) {
        if (!node) return 0;
        currentSum = currentSum * 10 + node->val;
        if (!node->left && !node->right) return currentSum;
        return dfs(node->left, currentSum) + dfs(node->right, currentSum);
    }

public:
    int sumNumbers(TreeNode* root) {
        return dfs(root, 0);
    }
};
`
  },
  {
    id: 222,
    title: 'Count Complete Tree Nodes',
    folder: '07-trees-and-tries',
    fileName: '0222-count-complete-tree-nodes.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O((log n)^2)',
    space: 'O(log n)',
    code: `/**
 * Problem: 222. Count Complete Tree Nodes
 * Difficulty: Easy
 * Topic: Trees & Tries / Binary Search on Tree
 * LeetCode Link: https://leetcode.com/problems/count-complete-tree-nodes/
 *
 * Complexity:
 * - Time: O((log n)^2)
 * - Space: O(log n)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int countNodes(TreeNode* root) {
        if (!root) return 0;
        int leftH = 0, rightH = 0;
        TreeNode* l = root;
        while (l) { leftH++; l = l->left; }
        TreeNode* r = root;
        while (r) { rightH++; r = r->right; }
        
        if (leftH == rightH) return (1 << leftH) - 1;
        return 1 + countNodes(root->left) + countNodes(root->right);
    }
};
`
  },
  {
    id: 236,
    title: 'Lowest Common Ancestor of a Binary Tree',
    folder: '07-trees-and-tries',
    fileName: '0236-lowest-common-ancestor-of-a-binary-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 236. Lowest Common Ancestor of a Binary Tree
 * Difficulty: Medium
 * Topic: Trees & Tries / DFS
 * LeetCode Link: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};
`
  },
  {
    id: 257,
    title: 'Binary Tree Paths',
    folder: '07-trees-and-tries',
    fileName: '0257-binary-tree-paths.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 257. Binary Tree Paths
 * Difficulty: Easy
 * Topic: Trees & Tries / DFS
 * LeetCode Link: https://leetcode.com/problems/binary-tree-paths/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

#include <vector>
#include <string>

using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
private:
    void dfs(TreeNode* node, string path, vector<string>& paths) {
        if (!node) return;
        path += to_string(node->val);
        if (!node->left && !node->right) {
            paths.push_back(path);
            return;
        }
        path += "->";
        dfs(node->left, path, paths);
        dfs(node->right, path, paths);
    }

public:
    vector<string> binaryTreePaths(TreeNode* root) {
        vector<string> paths;
        dfs(root, "", paths);
        return paths;
    }
};
`
  },
  {
    id: 404,
    title: 'Sum of Left Leaves',
    folder: '07-trees-and-tries',
    fileName: '0404-sum-of-left-leaves.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(n)',
    space: 'O(h)',
    code: `/**
 * Problem: 404. Sum of Left Leaves
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/sum-of-left-leaves/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    int sumOfLeftLeaves(TreeNode* root) {
        if (!root) return 0;
        int sum = 0;
        if (root->left && !root->left->left && !root->left->right) {
            sum += root->left->val;
        }
        return sum + sumOfLeftLeaves(root->left) + sumOfLeftLeaves(root->right);
    }
};
`
  },
  {
    id: 617,
    title: 'Merge Two Binary Trees',
    folder: '07-trees-and-tries',
    fileName: '0617-merge-two-binary-trees.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(m)',
    space: 'O(h)',
    code: `/**
 * Problem: 617. Merge Two Binary Trees
 * Difficulty: Easy
 * Topic: Trees & Tries
 * LeetCode Link: https://leetcode.com/problems/merge-two-binary-trees/
 *
 * Complexity:
 * - Time: O(m) where m is minimum number of nodes in two trees
 * - Space: O(h)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
        if (!root1) return root2;
        if (!root2) return root1;
        root1->val += root2->val;
        root1->left = mergeTrees(root1->left, root2->left);
        root1->right = mergeTrees(root1->right, root2->right);
        return root1;
    }
};
`
  },
  {
    id: 700,
    title: 'Search in a Binary Search Tree',
    folder: '07-trees-and-tries',
    fileName: '0700-search-in-a-binary-search-tree.cpp',
    difficulty: 'Easy',
    topic: 'Trees & Tries',
    time: 'O(h)',
    space: 'O(1)',
    code: `/**
 * Problem: 700. Search in a Binary Search Tree
 * Difficulty: Easy
 * Topic: Trees & Tries / BST
 * LeetCode Link: https://leetcode.com/problems/search-in-a-binary-search-tree/
 *
 * Complexity:
 * - Time: O(h) where h is height of BST
 * - Space: O(1)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        while (root && root->val != val) {
            root = (val < root->val) ? root->left : root->right;
        }
        return root;
    }
};
`
  },
  {
    id: 701,
    title: 'Insert into a Binary Search Tree',
    folder: '07-trees-and-tries',
    fileName: '0701-insert-into-a-binary-search-tree.cpp',
    difficulty: 'Medium',
    topic: 'Trees & Tries',
    time: 'O(h)',
    space: 'O(1)',
    code: `/**
 * Problem: 701. Insert into a Binary Search Tree
 * Difficulty: Medium
 * Topic: Trees & Tries / BST
 * LeetCode Link: https://leetcode.com/problems/insert-into-a-binary-search-tree/
 *
 * Complexity:
 * - Time: O(h)
 * - Space: O(1)
 */

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if (!root) return new TreeNode(val);
        TreeNode* curr = root;
        while (true) {
            if (val < curr->val) {
                if (curr->left) curr = curr->left;
                else { curr->left = new TreeNode(val); break; }
            } else {
                if (curr->right) curr = curr->right;
                else { curr->right = new TreeNode(val); break; }
            }
        }
        return root;
    }
};
`
  },

  // 8. Graphs
  {
    id: 547,
    title: 'Number of Provinces',
    folder: '10-graphs',
    fileName: '0547-number-of-provinces.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(n^2)',
    space: 'O(n)',
    code: `/**
 * Problem: 547. Number of Provinces
 * Difficulty: Medium
 * Topic: Graphs / Disjoint Set Union (DSU) / DFS
 * LeetCode Link: https://leetcode.com/problems/number-of-provinces/
 *
 * Complexity:
 * - Time: O(n^2)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(int node, const vector<vector<int>>& isConnected, vector<bool>& visited) {
        visited[node] = true;
        for (int neighbor = 0; neighbor < isConnected.size(); ++neighbor) {
            if (isConnected[node][neighbor] == 1 && !visited[neighbor]) {
                dfs(neighbor, isConnected, visited);
            }
        }
    }

public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), provinces = 0;
        vector<bool> visited(n, false);
        for (int i = 0; i < n; ++i) {
            if (!visited[i]) {
                provinces++;
                dfs(i, isConnected, visited);
            }
        }
        return provinces;
    }
};
`
  },
  {
    id: 733,
    title: 'Flood Fill',
    folder: '10-graphs',
    fileName: '0733-flood-fill.cpp',
    difficulty: 'Easy',
    topic: 'Graphs',
    time: 'O(m * n)',
    space: 'O(m * n)',
    code: `/**
 * Problem: 733. Flood Fill
 * Difficulty: Easy
 * Topic: Graphs / DFS
 * LeetCode Link: https://leetcode.com/problems/flood-fill/
 *
 * Complexity:
 * - Time: O(m * n)
 * - Space: O(m * n) recursion stack
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(vector<vector<int>>& image, int r, int c, int origColor, int newColor) {
        if (r < 0 || r >= image.size() || c < 0 || c >= image[0].size() || image[r][c] != origColor) return;
        image[r][c] = newColor;
        dfs(image, r + 1, c, origColor, newColor);
        dfs(image, r - 1, c, origColor, newColor);
        dfs(image, r, c + 1, origColor, newColor);
        dfs(image, r, c - 1, origColor, newColor);
    }

public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int origColor = image[sr][sc];
        if (origColor != color) {
            dfs(image, sr, sc, origColor, color);
        }
        return image;
    }
};
`
  },
  {
    id: 797,
    title: 'All Paths From Source to Target',
    folder: '10-graphs',
    fileName: '0797-all-paths-from-source-to-target.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(2^n * n)',
    space: 'O(n)',
    code: `/**
 * Problem: 797. All Paths From Source to Target
 * Difficulty: Medium
 * Topic: Graphs / Backtracking
 * LeetCode Link: https://leetcode.com/problems/all-paths-from-source-to-target/
 *
 * Complexity:
 * - Time: O(2^n * n)
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
private:
    void dfs(int curr, int target, const vector<vector<int>>& graph, vector<int>& path, vector<vector<int>>& res) {
        path.push_back(curr);
        if (curr == target) {
            res.push_back(path);
        } else {
            for (int nextNode : graph[curr]) {
                dfs(nextNode, target, graph, path, res);
            }
        }
        path.pop_back();
    }

public:
    vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
        vector<vector<int>> res;
        vector<int> path;
        dfs(0, graph.size() - 1, graph, path, res);
        return res;
    }
};
`
  },
  {
    id: 841,
    title: 'Keys and Rooms',
    folder: '10-graphs',
    fileName: '0841-keys-and-rooms.cpp',
    difficulty: 'Medium',
    topic: 'Graphs',
    time: 'O(n + e)',
    space: 'O(n)',
    code: `/**
 * Problem: 841. Keys and Rooms
 * Difficulty: Medium
 * Topic: Graphs / BFS
 * LeetCode Link: https://leetcode.com/problems/keys-and-rooms/
 *
 * Complexity:
 * - Time: O(n + e) where e is total keys
 * - Space: O(n)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool canVisitAllRooms(vector<vector<int>>& rooms) {
        int n = rooms.size();
        vector<bool> visited(n, false);
        visited[0] = true;
        queue<int> q;
        q.push(0);
        int count = 1;
        
        while (!q.empty()) {
            int curr = q.front(); q.pop();
            for (int key : rooms[curr]) {
                if (!visited[key]) {
                    visited[key] = true;
                    q.push(key);
                    count++;
                }
            }
        }
        return count == n;
    }
};
`
  },
  {
    id: 997,
    title: 'Find the Town Judge',
    folder: '10-graphs',
    fileName: '0997-find-the-town-judge.cpp',
    difficulty: 'Easy',
    topic: 'Graphs',
    time: 'O(n + t)',
    space: 'O(n)',
    code: `/**
 * Problem: 997. Find the Town Judge
 * Difficulty: Easy
 * Topic: Graphs / Degree Counting
 * LeetCode Link: https://leetcode.com/problems/find-the-town-judge/
 *
 * Complexity:
 * - Time: O(n + t) where t is trust array size
 * - Space: O(n)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int findJudge(int n, vector<vector<int>>& trust) {
        vector<int> balance(n + 1, 0);
        for (const auto& t : trust) {
            balance[t[0]]--;
            balance[t[1]]++;
        }
        for (int i = 1; i <= n; ++i) {
            if (balance[i] == n - 1) return i;
        }
        return -1;
    }
};
`
  },
  {
    id: 1971,
    title: 'Find if Path Exists in Graph',
    folder: '10-graphs',
    fileName: '1971-find-if-path-exists-in-graph.cpp',
    difficulty: 'Easy',
    topic: 'Graphs',
    time: 'O(v + e)',
    space: 'O(v + e)',
    code: `/**
 * Problem: 1971. Find if Path Exists in Graph
 * Difficulty: Easy
 * Topic: Graphs / BFS
 * LeetCode Link: https://leetcode.com/problems/find-if-path-exists-in-graph/
 *
 * Complexity:
 * - Time: O(v + e)
 * - Space: O(v + e)
 */

#include <vector>
#include <queue>

using namespace std;

class Solution {
public:
    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
        if (source == destination) return true;
        vector<vector<int>> adj(n);
        for (const auto& e : edges) {
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        vector<bool> visited(n, false);
        visited[source] = true;
        queue<int> q;
        q.push(source);
        
        while (!q.empty()) {
            int node = q.front(); q.pop();
            if (node == destination) return true;
            for (int nextNode : adj[node]) {
                if (!visited[nextNode]) {
                    visited[nextNode] = true;
                    q.push(nextNode);
                }
            }
        }
        return false;
    }
};
`
  },

  // 9. Dynamic Programming
  {
    id: 746,
    title: 'Min Cost Climbing Stairs',
    folder: '11-dynamic-programming',
    fileName: '0746-min-cost-climbing-stairs.cpp',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 746. Min Cost Climbing Stairs
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/min-cost-climbing-stairs/
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
    int minCostClimbingStairs(vector<int>& cost) {
        int first = cost[0], second = cost[1];
        for (int i = 2; i < cost.size(); ++i) {
            int curr = cost[i] + min(first, second);
            first = second;
            second = curr;
        }
        return min(first, second);
    }
};
`
  },
  {
    id: 509,
    title: 'Fibonacci Number',
    folder: '11-dynamic-programming',
    fileName: '0509-fibonacci-number.cpp',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 509. Fibonacci Number
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/fibonacci-number/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};
`
  },
  {
    id: 1137,
    title: 'N-th Tribonacci Number',
    folder: '11-dynamic-programming',
    fileName: '1137-n-th-tribonacci-number.cpp',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 1137. N-th Tribonacci Number
 * Difficulty: Easy
 * Topic: Dynamic Programming
 * LeetCode Link: https://leetcode.com/problems/n-th-tribonacci-number/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

class Solution {
public:
    int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        int t0 = 0, t1 = 1, t2 = 1;
        for (int i = 3; i <= n; ++i) {
            int t3 = t0 + t1 + t2;
            t0 = t1;
            t1 = t2;
            t2 = t3;
        }
        return t2;
    }
};
`
  },

  // 10. Greedy
  {
    id: 122,
    title: 'Best Time to Buy and Sell Stock II',
    folder: '12-greedy',
    fileName: '0122-best-time-to-buy-and-sell-stock-ii.cpp',
    difficulty: 'Medium',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 122. Best Time to Buy and Sell Stock II
 * Difficulty: Medium
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int profit = 0;
        for (int i = 1; i < prices.size(); ++i) {
            if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1];
            }
        }
        return profit;
    }
};
`
  },
  {
    id: 455,
    title: 'Assign Cookies',
    folder: '12-greedy',
    fileName: '0455-assign-cookies.cpp',
    difficulty: 'Easy',
    topic: 'Greedy',
    time: 'O(n log n + m log m)',
    space: 'O(1)',
    code: `/**
 * Problem: 455. Assign Cookies
 * Difficulty: Easy
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/assign-cookies/
 *
 * Complexity:
 * - Time: O(n log n + m log m)
 * - Space: O(1)
 */

#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());
        int child = 0, cookie = 0;
        while (child < g.size() && cookie < s.size()) {
            if (s[cookie] >= g[child]) {
                child++;
            }
            cookie++;
        }
        return child;
    }
};
`
  },
  {
    id: 860,
    title: 'Lemonade Change',
    folder: '12-greedy',
    fileName: '0860-lemonade-change.cpp',
    difficulty: 'Easy',
    topic: 'Greedy',
    time: 'O(n)',
    space: 'O(1)',
    code: `/**
 * Problem: 860. Lemonade Change
 * Difficulty: Easy
 * Topic: Greedy
 * LeetCode Link: https://leetcode.com/problems/lemonade-change/
 *
 * Complexity:
 * - Time: O(n)
 * - Space: O(1)
 */

#include <vector>

using namespace std;

class Solution {
public:
    bool lemonadeChange(vector<int>& bills) {
        int five = 0, ten = 0;
        for (int bill : bills) {
            if (bill == 5) {
                five++;
            } else if (bill == 10) {
                if (five == 0) return false;
                five--;
                ten++;
            } else {
                if (ten > 0 && five > 0) {
                    ten--;
                    five--;
                } else if (five >= 3) {
                    five -= 3;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
};
`
  }
];

async function main() {
  console.log(`Starting commit & push loop for ${problems.length} problems...`);

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const targetFolder = path.join(solutionsDir, p.folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, p.fileName);
    fs.writeFileSync(filePath, p.code, 'utf8');

    // Run sync to update solutions/README.md
    sync();

    // Stage solutions directory and this script
    execSync('git add solutions/ scripts/commit-to-100.js', { cwd: rootDir });

    const commitMsg = `feat(solutions): add ${p.id}. ${p.title} (${p.difficulty})`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: rootDir });
    execSync('git push origin main', { cwd: rootDir, stdio: 'inherit' });

    console.log(`[${i + 1}/${problems.length}] Committed & pushed: "${commitMsg}"`);
  }

  console.log('\n✅ All 74 problems successfully committed and pushed 1-at-a-time!');
}

main().catch((err) => {
  console.error('Error running commits:', err);
  process.exit(1);
});
