-- Better Auth tables for Drizzle adapter

CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "role" TEXT DEFAULT 'CUSTOMER',
  "locale" TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Account lockout tracking
CREATE TABLE IF NOT EXISTS "login_attempt" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "ipAddress" TEXT,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "attemptedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "userAgent" TEXT
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS "login_attempt_email_idx" ON "login_attempt"("email", "attemptedAt");
CREATE INDEX IF NOT EXISTS "login_attempt_ip_idx" ON "login_attempt"("ipAddress", "attemptedAt");

-- Token blacklist for revoked JWTs
CREATE TABLE IF NOT EXISTS "token_blacklist" (
  "id" TEXT PRIMARY KEY,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "revokedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "reason" TEXT
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS "token_blacklist_hash_idx" ON "token_blacklist"("tokenHash");
CREATE INDEX IF NOT EXISTS "token_blacklist_user_idx" ON "token_blacklist"("userId");

-- Audit log for authentication events
CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "eventType" TEXT NOT NULL,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS "audit_log_user_idx" ON "audit_log"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_log_event_idx" ON "audit_log"("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_log_created_idx" ON "audit_log"("createdAt");

-- User IP history for tracking login locations
CREATE TABLE IF NOT EXISTS "user_ip_history" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "ipAddress" TEXT NOT NULL,
  "firstSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
  "loginCount" TEXT NOT NULL DEFAULT '1'
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS "user_ip_history_user_idx" ON "user_ip_history"("userId", "lastSeen");
CREATE INDEX IF NOT EXISTS "user_ip_history_ip_idx" ON "user_ip_history"("ipAddress");

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS "user_ip_history_user_idx" ON "user_ip_history"("userId", "lastSeen");
CREATE INDEX IF NOT EXISTS "user_ip_history_ip_idx" ON "user_ip_history"("ipAddress");

