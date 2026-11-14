-- The theory/learn feature queries snake_case columns (it was built on the
-- original 20260327140000_theory_learning migration). The 0_init baseline
-- recreated these tables with camelCase columns, which broke Learn on fresh
-- databases. Rename camelCase -> snake_case only where needed, so databases
-- that already have snake_case columns are untouched.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('theory_tracks','orderIndex','order_index'),
    ('theory_tracks','isPublished','is_published'),
    ('theory_tracks','createdAt','created_at'),
    ('theory_tracks','updatedAt','updated_at'),
    ('theory_modules','trackId','track_id'),
    ('theory_modules','topicId','topic_id'),
    ('theory_modules','orderIndex','order_index'),
    ('theory_modules','estimatedMinutes','estimated_minutes'),
    ('theory_modules','isPublished','is_published'),
    ('theory_modules','createdAt','created_at'),
    ('theory_modules','updatedAt','updated_at'),
    ('theory_lessons','moduleId','module_id'),
    ('theory_lessons','orderIndex','order_index'),
    ('theory_lessons','estimatedMinutes','estimated_minutes'),
    ('theory_lessons','learningObjectives','learning_objectives'),
    ('theory_lessons','isPublished','is_published'),
    ('theory_lessons','createdAt','created_at'),
    ('theory_lessons','updatedAt','updated_at'),
    ('theory_lesson_blocks','lessonId','lesson_id'),
    ('theory_lesson_blocks','blockType','block_type'),
    ('theory_lesson_blocks','orderIndex','order_index'),
    ('theory_problem_links','lessonId','lesson_id'),
    ('theory_problem_links','moduleId','module_id'),
    ('theory_problem_links','problemId','problem_id'),
    ('theory_problem_links','orderIndex','order_index'),
    ('user_theory_lesson_progress','userId','user_id'),
    ('user_theory_lesson_progress','lessonId','lesson_id'),
    ('user_theory_lesson_progress','progressPercent','progress_percent'),
    ('user_theory_lesson_progress','timeSpentSeconds','time_spent_seconds'),
    ('user_theory_lesson_progress','completedAt','completed_at'),
    ('user_theory_lesson_progress','lastSeenBlockId','last_seen_block_id'),
    ('user_theory_lesson_progress','createdAt','created_at'),
    ('user_theory_lesson_progress','updatedAt','updated_at')
  ) AS t(tbl, camel, snake)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = r.tbl AND column_name = r.camel
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = r.tbl AND column_name = r.snake
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.tbl, r.camel, r.snake);
    END IF;
  END LOOP;
END $$;
