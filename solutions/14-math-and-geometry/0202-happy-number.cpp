/**
 * Problem: 202. Happy Number
 * Difficulty: Easy
 * Topic: Math & Number Theory / Floyd's Cycle Detection
 * LeetCode Link: https://leetcode.com/problems/happy-number/
 * 
 * Complexity:
 * - Time: O(log n)
 * - Space: O(1)
 */

class Solution {
private:
    int getNext(int n) {
        int totalSum = 0;
        while (n > 0) {
            int d = n % 10;
            n = n / 10;
            totalSum += d * d;
        }
        return totalSum;
    }

public:
    bool isHappy(int n) {
        int slow = n;
        int fast = getNext(n);

        while (fast != 1 && slow != fast) {
            slow = getNext(slow);
            fast = getNext(getNext(fast));
        }

        return fast == 1;
    }
};
