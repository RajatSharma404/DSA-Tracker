import axios from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to all requests
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session && (session as any).accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
  }
  return config;
});

export interface DashboardStats {
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  weakTopics: Array<{ name: string; avgTimeSpent: number }>;
  revisions: Array<{
    id: string;
    title: string;
    topicName: string;
    daysSince: number;
  }>;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
}

export interface Problem {
  id: string;
  title: string;
  link: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topicId: string;
  orderIndex: number;
  status: "TODO" | "DOING" | "DONE";
  timeSpent: number;
  nextReviewDate?: string | Date;
}

export interface MockInterview {
  id: string;
  date: string;
  score: number | null;
  feedback: string | null;
}

export const dsaApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/dashboard");
    return res.data;
  },
  getTopics: async (): Promise<Topic[]> => {
    const res = await api.get("/topics");
    return res.data;
  },
  getTopicProblems: async (topicId: string): Promise<Problem[]> => {
    const res = await api.get(`/topics/${topicId}/problems`);
    return res.data;
  },
  getProblem: async (problemId: string): Promise<Problem> => {
    const res = await api.get(`/problems/${problemId}`);
    return res.data;
  },
  updateProgress: async (
    problemId: string,
    status: "TODO" | "DOING" | "DONE",
    timeSpent: number,
  ) => {
    const res = await api.post("/progress", { problemId, status, timeSpent });
    return res.data;
  },
  getInterviews: async (): Promise<MockInterview[]> => {
    const res = await api.get("/interviews");
    return res.data;
  },
  createInterview: async (data: {
    date: string;
    score?: number;
    feedback?: string;
  }): Promise<MockInterview> => {
    const res = await api.post("/interviews", data);
    return res.data;
  },

  // === Admin Methods ===
  adminGetUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },
  adminUpdateUserRole: async (userId: string, role: "USER" | "ADMIN") => {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },
  adminCreateTopic: async (data: {
    name: string;
    description?: string;
    orderIndex: number;
  }) => {
    const res = await api.post("/admin/topics", data);
    return res.data;
  },
  adminUpdateTopic: async (
    id: string,
    data: { name: string; description?: string; orderIndex: number },
  ) => {
    const res = await api.put(`/admin/topics/${id}`, data);
    return res.data;
  },
  adminDeleteTopic: async (id: string) => {
    const res = await api.delete(`/admin/topics/${id}`);
    return res.data;
  },
  adminCreateProblem: async (data: {
    title: string;
    link?: string;
    difficulty: string;
    topicId: string;
    orderIndex: number;
  }) => {
    const res = await api.post("/admin/problems", data);
    return res.data;
  },
  adminUpdateProblem: async (
    id: string,
    data: {
      title: string;
      link?: string;
      difficulty: string;
      topicId: string;
      orderIndex: number;
    },
  ) => {
    const res = await api.put(`/admin/problems/${id}`, data);
    return res.data;
  },
  adminDeleteProblem: async (id: string) => {
    const res = await api.delete(`/admin/problems/${id}`);
    return res.data;
  },
  adminSeedRoadmap: async (): Promise<{
    success: boolean;
    topicsUpserted: number;
    problemsUpserted: number;
  }> => {
    const res = await api.post("/admin/seed");
    return res.data;
  },
  getActivityData: async (): Promise<
    Array<{ date: string; count: number }>
  > => {
    const res = await api.get("/analytics/activity");
    return res.data;
  },
  getMasteryStats: async () => {
    const res = await api.get("/analytics/mastery");
    return res.data;
  },
  updateLeetcodeUsername: async (leetcodeUsername: string) => {
    const res = await api.patch("/user/leetcode", { leetcodeUsername });
    return res.data;
  },
  updateLeetcodeSession: async (leetcodeSession: string) => {
    const res = await api.patch("/user/leetcode-session", { leetcodeSession });
    return res.data;
  },
  getLeetcodeSubmissions: async (problemSlug: string) => {
    const res = await api.get(`/leetcode/submissions/${problemSlug}`);
    return res.data;
  },
  getLeetcodeSubmissionCode: async (submissionId: string) => {
    const res = await api.get(`/leetcode/submission/${submissionId}/code`);
    return res.data;
  },
  getLeetcodeDailyChallenge: async () => {
    const res = await api.get("/leetcode/daily-challenge");
    return res.data;
  },
  syncLeetcode: async () => {
    const res = await api.post("/user/sync-leetcode");
    return res.data;
  },
  startChallenge: async (topicId: string, duration: number) => {
    const res = await api.post("/challenges/start", { topicId, duration });
    return res.data;
  },
  getChallenge: async (id: string) => {
    const res = await api.get(`/challenges/${id}`);
    return res.data;
  },
  completeChallenge: async (id: string, status: "COMPLETED" | "FAILED") => {
    const res = await api.post(`/challenges/${id}/complete`, { status });
    return res.data;
  },
  getAIHint: async (problemId: string) => {
    const res = await api.post("/ai/hint", { problemId });
    return res.data;
  },
  getPatternExplanation: async (topicId: string) => {
    const res = await api.get(`/ai/pattern/${topicId}`);
    return res.data;
  },
  getAICodeReview: async (problemId: string, code: string) => {
    const res = await api.post("/ai/review", { problemId, code });
    return res.data;
  },
  getAlgoTrace: async (problemId: string, code: string) => {
    const res = await api.post("/ai/trace", { problemId, code });
    return res.data;
  },
  evaluateCode: async (problemId: string, code: string, language: string) => {
    const res = await api.post("/ai/evaluate", { problemId, code, language });
    return res.data;
  },

  // === Solution History ===
  saveSolution: async (data: {
    problemId: string;
    code: string;
    language: string;
    isCorrect?: boolean;
    score: number;
    verdict?: string;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    isOptimal?: boolean;
    isAIGenerated?: boolean;
  }) => {
    const res = await api.post("/solutions", data);
    return res.data;
  },
  getSolutionHistory: async (problemId: string) => {
    const res = await api.get(`/solutions/${problemId}`);
    return res.data;
  },
  getAllSolutions: async () => {
    const res = await api.get("/solutions");
    return res.data;
  },

  // === Bookmarks ===
  toggleBookmark: async (problemId: string) => {
    const res = await api.post("/bookmarks/toggle", { problemId });
    return res.data;
  },
  getBookmarks: async () => {
    const res = await api.get("/bookmarks");
    return res.data;
  },
  checkBookmark: async (problemId: string) => {
    const res = await api.get(`/bookmarks/check/${problemId}`);
    return res.data;
  },

  // === Tags ===
  createTag: async (name: string, color?: string) => {
    const res = await api.post("/tags", { name, color });
    return res.data;
  },
  getTags: async () => {
    const res = await api.get("/tags");
    return res.data;
  },
  deleteTag: async (tagId: string) => {
    const res = await api.delete(`/tags/${tagId}`);
    return res.data;
  },
  toggleProblemTag: async (tagId: string, problemId: string) => {
    const res = await api.post(`/tags/${tagId}/problems`, { problemId });
    return res.data;
  },
  getProblemTags: async (problemId: string) => {
    const res = await api.get(`/problems/${problemId}/tags`);
    return res.data;
  },

  // === Search & Filters ===
  searchProblems: async (params: {
    q?: string;
    difficulty?: string;
    status?: string;
    topicId?: string;
    bookmarked?: boolean;
    tagId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.difficulty) query.set("difficulty", params.difficulty);
    if (params.status) query.set("status", params.status);
    if (params.topicId) query.set("topicId", params.topicId);
    if (params.bookmarked) query.set("bookmarked", "true");
    if (params.tagId) query.set("tagId", params.tagId);
    const res = await api.get(`/search?${query.toString()}`);
    return res.data;
  },

  // === Review Queue (Spaced Repetition) ===
  getReviewQueue: async () => {
    const res = await api.get("/review-queue");
    return res.data;
  },
  completeReview: async (problemId: string, quality: number) => {
    const res = await api.post("/review-queue/complete", {
      problemId,
      quality,
    });
    return res.data;
  },

  // === Export ===
  exportProgress: async (format: "json" | "csv" = "json") => {
    const res = await api.get(`/export/progress?format=${format}`, {
      responseType: format === "csv" ? "blob" : "json",
    });
    return res.data;
  },

  // === AI Recommendations ===
  getRecommendations: async () => {
    const res = await api.get("/ai/recommendations");
    return res.data;
  },

  // === Enhanced Analytics ===
  getProductivityAnalytics: async () => {
    const res = await api.get("/analytics/productivity");
    return res.data;
  },

  // === Daily Problem ===
  getDailyProblem: async () => {
    const res = await api.get("/daily-problem");
    return res.data;
  },
  getTimeAnalytics: async () => {
    const res = await api.get("/analytics/time");
    return res.data;
  },
  getAchievements: async () => {
    const res = await api.get("/achievements");
    return res.data;
  },
  getWeeklyReport: async () => {
    const res = await api.get("/weekly-report");
    return res.data;
  },

  // === Vault / Wiki ===
  getTemplates: async () => {
    const res = await api.get("/vault/templates");
    return res.data;
  },
  getNotes: async (problemId: string) => {
    const res = await api.get(`/notes/${problemId}`);
    return res.data;
  },
  getAllNotes: async () => {
    const res = await api.get("/notes");
    return res.data;
  },
  createNote: async (
    problemId: string,
    content: string,
    type: string = "LEARNING",
  ) => {
    const res = await api.post("/notes", { problemId, content, type });
    return res.data;
  },
  updateNote: async (noteId: string, content: string, type: string) => {
    const res = await api.put(`/notes/${noteId}`, { content, type });
    return res.data;
  },
  deleteNote: async (noteId: string) => {
    const res = await api.delete(`/notes/${noteId}`);
    return res.data;
  },

  // === LeetCode Submission Methods ===
  getProblemDetails: async (titleSlug: string) => {
    const res = await api.get(`/leetcode/problem/${titleSlug}`);
    return res.data;
  },
  submitToLeetCode: async (
    questionSlug: string,
    code: string,
    lang: string,
  ) => {
    const res = await api.post("/leetcode/submit", {
      questionSlug,
      code,
      lang,
    });
    return res.data;
  },
  checkSubmission: async (submissionId: string) => {
    const res = await api.get(`/leetcode/submission/${submissionId}/check`);
    return res.data;
  },

  // === Settings Methods ===
  getUserSettings: async () => {
    const res = await api.get("/user/settings");
    return res.data;
  },
};
