const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();

  // Check the track
  const track = await p.theoryTrack.findFirst({
    where: { slug: "complete-dsa-bootcamp" },
    select: {
      id: true,
      title: true,
      isPublished: true,
      _count: { select: { modules: true } },
    },
  });

  console.log("\n=== TRACK IN DB ===");
  console.log(`Title: ${track.title}`);
  console.log(`Published: ${track.isPublished}`);
  console.log(`Modules in DB: ${track._count.modules}`);

  // Get all modules for this track
  const modules = await p.theoryModule.findMany({
    where: { trackId: track.id },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      orderIndex: true,
      title: true,
      isPublished: true,
      _count: { select: { lessons: true } },
    },
  });

  console.log(`\n=== MODULES (${modules.length} total) ===`);
  const published = modules.filter((m) => m.isPublished);
  const unpublished = modules.filter((m) => !m.isPublished);
  console.log(`Published: ${published.length}`);
  console.log(`Unpublished: ${unpublished.length}`);
  if (unpublished.length > 0) {
    console.log("\n⚠️  UNPUBLISHED MODULES:");
    unpublished.forEach((m) => console.log(`  ${m.orderIndex}. ${m.title}`));
  }
  modules.forEach((m) => {
    console.log(
      `${m.orderIndex}. [${m.isPublished ? "PUB" : "UNP"}] ${m.title} (${m._count.lessons} lessons)`,
    );
  });

  // Check if all lessons are published
  const lessons = await p.theoryLesson.findMany({
    where: { module: { trackId: track.id } },
    select: {
      id: true,
      title: true,
      isPublished: true,
      module: { select: { orderIndex: true, title: true } },
    },
  });

  console.log(`\n=== LESSONS (${lessons.length} total) ===`);
  const unpub = lessons.filter((l) => !l.isPublished);
  console.log(`Published: ${lessons.length - unpub.length}`);
  console.log(`Unpublished: ${unpub.length}`);
  if (unpub.length > 0) {
    unpub.forEach((l) =>
      console.log(`  [UNP] ${l.module.orderIndex}. ${l.title}`),
    );
  }

  await p.$disconnect();
})();
