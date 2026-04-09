const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  const modules = await p.theoryModule.findMany({
    orderBy: { orderIndex: "asc" },
    select: { orderIndex: true, title: true },
  });
  console.log(`\nTotal topics in database: ${modules.length}\n`);
  modules.forEach((m) => console.log(`${m.orderIndex}. ${m.title}`));
  await p.$disconnect();
})();
