-- Migration: Convert contact_info value to JSONB for bilingual support

-- Step 1: Add a temporary JSONB column
ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "value_new" jsonb;

-- Step 2: Migrate existing data to the new format (set both en and fr to the same value initially)
UPDATE "contact_info" 
SET "value_new" = jsonb_build_object('en', "value", 'fr', "value")
WHERE "value_new" IS NULL;

-- Step 3: Drop the old text column
ALTER TABLE "contact_info" DROP COLUMN IF EXISTS "value";

-- Step 4: Rename the new column to 'value'
ALTER TABLE "contact_info" RENAME COLUMN "value_new" TO "value";

-- Step 5: Make the column NOT NULL
ALTER TABLE "contact_info" ALTER COLUMN "value" SET NOT NULL;
