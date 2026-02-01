ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;
CREATE INDEX IF NOT EXISTS "user_deleted_at_idx" ON "user"("deletedAt") WHERE "deletedAt" IS NULL;
