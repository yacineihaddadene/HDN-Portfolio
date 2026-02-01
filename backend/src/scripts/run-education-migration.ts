/**
 * Runs the education text→jsonb migration (backfill existing rows as { en, fr }).
 * Safe to run multiple times: only alters columns that are still text.
 */
import postgres from "postgres";
import fs from "fs";
import path from "path";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL not set, skipping education migration.");
    process.exit(0);
  }

  const sqlPath = path.join(process.cwd(), "drizzle", "0001_education_text_to_jsonb.sql");
  if (!fs.existsSync(sqlPath)) {
    console.log("Education migration file not found, skipping.");
    process.exit(0);
  }

  const sql = postgres(url, { max: 1 });
  try {
    const body = fs.readFileSync(sqlPath, "utf-8");
    await sql.unsafe(body);
    console.log("Education text→jsonb migration applied.");
  } catch (err) {
    console.error("Education migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
