import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, dsaApi } from "../api";
import { queryCache } from "../queryCache";
import { offlineQueue } from "../offlineQueue";

describe("Frontend API Client (lib/api.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryCache.clear();
  });

  describe("dsaApi endpoints", () => {
    it("should fetch dashboard stats and city progress", async () => {
      const mockStats = {
        totalProblems: 50,
        solvedProblems: 25,
        progressPercentage: 50,
        currentStreak: 5,
        longestStreak: 10,
        weakTopics: [],
        revisions: [],
      };

      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/dashboard") return { data: mockStats };
        if (url === "/city/progress") return { data: { level: 2, xp: 120 } };
        if (url === "/analytics/activity") return { data: [{ date: "2026-08-01", count: 2 }] };
        if (url === "/analytics/mastery") return { data: [{ subject: "Arrays", A: 80, fullMark: 100 }] };
        return { data: {} };
      });

      const stats = await dsaApi.getDashboardStats(true);
      const city = await dsaApi.getCityProgress();
      const activity = await dsaApi.getActivityData(true);
      const mastery = await dsaApi.getMasteryStats(true);

      expect(stats.totalProblems).toBe(50);
      expect(city.level).toBe(2);
      expect(activity).toHaveLength(1);
      expect(mastery).toHaveLength(1);
    });

    it("should fetch topics and topic problems", async () => {
      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/topics")
          return { data: [{ id: "t1", name: "Arrays", totalProblems: 10, solvedProblems: 5 }] };
        if (url === "/topics/t1/problems")
          return { data: [{ id: "p1", title: "Two Sum", difficulty: "EASY" }] };
        return { data: {} };
      });

      const topics = await dsaApi.getTopics(true);
      const problems = await dsaApi.getTopicProblems("t1", true);

      expect(topics).toHaveLength(1);
      expect(problems).toHaveLength(1);
    });

    it("should update problem progress and toggle bookmark", async () => {
      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/progress") return { data: { success: true, levelCleared: true } };
        if (url === "/bookmarks/toggle") return { data: { bookmarked: true } };
        return { data: {} };
      });

      const res = await dsaApi.updateProgress("p1", "DONE", 20);
      const bm = await dsaApi.toggleBookmark("p1");

      expect(res.success).toBe(true);
      expect(bm.bookmarked).toBe(true);
    });

    it("should handle offline progress update and replayQueue", async () => {
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });

      const res = await dsaApi.updateProgress("p1", "DONE", 15);
      expect(res.offlineQueued).toBe(true);

      Object.defineProperty(navigator, "onLine", { value: true, configurable: true });

      vi.spyOn(api, "post").mockResolvedValue({ data: { success: true } });
      await offlineQueue.replayQueue();
      expect(offlineQueue.getPendingCount()).toBe(0);

      Object.defineProperty(navigator, "onLine", { value: originalOnLine, configurable: true });
    });

    it("should support AI reviews, hints, traces, and notes operations", async () => {
      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/ai/hint") return { data: { hint: "Use two pointers" } };
        if (url === "/ai/review") return { data: { review: "Optimal solution" } };
        if (url === "/ai/trace") return { data: { steps: [] } };
        if (url === "/ai/evaluate") return { data: { score: 95 } };
        if (url === "/notes") return { data: { id: "n1", content: "Notes content" } };
        if (url === "/solutions") return { data: { id: "sol-1" } };
        return { data: {} };
      });

      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/ai/pattern/top-1") return { data: { pattern: "Prefix sums" } };
        if (url === "/notes/p1") return { data: [{ id: "n1", content: "Notes content" }] };
        if (url === "/notes") return { data: [{ id: "n1", content: "All notes" }] };
        return { data: {} };
      });

      vi.spyOn(api, "put").mockResolvedValue({ data: { id: "n1", content: "Updated" } });
      vi.spyOn(api, "delete").mockResolvedValue({ data: { success: true } });

      const hint = await dsaApi.getAIHint("p1");
      const review = await dsaApi.getAICodeReview("p1", "int main() {}");
      const trace = await dsaApi.getAlgoTrace("p1", "int main() {}");
      const evalRes = await dsaApi.evaluateCode("p1", "int main() {}", "cpp");
      const pattern = await dsaApi.getPatternExplanation("top-1");
      const note = await dsaApi.createNote("p1", "Notes content");
      const savedSol = await dsaApi.saveSolution({
        problemId: "p1",
        code: "int main() {}",
        language: "cpp",
        score: 100,
        verdict: "ACCEPTED",
      });
      const notes = await dsaApi.getNotes("p1");
      const allNotes = await dsaApi.getAllNotes();
      const updated = await dsaApi.updateNote("n1", "Updated", "LEARNING");
      const deleted = await dsaApi.deleteNote("n1");

      expect(hint.hint).toBe("Use two pointers");
      expect(review.review).toBe("Optimal solution");
      expect(trace.steps).toBeDefined();
      expect(evalRes.score).toBe(95);
      expect(pattern.pattern).toBe("Prefix sums");
      expect(note.id).toBe("n1");
      expect(savedSol.id).toBe("sol-1");
      expect(notes).toHaveLength(1);
      expect(allNotes).toHaveLength(1);
      expect(updated.content).toBe("Updated");
      expect(deleted.success).toBe(true);
    });

    it("should support analytics, templates, readiness, export, and challenges", async () => {
      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/weekly-report") return { data: { weeklyXP: 500 } };
        if (url === "/vault/templates") return { data: [{ name: "Binary Search Template" }] };
        if (url === "/analytics/readiness") return { data: { score: 85 } };
        if (url === "/analytics/time") return { data: { totalHours: 12 } };
        if (url === "/analytics/productivity") return { data: { score: 90 } };
        if (url === "/ai/recommendations") return { data: [{ recommendation: "Practice Trees" }] };
        if (url === "/user/settings") return { data: { user: "test" } };
        if (url.startsWith("/export/progress")) return { data: "exported-data" };
        if (url === "/challenges/ch-1") return { data: { id: "ch-1", duration: 30 } };
        return { data: {} };
      });

      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/challenges/start") return { data: { id: "ch-1" } };
        if (url === "/challenges/ch-1/complete") return { data: { status: "COMPLETED" } };
        return { data: {} };
      });

      const weekly = await dsaApi.getWeeklyReport();
      const templates = await dsaApi.getTemplates();
      const readiness = await dsaApi.getInterviewReadiness();
      const time = await dsaApi.getTimeAnalytics();
      const prod = await dsaApi.getProductivityAnalytics();
      const recs = await dsaApi.getRecommendations();
      const settings = await dsaApi.getUserSettings();
      const exp = await dsaApi.exportProgress("json");
      const startCh = await dsaApi.startChallenge("top-1", 30);
      const ch = await dsaApi.getChallenge("ch-1");
      const compCh = await dsaApi.completeChallenge("ch-1", "COMPLETED");

      expect(weekly.weeklyXP).toBe(500);
      expect(templates).toHaveLength(1);
      expect(readiness.score).toBe(85);
      expect(time.totalHours).toBe(12);
      expect(prod.score).toBe(90);
      expect(recs).toHaveLength(1);
      expect(settings.user).toBe("test");
      expect(exp).toBe("exported-data");
      expect(startCh.id).toBe("ch-1");
      expect(ch.id).toBe("ch-1");
      expect(compCh.status).toBe("COMPLETED");
    });

    it("should support LeetCode account sync and submissions", async () => {
      vi.spyOn(api, "patch").mockResolvedValue({ data: { success: true } });
      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/leetcode/submissions/two-sum")
          return { data: [{ id: "sub-1", statusDisplay: "Accepted" }] };
        if (url === "/leetcode/submission/sub-1/code")
          return { data: { code: "class Solution {};" } };
        if (url === "/leetcode/daily-challenge")
          return { data: { date: "2026-08-30", link: "/problems/two-sum" } };
        if (url === "/user/solution-history") return { data: [{ id: "hist-1" }] };
        if (url === "/leetcode/problem/two-sum") return { data: { title: "Two Sum" } };
        if (url === "/leetcode/submission/9999/check")
          return { data: { state: "SUCCESS", status_msg: "Accepted" } };
        return { data: {} };
      });

      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/user/sync-leetcode") return { data: { synced: 15 } };
        if (url === "/leetcode/submit") return { data: { submission_id: 9999 } };
        return { data: {} };
      });

      const uName = await dsaApi.updateLeetcodeUsername("rajat");
      const uSess = await dsaApi.updateLeetcodeSession("valid_cookie");
      const subs = await dsaApi.getLeetcodeSubmissions("two-sum");
      const code = await dsaApi.getLeetcodeSubmissionCode("sub-1");
      const daily = await dsaApi.getLeetcodeDailyChallenge();
      const history = await dsaApi.getAllSolutionHistory();
      const sync = await dsaApi.syncLeetcode();
      const details = await dsaApi.getProblemDetails("two-sum");
      const submit = await dsaApi.submitToLeetCode("two-sum", "code", "cpp");
      const check = await dsaApi.checkSubmission("9999");

      expect(uName.success).toBe(true);
      expect(uSess.success).toBe(true);
      expect(subs).toHaveLength(1);
      expect(code.code).toBe("class Solution {};");
      expect(daily.date).toBe("2026-08-30");
      expect(history).toHaveLength(1);
      expect(sync.synced).toBe(15);
      expect(details.title).toBe("Two Sum");
      expect(submit.submission_id).toBe(9999);
      expect(check.status_msg).toBe("Accepted");
    });

    it("should support Tags, Bookmarks, and Search queries", async () => {
      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/tags") return { data: { id: "tag-1", name: "DP" } };
        if (url.startsWith("/tags/tag-1/problems")) return { data: { success: true } };
        return { data: {} };
      });

      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/tags") return { data: [{ id: "tag-1", name: "DP" }] };
        if (url === "/problems/p1/tags") return { data: [{ id: "tag-1" }] };
        if (url === "/bookmarks") return { data: [{ id: "bm-1" }] };
        if (url === "/bookmarks/check/p1") return { data: { isBookmarked: true } };
        if (url.startsWith("/search")) return { data: [{ id: "p1", title: "Two Sum" }] };
        return { data: {} };
      });

      vi.spyOn(api, "delete").mockResolvedValue({ data: { success: true } });

      const tag = await dsaApi.createTag("DP");
      const tags = await dsaApi.getTags();
      const toggleTag = await dsaApi.toggleProblemTag("tag-1", "p1");
      const pTags = await dsaApi.getProblemTags("p1");
      const bms = await dsaApi.getBookmarks();
      const chkBm = await dsaApi.checkBookmark("p1");
      const delTag = await dsaApi.deleteTag("tag-1");
      const search = await dsaApi.searchProblems({ q: "sum", difficulty: "EASY" });

      expect(tag.id).toBe("tag-1");
      expect(tags).toHaveLength(1);
      expect(toggleTag.success).toBe(true);
      expect(pTags).toHaveLength(1);
      expect(bms).toHaveLength(1);
      expect(chkBm.isBookmarked).toBe(true);
      expect(delTag.success).toBe(true);
      expect(search).toHaveLength(1);
    });

    it("should support review queue operations and admin seed", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: [{ id: "p1", title: "Review Prob" }] });
      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/review-queue/complete") return { data: { interval: 3 } };
        if (url === "/admin/seed")
          return { data: { success: true, topicsUpserted: 10, problemsUpserted: 50 } };
        return { data: {} };
      });

      const queue = await dsaApi.getReviewQueue();
      const complete = await dsaApi.completeReview("p1", 4);
      const seed = await dsaApi.adminSeedRoadmap();

      expect(queue).toHaveLength(1);
      expect(complete.interval).toBe(3);
      expect(seed.success).toBe(true);
    });

    it("should support Learn tracks, lessons, progress, and seeding", async () => {
      vi.spyOn(api, "get").mockImplementation(async (url) => {
        if (url === "/learn/tracks") return { data: [{ id: "trk-1", title: "Track 1" }] };
        if (url.startsWith("/learn/tracks/")) return { data: { lesson: { id: "l1" }, blocks: [] } };
        if (url === "/problems/p1") return { data: { id: "p1", title: "Problem 1" } };
        if (url === "/solutions") return { data: [{ id: "sol-1" }] };
        if (url === "/achievements") return { data: { badges: [] } };
        if (url === "/daily-problem") return { data: { problem: { id: "p1" } } };
        if (url === "/interviews") return { data: [{ id: "iv-1" }] };
        return { data: {} };
      });

      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url.startsWith("/learn/lessons/")) return { data: { success: true } };
        if (url === "/admin/learn/seed") return { data: { success: true } };
        if (url === "/admin/learn/seed-comprehensive") return { data: { success: true } };
        if (url === "/admin/learn/seed-learncpp") return { data: { success: true } };
        if (url === "/interviews") return { data: { id: "iv-1", date: "2026-08-30" } };
        return { data: {} };
      });

      const tracks = await dsaApi.getLearnTracks();
      const lesson = await dsaApi.getLearnLesson("track", "mod", "les");
      const prog = await dsaApi.updateLearnLessonProgress("l1", { status: "COMPLETED" });
      const seed1 = await dsaApi.adminSeedLearn();
      const seed2 = await dsaApi.adminSeedComprehensiveLearn();
      const seed3 = await dsaApi.adminSeedLearnCpp();
      const prob = await dsaApi.getProblem("p1");
      const allSols = await dsaApi.getAllSolutions();
      const ach = await dsaApi.getAchievements();
      const daily = await dsaApi.getDailyProblem();
      const ivs = await dsaApi.getInterviews();
      const createIv = await dsaApi.createInterview({ date: "2026-08-30" });

      expect(tracks).toHaveLength(1);
      expect(lesson.lesson.id).toBe("l1");
      expect(prog.success).toBe(true);
      expect(seed1.success).toBe(true);
      expect(seed2.success).toBe(true);
      expect(seed3.success).toBe(true);
      expect(prob.id).toBe("p1");
      expect(allSols).toHaveLength(1);
      expect(ach.badges).toBeDefined();
      expect(daily.problem.id).toBe("p1");
      expect(ivs).toHaveLength(1);
      expect(createIv.id).toBe("iv-1");
    });

    it("should support admin CRUD operations on users, topics, and problems", async () => {
      vi.spyOn(api, "get").mockResolvedValue({ data: [{ id: "u1", username: "alice" }] });
      vi.spyOn(api, "patch").mockResolvedValue({ data: { id: "u1", role: "ADMIN" } });
      vi.spyOn(api, "post").mockImplementation(async (url) => {
        if (url === "/admin/topics") return { data: { id: "top-1", name: "DP" } };
        if (url === "/admin/problems") return { data: { id: "p1", title: "Coin Change" } };
        return { data: {} };
      });
      vi.spyOn(api, "put").mockResolvedValue({ data: { success: true } });
      vi.spyOn(api, "delete").mockResolvedValue({ data: { success: true } });

      const users = await dsaApi.adminGetUsers();
      const role = await dsaApi.adminUpdateUserRole("u1", "ADMIN");
      const createTopic = await dsaApi.adminCreateTopic({ name: "DP", orderIndex: 1 });
      const updateTopic = await dsaApi.adminUpdateTopic("top-1", { name: "DP II", orderIndex: 1 });
      const delTopic = await dsaApi.adminDeleteTopic("top-1");
      const createProb = await dsaApi.adminCreateProblem({
        title: "Coin Change",
        difficulty: "MEDIUM",
        topicId: "top-1",
        orderIndex: 1,
      });
      const updateProb = await dsaApi.adminUpdateProblem("p1", {
        title: "Coin Change Updated",
        difficulty: "MEDIUM",
        topicId: "top-1",
        orderIndex: 1,
      });
      const delProb = await dsaApi.adminDeleteProblem("p1");

      expect(users).toHaveLength(1);
      expect(role.role).toBe("ADMIN");
      expect(createTopic.name).toBe("DP");
      expect(updateTopic.success).toBe(true);
      expect(delTopic.success).toBe(true);
      expect(createProb.title).toBe("Coin Change");
      expect(updateProb.success).toBe(true);
      expect(delProb.success).toBe(true);
    });
  });
});
