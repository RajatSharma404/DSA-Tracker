const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();

  const lessons = await p.theoryLesson.findMany({
    select: {
      id: true,
      title: true,
      isPublished: true,
      module: { select: { orderIndex: true, title: true } },
    },
  });

  console.log("\n=== PUBLISHED LESSONS ===");
  const published = lessons.filter((l) => l.isPublished);
  console.log(`Total: ${published.length}`);
  published
    .slice(0, 5)
    .forEach((l) =>
      console.log(`${l.module.orderIndex}. ${l.module.title} → ${l.title}`),
    );

  console.log("\n=== UNPUBLISHED LESSONS ===");
  const unpublished = lessons.filter((l) => !l.isPublished);
  console.log(`Total: ${unpublished.length}`);
  unpublished
    .slice(0, 5)
    .forEach((l) =>
      console.log(`${l.module.orderIndex}. ${l.module.title} → ${l.title}`),
    );

  const tracks = await p.theoryTrack.findMany({
    select: { slug: true, title: true, isPublished: true },
  });

  console.log("\n=== TRACKS ===");
  tracks.forEach((t) =>
    console.log(`[${t.isPublished ? "YES" : "NO"}] ${t.title}`),
  );

  await p.$disconnect();
})();
