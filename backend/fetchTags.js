async function fetchTags() {
  const query = `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) { problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip filters: $filters) { data { frontendQuestionId: questionFrontendId titleSlug topicTags { name slug } } } }`;
  
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { categorySlug: '', skip: 0, limit: 10, filters: {} }
      })
    });
    const json = await res.json();
    const data = json.data.problemsetQuestionList.data;
    console.log(`Fetched ${data.length} problems with tags.`);
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
  } catch (err) {
    console.error(err);
  }
}
fetchTags();
