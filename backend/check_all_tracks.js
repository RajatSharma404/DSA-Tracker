const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAllTracks() {
  try {
    const tracks = await prisma.theoryTrack.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        orderIndex: true,
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("=== ALL TRACKS IN DATABASE ===\n");
    tracks.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.title}`);
      console.log(`   slug: ${t.slug}`);
      console.log(`   published: ${t.isPublished}`);
      console.log(`   modules: ${t._count.modules}`);
      console.log(`   orderIndex: ${t.orderIndex}`);
      console.log();
    });
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTracks();
