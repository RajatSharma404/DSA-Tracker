-- AlterTable
ALTER TABLE "review_logs" ADD COLUMN IF NOT EXISTS "clientEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "review_logs_userId_clientEventId_key" ON "review_logs"("userId", "clientEventId");

