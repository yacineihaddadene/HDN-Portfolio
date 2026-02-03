-- Migration: Convert testimonials.message from text to jsonb for bilingual support
-- This migration converts existing text messages to bilingual jsonb format

-- Step 1: Add a temporary jsonb column
ALTER TABLE "testimonials" ADD COLUMN "message_temp" jsonb;

-- Step 2: Migrate existing data - duplicate message to both languages
UPDATE "testimonials" 
SET "message_temp" = jsonb_build_object('en', message, 'fr', message)
WHERE "message_temp" IS NULL;

-- Step 3: Drop the old text column
ALTER TABLE "testimonials" DROP COLUMN "message";

-- Step 4: Rename the temp column to message
ALTER TABLE "testimonials" RENAME COLUMN "message_temp" TO "message";

-- Step 5: Add NOT NULL constraint
ALTER TABLE "testimonials" ALTER COLUMN "message" SET NOT NULL;
