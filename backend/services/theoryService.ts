import { randomUUID } from "crypto";
import { prisma } from "../db/prisma";

export const ensureTheorySchemaExists = async () => {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryDifficulty') THEN
        CREATE TYPE "TheoryDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryBlockType') THEN
        CREATE TYPE "TheoryBlockType" AS ENUM ('MARKDOWN', 'CODE', 'NOTE', 'QUIZ', 'IMAGE');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TheoryProgressStatus') THEN
        CREATE TYPE "TheoryProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_tracks (
      id uuid PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      description text NULL,
      order_index integer NOT NULL DEFAULT 0,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_modules (
      id uuid PRIMARY KEY,
      track_id uuid NOT NULL REFERENCES theory_tracks(id) ON DELETE CASCADE,
      topic_id uuid NULL REFERENCES "Topic"(id) ON DELETE SET NULL,
      slug text NOT NULL,
      title text NOT NULL,
      summary text NULL,
      order_index integer NOT NULL DEFAULT 0,
      estimated_minutes integer NOT NULL DEFAULT 0,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE(track_id, slug)
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_lessons (
      id uuid PRIMARY KEY,
      module_id uuid NOT NULL REFERENCES theory_modules(id) ON DELETE CASCADE,
      slug text NOT NULL,
      title text NOT NULL,
      summary text NULL,
      order_index integer NOT NULL DEFAULT 0,
      difficulty "TheoryDifficulty" NOT NULL DEFAULT 'BEGINNER',
      estimated_minutes integer NOT NULL DEFAULT 0,
      learning_objectives jsonb NULL,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      UNIQUE(module_id, slug)
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_lesson_blocks (
      id uuid PRIMARY KEY,
      lesson_id uuid NOT NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      block_type "TheoryBlockType" NOT NULL,
      order_index integer NOT NULL,
      content jsonb NOT NULL,
      language text NULL,
      UNIQUE(lesson_id, order_index)
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS theory_problem_links (
      id uuid PRIMARY KEY,
      lesson_id uuid NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      module_id uuid NULL REFERENCES theory_modules(id) ON DELETE CASCADE,
      problem_id uuid NOT NULL REFERENCES "Problem"(id) ON DELETE CASCADE,
      required boolean NOT NULL DEFAULT true,
      order_index integer NOT NULL DEFAULT 0
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_theory_lesson_progress (
      user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      lesson_id uuid NOT NULL REFERENCES theory_lessons(id) ON DELETE CASCADE,
      status "TheoryProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
      progress_percent integer NOT NULL DEFAULT 0,
      time_spent_seconds integer NOT NULL DEFAULT 0,
      completed_at timestamptz NULL,
      last_seen_block_id text NULL,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      PRIMARY KEY(user_id, lesson_id)
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_theory_modules_topic_id ON theory_modules(topic_id);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_theory_problem_links_lesson_id ON theory_problem_links(lesson_id);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_theory_problem_links_module_id ON theory_problem_links(module_id);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_theory_problem_links_problem_id ON theory_problem_links(problem_id);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_user_theory_lesson_progress_lesson_id ON user_theory_lesson_progress(lesson_id);`,
  );
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
