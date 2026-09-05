/**
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
