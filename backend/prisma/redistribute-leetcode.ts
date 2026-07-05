import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAG_TO_TOPIC: Record<string, string> = {
  "Array": "Arrays",
  "Hash Table": "Hashing",
  "Two Pointers": "Two Pointers",
  "Sliding Window": "Sliding Window",
  "Stack": "Stack",
  "Binary Search": "Binary Search",
  "Linked List": "Linked List",
  "Tree": "Trees",
  "Binary Tree": "Trees",
  "Binary Search Tree": "Trees",
  "Graph": "Graphs",
  "Breadth-First Search": "Graphs",
  "Depth-First Search": "Graphs",
  "Dynamic Programming": "Dynamic Programming",
  "Memoization": "Dynamic Programming",
  "Queue": "Queue & Deque",
  "Heap (Priority Queue)": "Heap / Priority Queue",
  "String": "Strings",
  "Recursion": "Recursion & Backtracking",
  "Backtracking": "Recursion & Backtracking",
  "Greedy": "Greedy",
  "Bit Manipulation": "Bit Manipulation",
  "Math": "Math & Number Theory",
  "Number Theory": "Math & Number Theory",
  "Geometry": "Math & Number Theory",
  "Sorting": "Sorting & Searching",
  "Trie": "Tries",
  "Union Find": "Disjoint Set Union (Union-Find)",
  "Monotonic Stack": "Monotonic Stack",
  "Shortest Path": "Advanced Graphs",
  "Topological Sort": "Advanced Graphs",
  "Minimum Spanning Tree": "Advanced Graphs",
  "Matrix": "Matrix / 2D Arrays",
};

async function fetchLeetCodeTags(): Promise<Record<string, string[]>> {
  const query = `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) { problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip filters: $filters) { data { titleSlug topicTags { name slug } } } }`;
  
  const tagMap: Record<string, string[]> = {};
  
  let skip = 0;
  const limit = 100;
  
  try {
    while (true) {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { categorySlug: '', skip, limit, filters: {} }
        })
      });
      const json = await res.json();
      const data = json.data.problemsetQuestionList.data;
      
      if (!data || data.length === 0) break;
      
      for (const p of data) {
        tagMap[p.titleSlug] = p.topicTags.map((t: any) => t.name);
      }
      
      console.log(`Fetched tags for ${Object.keys(tagMap).length} LeetCode problems...`);
      skip += limit;
      
      // Safety limit (first 3500 problems should cover most)
      if (skip >= 3500) break;
    }
  } catch (err) {
    console.error("Failed to fetch LeetCode tags:", err);
  }
  
  return tagMap;
}

async function main() {
  console.log("Starting redistribution...");
  
  // 1. Get the source topic
  // Because they were moved to the fallback, we'll grab from fallback where we know there are 1000 items
  const sourceTopic = await prisma.topic.findUnique({
    where: { name: "Extra Practice (Auto-Synced)" }
  });
  
  if (!sourceTopic) {
    console.log("Source topic not found. Exiting.");
    return;
  }
  
  // 2. Get problems in source topic
  const problems = await prisma.problem.findMany({
    where: { topicId: sourceTopic.id }
  });
  
  console.log(`Found ${problems.length} problems to redistribute from fallback topic.`);
  
  // 3. Get all DB topics and map name to ID
  const dbTopicsList = await prisma.topic.findMany();
  const dbTopics: Record<string, string> = {};
  
  for (const t of dbTopicsList) {
    dbTopics[t.name] = t.id;
  }
  
  const fallbackTopicId = sourceTopic.id;
  
  // 4. Fetch LC tags mapping
  const lcTags = await fetchLeetCodeTags();
  
  // 5. Update problems
  let updatedCount = 0;
  
  for (const problem of problems) {
    const match = problem.link?.match(/problems\/([^\/]+)/);
    const slug = match ? match[1] : null;
    
    let targetTopicId = fallbackTopicId;
    
    if (slug && lcTags[slug]) {
      const tags = lcTags[slug];
      for (const tag of tags) {
        if (TAG_TO_TOPIC[tag] && dbTopics[TAG_TO_TOPIC[tag]]) {
          targetTopicId = dbTopics[TAG_TO_TOPIC[tag]];
          break;
        }
      }
    }
    
    if (targetTopicId !== sourceTopic.id) {
      await prisma.problem.update({
        where: { id: problem.id },
        data: { topicId: targetTopicId }
      });
      updatedCount++;
    }
  }
  
  console.log(`Successfully redistributed ${updatedCount} problems to core topics.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
