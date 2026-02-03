-- Create About table
CREATE TABLE IF NOT EXISTS "about" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "welcome_text" jsonb NOT NULL,
  "main_heading" jsonb NOT NULL,
  "subtext" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert default about data
INSERT INTO "about" ("welcome_text", "main_heading", "subtext")
VALUES (
  '{"en": "WELCOME TO MY PORTFOLIO", "fr": "BIENVENUE SUR MON PORTFOLIO"}',
  '{"en": "I craft digital experiences that resonate", "fr": "Je crée des expériences numériques qui résonnent"}',
  '{"en": "Explore my work, skills, and professional journey", "fr": "Découvrez mon travail, mes compétences et mon parcours professionnel"}'
)
ON CONFLICT DO NOTHING;
