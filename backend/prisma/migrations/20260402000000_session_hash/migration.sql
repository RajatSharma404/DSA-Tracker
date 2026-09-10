-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "leetcodeSessionHash" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_leetcodeSessionHash_idx" ON "User"("leetcodeSessionHash");
