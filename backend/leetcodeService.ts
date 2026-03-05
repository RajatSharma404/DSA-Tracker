import axios from "axios";

export const fetchLeetCodeSolvedProblems = async (username: string) => {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
      recentSubmissionList(username: $username, limit: 100) {
        title
        titleSlug
        timestamp
        statusDisplay
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error) {
    console.error("LeetCode API Error:", error);
    throw error;
  }
};

/**
 * Normalizes title to match DB records
 * (e.g. "Two Sum" -> "two-sum")
 */
export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

export const fetchProblemSubmissions = async (
  questionSlug: string,
  leetcodeSession: string,
) => {
  const query = `
    query submissionList($offset: Int!, $limit: Int!, $questionSlug: String!) {
      questionSubmissionList(
        offset: $offset
        limit: $limit
        questionSlug: $questionSlug
      ) {
        submissions {
          id
          title
          titleSlug
          statusDisplay
          lang
          runtime
          memory
          timestamp
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { offset: 0, limit: 10, questionSlug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `LEETCODE_SESSION=${leetcodeSession}; csrftoken=dummy;`,
          "x-csrftoken": "dummy",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  } catch (error) {
    console.error("LeetCode API Error:", error);
    throw error;
  }
};

export const fetchSubmissionDetails = async (
  submissionId: string,
  leetcodeSession: string,
) => {
  const query = `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        runtime
        runtimeDisplay
        memoryDisplay
        code
        timestamp
        statusCode
        lang {
          name
          verboseName
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { submissionId: parseInt(submissionId, 10) },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `LEETCODE_SESSION=${leetcodeSession}; csrftoken=dummy;`,
          "x-csrftoken": "dummy",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  } catch (error) {
    console.error("LeetCode API Error:", error);
    throw error;
  }
};

export const fetchActiveDailyCodingChallengeQuestion = async () => {
  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        userStatus
        link
        question {
          acRate
          difficulty
          freqBar
          frontendQuestionId: questionFrontendId
          isFavor
          paidOnly: isPaidOnly
          status
          title
          titleSlug
          hasVideoSolution
          hasSolution
          topicTags {
            name
            id
            slug
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: {},
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  } catch (error) {
    console.error("LeetCode Daily API Error:", error);
    throw error;
  }
};

/**
 * Get CSRF token from LeetCode
 */
const getCsrfToken = async (leetcodeSession: string): Promise<string> => {
  try {
    const response = await axios.get("https://leetcode.com/", {
      headers: {
        Cookie: `LEETCODE_SESSION=${leetcodeSession};`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      maxRedirects: 10,
    });

    const setCookies = response.headers["set-cookie"];
    if (setCookies) {
      for (const cookie of setCookies) {
        const match = cookie.match(/csrftoken=([^;]+)/);
        if (match) return match[1];
      }
    }

    // Fallback: check all cookies
    const allCookies = setCookies?.join("; ") || "";
    const match = allCookies.match(/csrftoken=([^;]+)/);
    return match ? match[1] : "";
  } catch (err: any) {
    const setCookies = err.response?.headers?.["set-cookie"];
    if (setCookies) {
      for (const cookie of setCookies) {
        const match = cookie.match(/csrftoken=([^;]+)/);
        if (match) return match[1];
      }
    }
    console.error("Failed to get CSRF token:", err.message);
    return "";
  }
};

/**
 * Get numeric question ID from slug using GraphQL
 */
const getQuestionId = async (
  titleSlug: string,
  leetcodeSession: string,
  csrfToken: string,
): Promise<string> => {
  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
          }
        }`,
        variables: { titleSlug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `LEETCODE_SESSION=${leetcodeSession}; csrftoken=${csrfToken};`,
          "x-csrftoken": csrfToken,
          Referer: "https://leetcode.com",
          Origin: "https://leetcode.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );

    return response.data?.data?.question?.questionId || titleSlug;
  } catch (err: any) {
    console.error("Failed to get question ID:", err.message);
    return titleSlug;
  }
};

/**
 * Submit code to LeetCode
 */
export const submitCodeToLeetCode = async (
  questionSlug: string,
  code: string,
  lang: string,
  leetcodeSession: string,
) => {
  try {
    const csrfToken = await getCsrfToken(leetcodeSession);
    if (!csrfToken) {
      throw new Error(
        "Failed to get CSRF token. Your LeetCode session may be expired.",
      );
    }
    console.log("Got CSRF token:", csrfToken.substring(0, 10) + "...");

    const questionId = await getQuestionId(
      questionSlug,
      leetcodeSession,
      csrfToken,
    );
    console.log("Got question ID:", questionId, "for slug:", questionSlug);

    const response = await axios.post(
      `https://leetcode.com/problems/${questionSlug}/submit/`,
      {
        lang: lang,
        question_id: questionId,
        typed_code: code,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `LEETCODE_SESSION=${leetcodeSession}; csrftoken=${csrfToken};`,
          "x-csrftoken": csrfToken,
          Referer: `https://leetcode.com/problems/${questionSlug}/`,
          Origin: "https://leetcode.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        // Don't throw for 4xx/5xx errors here, we want to see the body
        validateStatus: () => true,
      },
    );

    if (response.status >= 400) {
      console.error(
        `LeetCode Submission Failed (${response.status}):`,
        JSON.stringify(response.data, null, 2),
      );
      throw new Error(
        `LeetCode rejected the submission with status ${response.status}: ${JSON.stringify(response.data)}`,
      );
    }

    console.log("LeetCode submission response:", response.data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "LeetCode Submit Axios Error Status:",
        error.response.status,
      );
      console.error("LeetCode Submit Error Data:", error.response.data);
    } else {
      console.error("LeetCode Submit Error Message:", error.message);
    }
    throw error;
  }
};

/**
 * Check submission result
 */
export const checkSubmissionResult = async (
  submissionId: string,
  leetcodeSession: string,
) => {
  try {
    const response = await axios.get(
      `https://leetcode.com/submissions/detail/${submissionId}/check/`,
      {
        headers: {
          Cookie: `LEETCODE_SESSION=${leetcodeSession}; csrftoken=dummy;`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Check Submission Error:", error);
    throw error;
  }
};

/**
 * Get problem details and code snippets
 */
export const fetchProblemDetails = async (titleSlug: string) => {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        likes
        dislikes
        categoryTitle
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        sampleTestCase
        exampleTestcases
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { titleSlug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data.question;
  } catch (error) {
    console.error("Fetch Problem Details Error:", error);
    throw error;
  }
};
