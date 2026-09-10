import { describe, it, expect, vi } from "vitest";
import {
  generateAIHint,
  generatePatternExplanation,
  generateAICodeReview,
  evaluateCodeWithGemini,
  generateAlgoTrace,
} from "../services/geminiService";

describe("Google Gemini AI Service & Heuristic Fallback", () => {
  it("generateAIHint should return a non-empty pedagogical hint", async () => {
    const hint = await generateAIHint("Two Sum", "Arrays & Hashing", "EASY");
    expect(hint).toBeDefined();
    expect(typeof hint).toBe("string");
    expect(hint.length).toBeGreaterThan(10);
  });

  it("generatePatternExplanation should return pattern structure and guidance", async () => {
    const explanation = await generatePatternExplanation("Two Pointers");
    expect(explanation).toBeDefined();
    expect(typeof explanation).toBe("string");
    expect(explanation.length).toBeGreaterThan(20);
  });

  it("generateAICodeReview should produce complexity and code review analysis", async () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const diff = target - nums[i];
          if (map.has(diff)) return [map.get(diff), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const review = await generateAICodeReview(code, "Two Sum", "Arrays");
    expect(review).toBeDefined();
    expect(typeof review === "string" || typeof review === "object").toBe(true);
  });

  it("evaluateCodeWithGemini should evaluate complexity, score, and verdict", async () => {
    const code = `
      #include <vector>
      #include <unordered_map>
      std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
          int complement = target - nums[i];
          if (seen.count(complement)) return {seen[complement], i};
          seen[nums[i]] = i;
        }
        return {};
      }
    `;
    const result = await evaluateCodeWithGemini(
      code,
      "Two Sum",
      "Arrays & Hashing",
      "EASY",
      "cpp",
    );

    expect(result).toBeDefined();
    expect(result.complexity).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.verdict).toBeDefined();
  });

  describe("generateAlgoTrace", () => {
    it("should return valid execution trace matching frontend contract for arrays", async () => {
      const code = `
        int left = 0, right = nums.size() - 1;
        while (left < right) {
          int sum = nums[left] + nums[right];
          if (sum == target) return {left, right};
          else if (sum < target) left++;
          else right--;
        }
      `;
      const trace = await generateAlgoTrace(code, "Two Sum II");

      expect(trace).toBeDefined();
      expect(typeof trace.sampleInput).toBe("string");
      expect(typeof trace.expectedOutput).toBe("string");
      expect(typeof trace.approach).toBe("string");
      expect(Array.isArray(trace.steps)).toBe(true);
      expect(trace.steps.length).toBeGreaterThanOrEqual(3);

      const validStates = new Set(["default", "active", "highlight", "done", "compare"]);
      for (const step of trace.steps) {
        expect(typeof step.step).toBe("number");
        expect(typeof step.phase).toBe("string");
        expect(Array.isArray(step.variables)).toBe(true);
        expect(step.dataStructure).toBeDefined();
        expect(typeof step.dataStructure.type).toBe("string");
        expect(Array.isArray(step.dataStructure.items)).toBe(true);

        for (const item of step.dataStructure.items) {
          expect(typeof item.value).toBe("string");
          expect(validStates.has(item.state)).toBe(true);
        }
      }
    });

    it("should return tree-oriented trace when problem/code references tree nodes", async () => {
      const treeCode = `
        TreeNode* invertTree(TreeNode* root) {
          if (!root) return nullptr;
          swap(root->left, root->right);
          invertTree(root->left);
          invertTree(root->right);
          return root;
        }
      `;
      const trace = await generateAlgoTrace(treeCode, "Invert Binary Tree");

      expect(trace).toBeDefined();
      expect(trace.steps.length).toBeGreaterThanOrEqual(3);
      expect(trace.steps[0].dataStructure.type).toBe("tree");
      expect(trace.steps[0].dataStructure.items.some((i) => i.value === "4")).toBe(true);
    });

    it("should return dp-oriented trace when problem/code references dynamic programming", async () => {
      const dpCode = `
        int climbStairs(int n) {
          vector<int> dp(n + 1, 0);
          dp[1] = 1; dp[2] = 2;
          for (int i = 3; i <= n; ++i) dp[i] = dp[i-1] + dp[i-2];
          return dp[n];
        }
      `;
      const trace = await generateAlgoTrace(dpCode, "Climbing Stairs");

      expect(trace).toBeDefined();
      expect(trace.steps.length).toBeGreaterThanOrEqual(3);
      expect(["dp", "dp-table"]).toContain(trace.steps[0].dataStructure.type);
      expect(trace.steps[0].dataStructure.label).toContain("DP");
    });
  });
});

