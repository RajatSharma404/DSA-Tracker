import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'user@dsatracker.local' },
    update: {},
    create: {
      email: 'user@dsatracker.local',
      name: 'DSA Pro User',
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
        }
      }
    },
  });

  const seedDataPath = path.join(__dirname, '../../dsa-roadmap-seed.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

  for (const topicData of seedData.topics) {
    const topic = await prisma.topic.upsert({
      where: { name: topicData.name },
      update: {
        description: topicData.description,
        orderIndex: topicData.order,
      },
      create: {
        name: topicData.name,
        description: topicData.description,
        orderIndex: topicData.order,
      }
    });

    for (const problemData of topicData.problems) {
      // Find matches by title within this topic to avoid duplicates
      const existingProblem = await prisma.problem.findFirst({
        where: {
          title: problemData.title,
          topicId: topic.id,
        }
      });

      if (existingProblem) {
        await prisma.problem.update({
          where: { id: existingProblem.id },
          data: {
            link: problemData.leetcode,
            difficulty: problemData.difficulty.toUpperCase() as any,
            orderIndex: problemData.order,
          }
        });
      } else {
        await prisma.problem.create({
          data: {
            title: problemData.title,
            link: problemData.leetcode,
            difficulty: problemData.difficulty.toUpperCase() as any,
            orderIndex: problemData.order,
            topicId: topic.id,
          }
        });
      }
    }
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
