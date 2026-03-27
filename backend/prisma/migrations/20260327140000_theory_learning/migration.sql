-- Theory learning track schema

CREATE TYPE "TheoryDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "TheoryBlockType" AS ENUM ('MARKDOWN', 'CODE', 'NOTE', 'QUIZ', 'IMAGE');
CREATE TYPE "TheoryProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "theory_tracks" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "theory_tracks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "theory_modules" (
  "id" TEXT NOT NULL,
  "track_id" TEXT NOT NULL,
  "topic_id" TEXT,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "theory_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "theory_lessons" (
  "id" TEXT NOT NULL,
  "module_id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "difficulty" "TheoryDifficulty" NOT NULL DEFAULT 'BEGINNER',
  "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
  "learning_objectives" JSONB,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "theory_lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "theory_lesson_blocks" (
  "id" TEXT NOT NULL,
  "lesson_id" TEXT NOT NULL,
  "block_type" "TheoryBlockType" NOT NULL,
  "order_index" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "language" TEXT,
  CONSTRAINT "theory_lesson_blocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "theory_problem_links" (
  "id" TEXT NOT NULL,
  "lesson_id" TEXT,
  "module_id" TEXT,
  "problem_id" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "theory_problem_links_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "theory_problem_links_target_check" CHECK ("lesson_id" IS NOT NULL OR "module_id" IS NOT NULL)
);

CREATE TABLE "user_theory_lesson_progress" (
  "user_id" TEXT NOT NULL,
  "lesson_id" TEXT NOT NULL,
  "status" "TheoryProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "progress_percent" INTEGER NOT NULL DEFAULT 0,
  "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
  "completed_at" TIMESTAMP(3),
  "last_seen_block_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_theory_lesson_progress_pkey" PRIMARY KEY ("user_id", "lesson_id"),
  CONSTRAINT "user_theory_lesson_progress_percent_check" CHECK ("progress_percent" >= 0 AND "progress_percent" <= 100)
);

CREATE UNIQUE INDEX "theory_tracks_slug_key" ON "theory_tracks"("slug");
CREATE UNIQUE INDEX "theory_modules_track_id_slug_key" ON "theory_modules"("track_id", "slug");
CREATE UNIQUE INDEX "theory_lessons_module_id_slug_key" ON "theory_lessons"("module_id", "slug");
CREATE UNIQUE INDEX "theory_lesson_blocks_lesson_id_order_index_key" ON "theory_lesson_blocks"("lesson_id", "order_index");

CREATE INDEX "theory_modules_topic_id_idx" ON "theory_modules"("topic_id");
CREATE INDEX "theory_problem_links_lesson_id_idx" ON "theory_problem_links"("lesson_id");
CREATE INDEX "theory_problem_links_module_id_idx" ON "theory_problem_links"("module_id");
CREATE INDEX "theory_problem_links_problem_id_idx" ON "theory_problem_links"("problem_id");
CREATE INDEX "user_theory_lesson_progress_lesson_id_idx" ON "user_theory_lesson_progress"("lesson_id");

ALTER TABLE "theory_modules"
  ADD CONSTRAINT "theory_modules_track_id_fkey"
  FOREIGN KEY ("track_id") REFERENCES "theory_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "theory_modules"
  ADD CONSTRAINT "theory_modules_topic_id_fkey"
  FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "theory_lessons"
  ADD CONSTRAINT "theory_lessons_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "theory_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "theory_lesson_blocks"
  ADD CONSTRAINT "theory_lesson_blocks_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "theory_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "theory_problem_links"
  ADD CONSTRAINT "theory_problem_links_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "theory_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "theory_problem_links"
  ADD CONSTRAINT "theory_problem_links_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "theory_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "theory_problem_links"
  ADD CONSTRAINT "theory_problem_links_problem_id_fkey"
  FOREIGN KEY ("problem_id") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_theory_lesson_progress"
  ADD CONSTRAINT "user_theory_lesson_progress_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_theory_lesson_progress"
  ADD CONSTRAINT "user_theory_lesson_progress_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "theory_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
