import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newTopics = [
    { name: 'Backtracking', description: 'Explore all possible solutions', orderIndex: 12 },
    { name: 'Heaps', description: 'Priority Queue operations', orderIndex: 13 },
    { name: 'Tries', description: 'Efficient prefix search', orderIndex: 14 },
    { name: 'Bit Manipulation', description: 'Binary level optimizations', orderIndex: 15 }
  ];
  
  console.log('Upserting new topics...');
  for (const t of newTopics) {
    await prisma.topic.upsert({
      where: { name: t.name },
      update: {},
      create: t
    });
  }
  console.log('New topics added successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
