const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  const modules = await p.theoryModule.findMany({
    select: { orderIndex: true, title: true, isPublished: true },
  });

  console.log("\n=== PUBLISHED MODULES ===");
  const published = modules.filter((m) => m.isPublished);
  console.log(`Total: ${published.length}`);
  published.forEach((m) => console.log(`${m.orderIndex}. ${m.title}`));

  console.log("\n=== UNPUBLISHED MODULES ===");
  const unpublished = modules.filter((m) => !m.isPublished);
  console.log(`Total: ${unpublished.length}`);
  unpublished.forEach((m) => console.log(`${m.orderIndex}. ${m.title}`));

  await p.$disconnect();
})();
