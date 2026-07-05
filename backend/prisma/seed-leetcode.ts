import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching LeetCode problems...');
  
  const response = await fetch('https://leetcode.com/api/problems/algorithms/');
  if (!response.ok) {
    throw new Error(`Failed to fetch from LeetCode: ${response.statusText}`);
  }
  
  const data = await response.json();
  const pairs = data.stat_status_pairs || [];
  
  console.log(`Found ${pairs.length} total problems.`);
  
  // Filter for free, non-hidden problems
  const freeProblems = pairs.filter((p: any) => !p.paid_only && !p.stat.question__hide);
  
  // Take exactly 1000 problems (or all if less than 1000)
  const problemsToInsert = freeProblems.slice(0, 1000);
  
  console.log(`Selected ${problemsToInsert.length} free problems to insert.`);
  
  // Create or get the "LeetCode Algorithms" topic
  const topicName = "LeetCode Algorithms";
  let topic = await prisma.topic.findUnique({
    where: { name: topicName }
  });
  
  if (!topic) {
    topic = await prisma.topic.create({
      data: {
        name: topicName,
        description: "A bulk collection of 1000 algorithms problems from LeetCode.",
        orderIndex: 999, // Push to the end of the roadmap
      }
    });
    console.log(`Created new topic: ${topicName}`);
  } else {
    console.log(`Found existing topic: ${topicName}`);
  }
  
  // Map difficulty levels
  const getDifficulty = (level: number): Difficulty => {
    switch (level) {
      case 1: return Difficulty.EASY;
      case 2: return Difficulty.MEDIUM;
      case 3: return Difficulty.HARD;
      default: return Difficulty.EASY;
    }
  };
  
  console.log('Formatting data for Prisma...');
  const prismaProblems = problemsToInsert.map((p: any, index: number) => {
    return {
      title: `${p.stat.frontend_question_id}. ${p.stat.question__title}`,
      link: `https://leetcode.com/problems/${p.stat.question__title_slug}/`,
      difficulty: getDifficulty(p.difficulty.level),
      topicId: topic.id,
      orderIndex: index,
    };
  });
  
  console.log('Inserting into database...');
  // Use createMany to bulk insert
  const result = await prisma.problem.createMany({
    data: prismaProblems,
    skipDuplicates: true, // In case script is run multiple times
  });
  
  console.log(`Successfully inserted ${result.count} problems!`);
}

main()
  .catch((e) => {
    console.error('Error seeding LeetCode data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
