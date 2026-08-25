/**
 * Problem: 141. Linked List Cycle
 * Difficulty: Easy
 * Topic: Linked List
 * LeetCode Link: https://leetcode.com/problems/linked-list-cycle/
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
    bool hasCycle(ListNode *head) {
        if (!head || !head->next) return false;
        ListNode *slow = head;
        ListNode *fast = head;
        
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};
