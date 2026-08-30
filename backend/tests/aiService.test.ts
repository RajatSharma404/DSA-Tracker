import { describe, it, expect } from "vitest";
import {
  getAICodeReview,
  evaluateCode,
  getAlgoTracing,
  getAIHint,
  getPatternExplanation,
  getAIRecommendations,
} from "../aiService";

describe("backend/aiService.ts", () => {
  describe("getAICodeReview", () => {
    it("should review optimal C++ two-sum solution", async () => {
      const code = `
        #include <vector>
        #include <unordered_map>
        std::vector<int> twoSum(const std::vector<int>& nums, int target) {
          std::unordered_map<int, int> seen;
          for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
              return {seen[complement], i};
            }
            seen[nums[i]] = i;
          }
          return {};
        }
      `;

      const result = await getAICodeReview(code, "Two Sum", "Arrays");
      expect(result.type).toBe("structured");
      expect(result.data.verdict).toBe("OPTIMAL");
      expect(result.data.efficiency.timeComplexity).toBe("O(N)");
      expect(result.data.efficiency.spaceComplexity).toBe("O(N)");
      expect(result.data.efficiency.isOptimal).toBe(true);
      expect(result.data.logic.isCorrect).toBe(true);
      expect(result.data.logic.edgeCases.length).toBeGreaterThanOrEqual(3);
    });

    it("should detect brute force O(N^2) nested loop code", async () => {
      const code = `
        for (int i = 0; i < n; i++) {
          for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) return {i, j};
          }
        }
      `;

      const result = await getAICodeReview(code, "Two Sum", "Arrays");
      expect(result.data.efficiency.timeComplexity).toBe("O(N^2)");
      expect(result.data.efficiency.isOptimal).toBe(false);
      expect(result.data.verdict).toBe("GOOD");
    });

    it("should detect triple nested loops O(N^3)", async () => {
      const code = `
        for (int i = 0; i < n; i++) {
          for (int j = i + 1; j < n; j++) {
            for (int k = j + 1; k < n; k++) {
              if (nums[i] + nums[j] + nums[k] == 0) return true;
            }
          }
        }
      `;

      const result = await getAICodeReview(code, "3Sum Brute Force", "Arrays");
      expect(result.data.efficiency.timeComplexity).toBe("O(N^3)");
      expect(result.data.verdict).toBe("NEEDS WORK");
    });

    it("should detect pass by value and vector reserve suggestions", async () => {
      const code = `
        void solve(std::vector<int> nums) {
          std::vector<int> res;
          for (int i = 0; i < nums.size(); ++i) {
            res.push_back(nums[i]);
          }
        }
      `;

      const result = await getAICodeReview(code, "Test Suggestions", "Arrays");
      expect(result.data.cleanCode.some((c) => c.suggestion.includes("const std::vector"))).toBe(true);
      expect(result.data.cleanCode.some((c) => c.suggestion.includes("reserve"))).toBe(true);
    });

    it("should detect tree and graph specific edge cases", async () => {
      const treeCode = `
        int maxDepth(TreeNode* root) {
          if (!root) return 0;
          return 1 + std::max(maxDepth(root->left), maxDepth(root->right));
        }
      `;

      const result = await getAICodeReview(treeCode, "Max Depth", "Trees");
      expect(result.data.logic.edgeCases.some((c) => c.case.includes("Tree"))).toBe(true);
    });
  });

  describe("evaluateCode", () => {
    it("should score complete solution with high rating", async () => {
      const code = `
        #include <vector>
        #include <unordered_map>
        using namespace std;
        vector<int> solve(const vector<int>& nums) {
          unordered_map<int, int> mp;
          return {1, 2};
        }
      `;

      const evalRes = await evaluateCode(code, "Two Sum", "Arrays", "EASY", "cpp");
      expect(evalRes.isCorrect).toBe(true);
      expect(evalRes.score).toBeGreaterThanOrEqual(70);
      expect(evalRes.verdict).toBe("ACCEPTED");
      expect(evalRes.originality.verdict).toBe("HUMAN");
    });

    it("should flag very short incomplete snippet as WRONG_ANSWER", async () => {
      const shortCode = `return {};`;
      const evalRes = await evaluateCode(shortCode, "Two Sum", "Arrays", "EASY", "cpp");
      expect(evalRes.isCorrect).toBe(false);
      expect(evalRes.verdict).toBe("WRONG_ANSWER");
      expect(evalRes.failingCase.input).not.toBeNull();
    });

    it("should provide alternative approaches when complexity is not optimal", async () => {
      const n2Code = `
        for (int i = 0; i < n; ++i) {
          for (int j = 0; j < n; ++j) {
            // scan
          }
        }
      `;

      const evalRes = await evaluateCode(n2Code, "Two Sum", "Arrays", "EASY", "cpp");
      expect(evalRes.betterApproaches.length).toBeGreaterThanOrEqual(1);
      expect(evalRes.betterApproaches[0].timeComplexity).toBe("O(N)");
    });
  });

  describe("getAlgoTracing", () => {
    it("should return trace execution steps and variables for visualization", async () => {
      const trace = await getAlgoTracing("int left = 0, right = n - 1;", "Two Sum II");
      expect(trace.sampleInput).toBeDefined();
      expect(trace.steps.length).toBe(3);
      expect(trace.steps[0].phase).toBe("INIT");
      expect(trace.steps[1].phase).toBe("CHECK");
      expect(trace.steps[2].phase).toBe("MATCH");
      expect(trace.steps[0].dataStructure.items.length).toBe(4);
    });
  });

  describe("getAIHint and getPatternExplanation", () => {
    it("should generate formatted AI hint", async () => {
      const hint = await getAIHint("Two Sum", "Arrays", "EASY");
      expect(hint).toContain("🎯 Problem: Two Sum (EASY)");
      expect(hint).toContain("📌 Topic Focus: Arrays");
      expect(hint).toContain("Modern C++ Tip");
    });

    it("should generate pattern explanation with core invariants", async () => {
      const explanation = await getPatternExplanation("Dynamic Programming");
      expect(explanation).toContain("Dynamic Programming — Pattern Guide & Invariants");
      expect(explanation).toContain("Core Intuition");
      expect(explanation).toContain("Memory Model");
    });
  });

  describe("getAIRecommendations", () => {
    it("should return customized recommendations, weekly plan, and next action", async () => {
      const solved = [
        { title: "Two Sum", topic: "Arrays", difficulty: "EASY", score: 90, isOptimal: true },
        { title: "Valid Anagram", topic: "Hashing", difficulty: "EASY", score: 85, isOptimal: true },
      ];
      const weakTopics = ["Dynamic Programming", "Trees"];
      const allTopics = ["Arrays", "Hashing", "Dynamic Programming", "Trees", "Graphs"];

      const res = await getAIRecommendations(solved, weakTopics, allTopics, {
        revisionReminders: [{ id: "p1", title: "Two Sum", topicName: "Arrays", daysSince: 5 }],
      });

      expect(res.weakTopics).toEqual(weakTopics);
      expect(res.suggestedProblems.length).toBeGreaterThan(0);
      expect(res.weeklyPlan.length).toBe(7);
      expect(res.nextAction.mode).toBe("REVISION");
      expect(res.nextAction.title).toContain("Two Sum");
      expect(res.tips.length).toBeGreaterThan(0);
    });

    it("should recommend weakest topic when no revision is pending", async () => {
      const res = await getAIRecommendations([], ["Graphs"], ["Arrays", "Graphs"], {
        weakTopicBreakdown: [{ name: "Graphs", avgTimeSpent: 40, completionPct: 20 }],
      });

      expect(res.nextAction.mode).toBe("WEAKNESS");
      expect(res.nextAction.topic).toBe("Graphs");
    });

    it("should provide balanced default nextAction when no weak topics or revisions are specified", async () => {
      const res = await getAIRecommendations([], [], ["Arrays", "Graphs"]);
      expect(res.nextAction.mode).toBe("BALANCED");
      expect(res.nextAction.topic).toBe("Arrays");
    });
  });
});
