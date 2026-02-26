import axios from 'axios';

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
      recentSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        timestamp
        statusDisplay
      }
    }
  `;

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error) {
    console.error('LeetCode API Error:', error);
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
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};
