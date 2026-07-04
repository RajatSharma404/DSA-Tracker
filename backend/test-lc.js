const axios = require("axios");

async function test(username) {
  const query = `
    query userPublicProfile($username: String!) {
      recentSubmissionList(username: $username, limit: 100) {
        title
        titleSlug
        timestamp
        statusDisplay
      }
    }
  `;

  try {
    const res = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username }
    });
    const submissions = res.data.data.recentSubmissionList || [];
    const accepted = submissions.filter(s => s.statusDisplay === "Accepted");
    
    // count unique
    const unique = new Set(accepted.map(s => s.titleSlug));
    console.log("Total recent submissions:", submissions.length);
    console.log("Accepted submissions:", accepted.length);
    console.log("Unique accepted problems:", unique.size);
  } catch (err) {
    console.error(err.message);
  }
}

test("rajatsharma404");
