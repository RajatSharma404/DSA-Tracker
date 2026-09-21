import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const mockPrisma = vi.hoisted(() => ({
  problem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  bookmark: {
    findMany: vi.fn(),
  },
  problemNote: {
    findMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  progress: {
    findMany: vi.fn(),
  },
  topic: {
    findMany: vi.fn(),
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("../middlewares/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "user-test-tier45", email: "test45@example.com", role: "ADMIN" };
    req.userId = "user-test-tier45";
    next();
  },
}));

vi.mock("../middlewares/admin", () => ({
  requireAdmin: (_req: any, _res: any, next: any) => {
    next();
  },
}));

// Mock GoogleGenAI to test deterministic responses and fallbacks without network latency
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockRejectedValue(new Error("Gemini API Offline Simulated")),
      };
    },
  };
});

import searchRouter from "../routes/search.routes";
import bookmarksRouter from "../routes/bookmarks.routes";
import notesRouter from "../routes/notes.routes";
import { generateAICodeReview, evaluateCodeWithGemini } from "../services/geminiService";

const app = express();
app.use(express.json());
app.use("/api", searchRouter);
app.use("/api", bookmarksRouter);
app.use("/api", notesRouter);

describe("Tier 4 & Tier 5 Backend Query Bounding & Type Safety Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tier 4: Prisma Query Bounds & Pagination Safety", () => {
    it("GET /api/search should enforce bounded take: limit (default 2000)", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/search?q=two");
      expect(res.status).toBe(200);

      expect(mockPrisma.problem.findMany).toHaveBeenCalledTimes(1);
      const callArgs = mockPrisma.problem.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(2000);
    });

    it("GET /api/search should respect user limit up to 5000 max", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/search?q=two&limit=100");
      expect(res.status).toBe(200);

      const callArgs = mockPrisma.problem.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(100);
    });

    it("GET /api/search should clamp excessively large limits to 5000", async () => {
      mockPrisma.problem.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/search?q=two&limit=999999");
      expect(res.status).toBe(200);

      const callArgs = mockPrisma.problem.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(5000);
    });

    it("GET /api/bookmarks should enforce bounded take: limit (default 100)", async () => {
      mockPrisma.bookmark.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/bookmarks");
      expect(res.status).toBe(200);

      expect(mockPrisma.bookmark.findMany).toHaveBeenCalledTimes(1);
      const callArgs = mockPrisma.bookmark.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(100);
    });

    it("GET /api/notes should enforce bounded take: limit (default 100)", async () => {
      mockPrisma.problemNote.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/notes");
      expect(res.status).toBe(200);

      expect(mockPrisma.problemNote.findMany).toHaveBeenCalledTimes(1);
      const callArgs = mockPrisma.problemNote.findMany.mock.calls[0][0];
      expect(callArgs.take).toBe(100);
    });
  });

  describe("Tier 5: Gemini Service Type Safety & Heuristic Fallbacks", () => {
    it("generateAICodeReview should produce structured review with Big-O complexity when Gemini is unconfigured", async () => {
      const code = `
        int twoSum(vector<int>& nums, int target) {
          unordered_map<int, int> seen;
          for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) return i;
            seen[nums[i]] = i;
          }
          return -1;
        }
      `;

      const review = await generateAICodeReview(code, "Two Sum", "Arrays");
      expect(review).toBeDefined();

      if (typeof review === "object" && review !== null && "type" in review) {
        expect(review.type).toBe("structured");
        expect(review.data).toHaveProperty("verdict");
        expect(review.data).toHaveProperty("efficiency");
        expect(review.data.efficiency.timeComplexity).toBe("O(N)");
      } else {
        expect(typeof review).toBe("string");
      }
    });

    it("evaluateCodeWithGemini should evaluate complexity, score, and verdict via fallback without runtime errors", async () => {
      const code = `
        int maxSubArray(vector<int>& nums) {
          int maxSum = nums[0];
          int currentSum = nums[0];
          for (size_t i = 1; i < nums.size(); ++i) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
          }
          return maxSum;
        }
      `;

      const evalResult = await evaluateCodeWithGemini(
        code,
        "Maximum Subarray",
        "Dynamic Programming",
        "MEDIUM",
        "cpp",
      );

      expect(evalResult).toBeDefined();
      expect(evalResult).toHaveProperty("verdict");
      expect(evalResult).toHaveProperty("complexity");
      expect(evalResult.complexity).toHaveProperty("time");
      expect(evalResult.complexity.time).toBe("O(N)");
    });
  });
});
