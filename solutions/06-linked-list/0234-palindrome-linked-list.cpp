/**
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
