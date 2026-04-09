import axios from "axios";
import { getSession } from "next-auth/react";

type SessionWithToken = {
  accessToken?: string;
};

let cachedAccessToken: string | null = null;
let lastSessionReadAt = 0;
const SESSION_CACHE_MS = 30_000;
let sessionReadPromise: Promise<string | null> | null = null;

const isBrowser = typeof window !== "undefined";
const isLocalHost =
  isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const configuredPublicApiBase =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || "";
const hasAbsolutePublicApiBase = /^https?:\/\//i.test(configuredPublicApiBase);
const normalizedPublicApiBase = hasAbsolutePublicApiBase
  ? configuredPublicApiBase.endsWith("/api")
    ? configuredPublicApiBase
    : `${configuredPublicApiBase}/api`
  : "";

// Prefer direct public API URL when explicitly configured.
// This avoids relying on platform rewrites and is resilient on Render.
const API_BASE_URL = hasAbsolutePublicApiBase
  ? normalizedPublicApiBase
  : isLocalHost
    ? process.env.NEXT_PUBLIC_API_URL || "/api"
    : "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const RETRYABLE_METHODS = new Set(["get", "head", "options"]);
const MAX_429_RETRIES = 2;
const NETWORK_ERROR_CODES = new Set([
  "ERR_NETWORK",
  "ENOTFOUND",
  "ECONNREFUSED",
  "EAI_AGAIN",
]);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const readAccessToken = async (force = false): Promise<string | null> => {
  const now = Date.now();
  const shouldRefresh =
    force || !cachedAccessToken || now - lastSessionReadAt > SESSION_CACHE_MS;

  if (!shouldRefresh) {
    return cachedAccessToken;
  }

  if (!sessionReadPromise) {
    sessionReadPromise = (async () => {
      try {
        const session = (await getSession()) as SessionWithToken | null;
        const token = session?.accessToken || null;
        cachedAccessToken = token;
        lastSessionReadAt = Date.now();
        return token;
      } catch {
        // Avoid noisy client-fetch failures from breaking API calls.
        cachedAccessToken = null;
        lastSessionReadAt = Date.now();
        return null;
      } finally {
        sessionReadPromise = null;
      }
    })();
  }

  return sessionReadPromise;
};

// Automatically attach JWT token to all requests
api.interceptors.request.use(async (config) => {
  const accessToken = await readAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

// Retry once on 401 after forcing a fresh session read.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as any;
    const status = error?.response?.status;
    const code = String(error?.code || "");
    const hasNetworkResolutionFailure =
      !status &&
      originalRequest &&
      hasAbsolutePublicApiBase &&
      originalRequest.baseURL === normalizedPublicApiBase &&
      !originalRequest._retryViaRelativeApi &&
      (NETWORK_ERROR_CODES.has(code) ||
        /Failed to fetch|Network Error|ERR_NAME_NOT_RESOLVED/i.test(
          String(error?.message || ""),
        ));

    if (hasNetworkResolutionFailure) {
      originalRequest._retryViaRelativeApi = true;
      originalRequest.baseURL = "/api";
      await sleep(120);
      return api(originalRequest);
    }

    if (status === 429 && originalRequest) {
      const method = String(originalRequest.method || "get").toLowerCase();
      const retries = Number(originalRequest._retry429Count || 0);

      if (
        method === "get" &&
        normalizedPublicApiBase &&
        originalRequest.baseURL === "/api" &&
        !originalRequest._retryViaPublicApiBase
      ) {
        originalRequest._retryViaPublicApiBase = true;
        originalRequest.baseURL = normalizedPublicApiBase;
        await sleep(150);
        return api(originalRequest);
      }

      if (RETRYABLE_METHODS.has(method) && retries < MAX_429_RETRIES) {
        originalRequest._retry429Count = retries + 1;
        const jitterMs = Math.floor(Math.random() * 120);
        const backoffMs = 350 * Math.pow(2, retries) + jitterMs;
        await sleep(backoffMs);
        return api(originalRequest);
      }
    }

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      throw error;
    }

    originalRequest._retry = true;
    const accessToken = await readAccessToken(true);
    if (!accessToken) {
      throw error;
    }

    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  },
);

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
  nextAction?: NextAction;
}

