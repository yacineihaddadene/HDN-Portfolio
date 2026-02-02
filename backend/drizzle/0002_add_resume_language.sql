-- Add language column to resumes table
ALTER TABLE "resumes" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'en' NOT NULL;

-- Create index on language for faster queries
CREATE INDEX IF NOT EXISTS "resumes_language_idx" ON "resumes" ("language");

-- Create index on language + isActive for faster queries
CREATE INDEX IF NOT EXISTS "resumes_language_active_idx" ON "resumes" ("language", "is_active");
