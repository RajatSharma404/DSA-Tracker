const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function listAllTracks() {
  try {
    const tracks = await prisma.theoryTrack.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        orderIndex: true,
        createdAt: true,
        _count: { select: { modules: true } },
      },
      orderBy: [
        { isPublished: "desc" },
        { orderIndex: "asc" },
        { createdAt: "asc" },
      ],
    });

    console.log("\n=== ALL TRACKS (in API order) ===\n");
    tracks.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.title}`);
      console.log(`   slug: ${t.slug}`);
      console.log(`   id: ${t.id}`);
      console.log(`   modules: ${t._count.modules}`);
      console.log(`   published: ${t.isPublished}`);
      console.log(`   orderIndex: ${t.orderIndex}`);
      console.log();
    });
  } finally {
    await prisma.$disconnect();
  }
}

listAllTracks();