export interface NextAction {
  mode: "REVISION" | "WEAKNESS" | "BUILD_MOMENTUM" | "BALANCED";
  title: string;
  topic: string;
  reason: string;
  cta: string;
  difficulty: string;
  estimatedMinutes: number;
}

export interface InterviewReadiness {
  score: number;
  level: string;
  metrics: {
    timedMediumHard: number;
    consistency14d: number;
    revisionReliability: number;
    topicCoverage: number;
  };
  snapshot: {
    solvedLast14d: number;
    solvedTotal: number;
    mediumHardSolved: number;
    coveredTopics: number;
    totalTopics: number;
  };
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

export interface UserTag {
  id: string;
  name: string;
  color: string;
  problems?: Array<{ id: string }>;
}

export interface SearchProblem {
  id: string;
  title: string;
  link: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topicId: string;
  topicName: string;
  orderIndex: number;
  status: "TODO" | "DOING" | "DONE";
  timeSpent: number;
  nextReviewDate?: string | Date;
  isBookmarked: boolean;
  tags: UserTag[];
}

export interface MockInterview {
  id: string;
  date: string;
  score: number | null;
  feedback: string | null;
}

export interface LearnLessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  orderIndex: number;
  estimatedMinutes: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
}

export interface LearnModuleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  orderIndex: number;
  estimatedMinutes: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: LearnLessonSummary[];
}

export interface LearnTrackSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  modules: LearnModuleSummary[];
}

export interface LearnLessonDetail {
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    estimatedMinutes: number;
    learningObjectives: string[] | null;
    module: { id: string; title: string; slug: string };
    track: { title: string; slug: string };
  };
  blocks: Array<{
    id: string;
    blockType: "MARKDOWN" | "CODE" | "NOTE" | "QUIZ" | "IMAGE";
    orderIndex: number;
    content: unknown;
    language: string | null;
  }>;
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    progressPercent: number;
    timeSpentSeconds: number;
    completedAt: string | null;
  };
  isUnlocked: boolean;
  siblings: Array<{
    id: string;
    slug: string;
    title: string;
    orderIndex: number;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  }>;
  problems: Array<{
    id: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    link: string | null;
    topicName: string | null;
    required: boolean;
    orderIndex: number;
    solved: boolean;
    unlocked: boolean;
  }>;
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
  getLearnTracks: async (): Promise<LearnTrackSummary[]> => {
    const res = await api.get("/learn/tracks", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return res.data;
  },
  getLearnLesson: async (
    trackSlug: string,
    moduleSlug: string,
    lessonSlug: string,
  ): Promise<LearnLessonDetail> => {
    const res = await api.get(
      `/learn/tracks/${trackSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`,
    );
    return res.data;
  },
  updateLearnLessonProgress: async (
    lessonId: string,
    data: {
      status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      progressPercent?: number;
      timeSpentSeconds?: number;
      lastSeenBlockId?: string;
    },
  ) => {
    const res = await api.post(`/learn/lessons/${lessonId}/progress`, data);
    return res.data;
  },
  adminSeedLearn: async () => {
    const res = await api.post("/admin/learn/seed");
    return res.data;
  },
  adminSeedComprehensiveLearn: async () => {
    const res = await api.post("/admin/learn/seed-comprehensive");
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
  }): Promise<SearchProblem[]> => {
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
  completeReview: async (
    problemId: string,
    quality: number,
  ): Promise<{
    nextReviewIn?: string;
    interval?: number;
    easinessFactor?: number;
  }> => {
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
  getInterviewReadiness: async (): Promise<InterviewReadiness> => {
    const res = await api.get("/analytics/readiness");
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
