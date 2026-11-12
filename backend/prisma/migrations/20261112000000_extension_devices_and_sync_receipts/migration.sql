-- CreateTable
CREATE TABLE "extension_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY['sync:write']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "extension_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_receipts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extension_devices_tokenHash_key" ON "extension_devices"("tokenHash");

-- CreateIndex
CREATE INDEX "extension_devices_userId_idx" ON "extension_devices"("userId");

-- CreateIndex
CREATE INDEX "sync_receipts_userId_syncedAt_idx" ON "sync_receipts"("userId", "syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sync_receipts_userId_submissionId_key" ON "sync_receipts"("userId", "submissionId");

-- AddForeignKey
ALTER TABLE "extension_devices" ADD CONSTRAINT "extension_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_receipts" ADD CONSTRAINT "sync_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

