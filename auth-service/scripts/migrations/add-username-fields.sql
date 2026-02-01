-- Migration: Add username and displayUsername fields to user table
-- This migration adds support for username authentication via Better Auth username plugin

-- Add username field (normalized, unique)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE;

-- Add displayUsername field (original casing, unique)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "displayUsername" TEXT UNIQUE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_username_idx" ON "user"("username");
CREATE INDEX IF NOT EXISTS "user_displayUsername_idx" ON "user"("displayUsername");

