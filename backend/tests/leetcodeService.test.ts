import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

import {
  fetchLeetCodeSolvedProblems,
  slugify,
  fetchAllSolvedProblems,
  fetchSessionUsername,
  fetchProblemSubmissions,
  fetchSubmissionDetails,
  fetchActiveDailyCodingChallengeQuestion,
  submitCodeToLeetCode,
  checkSubmissionResult,
  fetchProblemDetails,
} from "../leetcodeService";

describe("backend/leetcodeService.ts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("slugify", () => {
    it("should correctly convert title to URL slug", () => {
      expect(slugify("Two Sum")).toBe("two-sum");
      expect(slugify("  Reverse Linked List II  ")).toBe("reverse-linked-list-ii");
      expect(slugify("Binary Tree Level Order Traversal")).toBe(
        "binary-tree-level-order-traversal"
      );
      expect(slugify("Special-Characters & Symbols! 123")).toBe(
        "special-characters-symbols-123"
      );
    });
  });

  describe("fetchLeetCodeSolvedProblems", () => {
    it("should fetch public submit stats successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            matchedUser: {
              submitStats: {
                acSubmissionNum: [{ difficulty: "Easy", count: 10, submissions: 15 }],
              },
            },
            recentSubmissionList: [
              {
                title: "Two Sum",
                titleSlug: "two-sum",
                timestamp: "1700000000",
                statusDisplay: "Accepted",
              },
            ],
          },
        },
      });

      const res = await fetchLeetCodeSolvedProblems("testuser");
      expect(res.matchedUser.submitStats.acSubmissionNum[0].count).toBe(10);
      expect(res.recentSubmissionList[0].titleSlug).toBe("two-sum");
    });

    it("should throw error if LeetCode returns GraphQL errors", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          errors: [{ message: "User not found" }],
        },
      });

      await expect(fetchLeetCodeSolvedProblems("unknown")).rejects.toThrow(
        "User not found"
      );
    });

    it("should rethrow network/Axios error", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network timeout"));
      await expect(fetchLeetCodeSolvedProblems("testuser")).rejects.toThrow(
        "Network timeout"
      );
    });
  });

  describe("fetchAllSolvedProblems", () => {
    it("should paginate and retrieve all AC problems", async () => {
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            data: {
              problemsetQuestionList: {
                total: 2,
                questions: [
                  { title: "Two Sum", titleSlug: "two-sum", difficulty: "Easy" },
                  { title: "3Sum", titleSlug: "3sum", difficulty: "Medium" },
                ],
              },
            },
          },
        });

      const res = await fetchAllSolvedProblems("session-cookie-val");
      expect(res).toHaveLength(2);
      expect(res[0].titleSlug).toBe("two-sum");
      expect(res[1].titleSlug).toBe("3sum");
    });

    it("should throw error when GraphQL returns error", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          errors: [{ message: "Invalid session" }],
        },
      });

      await expect(fetchAllSolvedProblems("invalid-cookie")).rejects.toThrow(
        "Invalid session"
      );
    });
  });

  describe("fetchSessionUsername", () => {
    it("should return username from valid session", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            userStatus: {
              username: "leetcode_coder",
            },
          },
        },
      });

      const username = await fetchSessionUsername("valid-session");
      expect(username).toBe("leetcode_coder");
    });

    it("should return null on error or missing user", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Auth failed"));
      const username = await fetchSessionUsername("expired-session");
      expect(username).toBeNull();
    });

    it("should return null if GraphQL errors array is present", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          errors: [{ message: "Session expired" }],
        },
      });

      const username = await fetchSessionUsername("invalid");
      expect(username).toBeNull();
    });
  });

  describe("fetchProblemSubmissions", () => {
    it("should return submission list for a problem", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            questionSubmissionList: {
              submissions: [{ id: "12345", statusDisplay: "Accepted" }],
            },
          },
        },
      });

      const res = await fetchProblemSubmissions("two-sum", "cookie");
      expect(res.questionSubmissionList.submissions[0].id).toBe("12345");
    });

    it("should throw if error returned", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          errors: [{ message: "Problem not found" }],
        },
      });

      await expect(fetchProblemSubmissions("unknown", "cookie")).rejects.toThrow(
        "Problem not found"
      );
    });
  });

  describe("fetchSubmissionDetails", () => {
    it("should return submission details like code and runtime", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            submissionDetails: {
              runtime: "52 ms",
              code: "class Solution {}",
            },
          },
        },
      });

      const res = await fetchSubmissionDetails("12345", "cookie");
      expect(res.submissionDetails.runtime).toBe("52 ms");
      expect(res.submissionDetails.code).toBe("class Solution {}");
    });

    it("should throw on API error", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Submission not found"));
      await expect(fetchSubmissionDetails("000", "cookie")).rejects.toThrow(
        "Submission not found"
      );
    });
  });

  describe("fetchActiveDailyCodingChallengeQuestion", () => {
    it("should fetch today's daily question", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            activeDailyCodingChallengeQuestion: {
              date: "2026-08-30",
              link: "/problems/daily",
              question: {
                title: "Daily Problem",
                titleSlug: "daily-problem",
              },
            },
          },
        },
      });

      const res = await fetchActiveDailyCodingChallengeQuestion();
      expect(res.activeDailyCodingChallengeQuestion.date).toBe("2026-08-30");
      expect(res.activeDailyCodingChallengeQuestion.question.title).toBe("Daily Problem");
    });

    it("should throw when API errors", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Daily challenge error"));
      await expect(fetchActiveDailyCodingChallengeQuestion()).rejects.toThrow(
        "Daily challenge error"
      );
    });
  });

  describe("fetchProblemDetails", () => {
    it("should fetch problem content and snippets", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            question: {
              questionId: "1",
              title: "Two Sum",
              codeSnippets: [{ lang: "C++", code: "class Solution {};" }],
            },
          },
        },
      });

      const res = await fetchProblemDetails("two-sum");
      expect(res.questionId).toBe("1");
      expect(res.title).toBe("Two Sum");
      expect(res.codeSnippets).toHaveLength(1);
    });

    it("should throw if errors are returned in problem details query", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          errors: [{ message: "Question does not exist" }],
        },
      });

      await expect(fetchProblemDetails("invalid-slug")).rejects.toThrow(
        "Question does not exist"
      );
    });
  });

  describe("checkSubmissionResult", () => {
    it("should poll and return submission verdict", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          headers: { "set-cookie": ["csrftoken=mockcsrf123; path=/"] },
        })
        .mockResolvedValueOnce({
          data: {
            state: "SUCCESS",
            status_code: 10,
            status_msg: "Accepted",
          },
        });

      const res = await checkSubmissionResult("9999", "cookie");
      expect(res.status_msg).toBe("Accepted");
    });
  });

  describe("submitCodeToLeetCode", () => {
    it("should get CSRF token, question ID, and post code submission", async () => {
      // 1. getCsrfToken call
      mockedAxios.get.mockResolvedValueOnce({
        headers: { "set-cookie": ["csrftoken=validtoken; path=/"] },
      });

      // 2. getQuestionIds GraphQL call
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: {
            question: {
              questionId: "1",
              questionFrontendId: "1",
            },
          },
        },
      });

      // 3. submitCodeToLeetCode POST submit call
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: { submission_id: 12345678 },
      });

      const res = await submitCodeToLeetCode(
        "two-sum",
        "int main() {}",
        "cpp",
        "sess-cookie"
      );

      expect(res.submission_id).toBe(12345678);
    });

    it("should throw error if CSRF token is not found", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        headers: {},
      });

      await expect(
        submitCodeToLeetCode("two-sum", "code", "cpp", "invalid-sess")
      ).rejects.toThrow("Failed to get CSRF token");
    });
  });
});
