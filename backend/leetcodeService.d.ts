export declare const fetchLeetCodeSolvedProblems: (username: string) => Promise<any>;
/**
 * Normalizes title to match DB records
 * (e.g. "Two Sum" -> "two-sum")
 */
export declare const slugify: (text: string) => string;
/**
 * Fetches ALL accepted problems for a user using the authenticated API.
 * Paginates through `problemsetQuestionList` until all AC problems are retrieved.
 * Requires a valid LEETCODE_SESSION cookie.
 */
export declare const fetchAllSolvedProblems: (leetcodeSession: string) => Promise<Array<{
    title: string;
    titleSlug: string;
    difficulty: string;
}>>;
export declare const fetchProblemSubmissions: (questionSlug: string, leetcodeSession: string) => Promise<any>;
export declare const fetchSubmissionDetails: (submissionId: string, leetcodeSession: string) => Promise<any>;
export declare const fetchActiveDailyCodingChallengeQuestion: () => Promise<any>;
/**
 * Submit code to LeetCode
 */
export declare const submitCodeToLeetCode: (questionSlug: string, code: string, lang: string, leetcodeSession: string) => Promise<any>;
/**
 * Check submission result
 */
export declare const checkSubmissionResult: (submissionId: string, leetcodeSession: string) => Promise<any>;
/**
 * Get problem details and code snippets
 */
export declare const fetchProblemDetails: (titleSlug: string) => Promise<any>;
//# sourceMappingURL=leetcodeService.d.ts.map