-- Convert education degree, institution, location, description from text to jsonb
-- Backfill existing rows as { "en": "<value>", "fr": "<value>" }
-- Idempotent: only alters when column type is still text
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'education' AND column_name = 'degree';
  IF col_type = 'text' THEN
    ALTER TABLE "education" ALTER COLUMN "degree" TYPE jsonb USING jsonb_build_object('en', "degree", 'fr', "degree");
    ALTER TABLE "education" ALTER COLUMN "degree" SET NOT NULL;
  END IF;

  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'education' AND column_name = 'institution';
  IF col_type = 'text' THEN
    ALTER TABLE "education" ALTER COLUMN "institution" TYPE jsonb USING jsonb_build_object('en', "institution", 'fr', "institution");
    ALTER TABLE "education" ALTER COLUMN "institution" SET NOT NULL;
  END IF;

  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'education' AND column_name = 'location';
  IF col_type = 'text' THEN
    ALTER TABLE "education" ALTER COLUMN "location" TYPE jsonb USING jsonb_build_object('en', "location", 'fr', "location");
    ALTER TABLE "education" ALTER COLUMN "location" SET NOT NULL;
  END IF;

  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'education' AND column_name = 'description';
  IF col_type = 'text' THEN
    ALTER TABLE "education" ALTER COLUMN "description" TYPE jsonb USING (
      CASE WHEN "description" IS NULL THEN NULL ELSE jsonb_build_object('en', "description", 'fr', "description") END
    );
  END IF;
END $$;
