-- CreateIndex
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Problem_topicId_orderIndex_idx" ON "Problem"("topicId", "orderIndex");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Problem_difficulty_idx" ON "Problem"("difficulty");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "problem_notes_userId_updatedAt_idx" ON "problem_notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Progress_userId_status_idx" ON "Progress"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Progress_userId_status_nextReviewDate_idx" ON "Progress"("userId", "status", "nextReviewDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Progress_userId_completedAt_idx" ON "Progress"("userId", "completedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Progress_problemId_idx" ON "Progress"("problemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MockInterview_userId_date_idx" ON "MockInterview"("userId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "solution_history_userId_createdAt_idx" ON "solution_history"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bookmarks_userId_createdAt_idx" ON "bookmarks"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "problem_tags_tagId_idx" ON "problem_tags"("tagId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_theory_lesson_progress_userId_status_idx" ON "user_theory_lesson_progress"("userId", "status");
