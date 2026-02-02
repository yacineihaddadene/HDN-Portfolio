/**
 * Script to migrate contact_info table to use JSONB bilingual fields
 * Run this script to update the database schema
 */

import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function migrateContactInfo() {
  console.log("Starting contact_info migration...");

  try {
    // Step 1: Add a temporary JSONB column
    console.log("Step 1: Adding temporary JSONB column...");
    await db.execute(sql`
      ALTER TABLE "contact_info" 
      ADD COLUMN IF NOT EXISTS "value_new" jsonb
    `);

    // Step 2: Migrate existing data to the new format
    console.log("Step 2: Migrating existing data...");
    await db.execute(sql`
      UPDATE "contact_info" 
      SET "value_new" = jsonb_build_object('en', "value", 'fr', "value")
      WHERE "value_new" IS NULL
    `);

    // Step 3: Drop the old text column
    console.log("Step 3: Dropping old column...");
    await db.execute(sql`
      ALTER TABLE "contact_info" 
      DROP COLUMN IF EXISTS "value"
    `);

    // Step 4: Rename the new column to 'value'
    console.log("Step 4: Renaming new column...");
    await db.execute(sql`
      ALTER TABLE "contact_info" 
      RENAME COLUMN "value_new" TO "value"
    `);

    // Step 5: Make the column NOT NULL
    console.log("Step 5: Setting NOT NULL constraint...");
    await db.execute(sql`
      ALTER TABLE "contact_info" 
      ALTER COLUMN "value" SET NOT NULL
    `);

    console.log("✅ Contact info migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  }
}

// Run migration
migrateContactInfo()
  .then(() => {
    console.log("Migration finished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
