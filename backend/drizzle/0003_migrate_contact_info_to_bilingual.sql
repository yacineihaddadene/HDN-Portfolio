-- Migrate contact_info value column to JSONB bilingual format
-- This migration handles the case where value might be a plain text string

-- Step 1: Create a temporary column
ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "value_temp" jsonb;

-- Step 2: Migrate existing data - convert plain text to bilingual format
UPDATE "contact_info" 
SET "value_temp" = jsonb_build_object(
  'en', CASE 
    WHEN value::text LIKE '{%' THEN value->>'en'
    ELSE value::text
  END,
  'fr', CASE 
    WHEN value::text LIKE '{%' THEN value->>'fr'
    ELSE value::text
  END
)
WHERE "value_temp" IS NULL;

-- Step 3: Drop old column and rename temp column
ALTER TABLE "contact_info" DROP COLUMN IF EXISTS "value";
ALTER TABLE "contact_info" RENAME COLUMN "value_temp" TO "value";

-- Step 4: Add NOT NULL constraint
ALTER TABLE "contact_info" ALTER COLUMN "value" SET NOT NULL;
