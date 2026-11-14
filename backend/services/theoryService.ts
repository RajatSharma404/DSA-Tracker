import { randomUUID } from "crypto";
import { prisma } from "../db/prisma";

/**
 * The theory tables are created by Prisma migrations. This used to recreate
 * them with raw SQL using snake_case columns, which no longer matched the
 * migrated (camelCase) schema and failed on every Learn request. Now it only
 * verifies they exist.
 */
export const ensureTheorySchemaExists = async () => {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: string | null }>>(
    `SELECT to_regclass('public.theory_tracks')::text AS "exists"`,
  );
  if (!rows[0]?.exists) {
    throw new Error("Theory tables are missing. Run `npx prisma migrate deploy` in backend/.");
  }
};

export const seedStarterTheoryContent = async () => {
  await ensureTheorySchemaExists();

  const publishedTrackCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM theory_tracks WHERE is_published = true
  `;

  if (Number(publishedTrackCount[0]?.count || 0) > 0) {
    return {
      seeded: false,
      tracks: 0,
      modules: 0,
      lessons: 0,
      message: "Published theory data already exists",
    };
  }

  const totalTrackCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM theory_tracks
  `;

  if (Number(totalTrackCount[0]?.count || 0) > 0) {
    await prisma.$executeRaw`
      UPDATE theory_tracks
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;

    await prisma.$executeRaw`
      UPDATE theory_modules
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;

    await prisma.$executeRaw`
      UPDATE theory_lessons
      SET is_published = true, updated_at = NOW()
      WHERE is_published = false
    `;

    return {
      seeded: false,
      tracks: 0,
      modules: 0,
      lessons: 0,
      message: "Published existing theory data",
    };
  }

  const arraysTopic = await prisma.topic.findFirst({
    where: { name: { contains: "Array", mode: "insensitive" } },
  });
  const starterProblems = await prisma.problem.findMany({
    where: arraysTopic ? { topicId: arraysTopic.id } : undefined,
    orderBy: [{ orderIndex: "asc" }],
    take: 3,
  });

  const trackId = randomUUID();
  const moduleId = randomUUID();
  const lessonOneId = randomUUID();
  const lessonTwoId = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO theory_tracks (id, slug, title, description, order_index, is_published, created_at, updated_at)
    VALUES (
      ${trackId},
      'cpp-foundations',
      'C++ Foundations',
      'Learn core C++ theory before solving DSA questions.',
      1,
      true,
      NOW(),
      NOW()
    )
  `;

  await prisma.$executeRaw`
    INSERT INTO theory_modules (id, track_id, topic_id, slug, title, summary, order_index, estimated_minutes, is_published, created_at, updated_at)
    VALUES (
      ${moduleId},
      ${trackId},
      ${arraysTopic?.id || null},
      'cpp-basics-for-dsa',
      'C++ Basics For DSA',
      'Syntax, data structures, and complexity thinking with C++.',
      1,
      45,
      true,
      NOW(),
      NOW()
    )
  `;

  await prisma.$executeRaw`
    INSERT INTO theory_lessons (id, module_id, slug, title, summary, order_index, difficulty, estimated_minutes, learning_objectives, is_published, created_at, updated_at)
    VALUES (
      ${lessonOneId},
      ${moduleId},
      'cpp-setup-and-complexity',
      'C++ Setup and Big-O',
      'Understand compilation, STL basics, and runtime complexity.',
      1,
      'BEGINNER',
      20,
      ${JSON.stringify([
        "Understand O(1), O(log n), O(n), O(n log n)",
        "Write fast I/O boilerplate in C++",
        "Know when vectors vs arrays matter",
      ])}::jsonb,
      true,
      NOW(),
      NOW()
    )
  `;

  await prisma.$executeRaw`
    INSERT INTO theory_lessons (id, module_id, slug, title, summary, order_index, difficulty, estimated_minutes, learning_objectives, is_published, created_at, updated_at)
    VALUES (
      ${lessonTwoId},
      ${moduleId},
      'cpp-hashmap-and-two-pointer',
      'HashMap and Two Pointer Patterns',
      'Theory behind two most common interview patterns.',
      2,
      'BEGINNER',
      25,
      ${JSON.stringify([
        "Identify when to use unordered_map",
        "Convert brute force to linear scans",
        "Avoid common two-pointer edge cases",
      ])}::jsonb,
      true,
      NOW(),
      NOW()
    )
  `;

  const lessonOneBlocks = [
    {
      type: "MARKDOWN",
      content: {
        markdown:
          "### Why theory before problems?\nStrong fundamentals reduce trial-and-error coding and improve interview speed.",
      },
    },
    {
      type: "CODE",
      content: {
        title: "Fast I/O template",
        code: "ios_base::sync_with_stdio(false);\ncin.tie(nullptr);",
      },
      language: "cpp",
    },
    {
      type: "NOTE",
      content: {
        markdown:
          "For many DSA questions, reducing nested loops to one pass is the main optimization goal.",
      },
    },
  ];

  for (let i = 0; i < lessonOneBlocks.length; i++) {
    const block = lessonOneBlocks[i];
    await prisma.$executeRaw`
      INSERT INTO theory_lesson_blocks (id, lesson_id, block_type, order_index, content, language)
      VALUES (
        ${randomUUID()},
        ${lessonOneId},
        ${block.type}::"TheoryBlockType",
        ${i + 1},
        ${JSON.stringify(block.content)}::jsonb,
        ${block.language || null}
      )
    `;
  }

  const lessonTwoBlocks = [
    {
      type: "MARKDOWN",
      content: {
        markdown:
          "### Hash map pattern\nUse value->index maps when you need complement lookup in constant average time.",
      },
    },
    {
      type: "MARKDOWN",
      content: {
        markdown:
          "### Two pointer pattern\nUse left/right pointers on sorted data when target conditions depend on pair sums or windows.",
      },
    },
  ];

  for (let i = 0; i < lessonTwoBlocks.length; i++) {
    const block = lessonTwoBlocks[i];
    await prisma.$executeRaw`
      INSERT INTO theory_lesson_blocks (id, lesson_id, block_type, order_index, content, language)
      VALUES (
        ${randomUUID()},
        ${lessonTwoId},
        ${block.type}::"TheoryBlockType",
        ${i + 1},
        ${JSON.stringify(block.content)}::jsonb,
        NULL
      )
    `;
  }

  for (let i = 0; i < starterProblems.length; i++) {
    await prisma.$executeRaw`
      INSERT INTO theory_problem_links (id, lesson_id, module_id, problem_id, required, order_index)
      VALUES (
        ${randomUUID()},
        ${lessonTwoId},
        NULL,
        ${starterProblems[i].id},
        true,
        ${i + 1}
      )
    `;
  }

  return {
    seeded: true,
    tracks: 1,
    modules: 1,
    lessons: 2,
  };
};
