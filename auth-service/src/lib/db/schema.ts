import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").default("CUSTOMER"),
  locale: text("locale").default("en"),
  username: text("username").unique(),
  displayUsername: text("displayUsername").unique(),
  deletedAt: timestamp("deletedAt"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Account lockout tracking
export const loginAttempt = pgTable("login_attempt", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ipAddress"),
  success: boolean("success").notNull().default(false),
  attemptedAt: timestamp("attemptedAt").notNull().defaultNow(),
  userAgent: text("userAgent"),
});

// Token blacklist for revoked JWTs
export const tokenBlacklist = pgTable("token_blacklist", {
  id: text("id").primaryKey(),
  tokenHash: text("tokenHash").notNull().unique(), // SHA-256 hash of the token
  userId: text("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // When the token would have expired
  revokedAt: timestamp("revokedAt").notNull().defaultNow(),
  reason: text("reason"), // logout, security, etc.
});

// Audit log for authentication events
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  userId: text("userId"), // Nullable for events without user (e.g., failed login attempts)
  eventType: text("eventType").notNull(), // login, logout, signup, password_change, account_locked, token_revoked, session_created, session_revoked
  success: boolean("success").notNull().default(false),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  metadata: jsonb("metadata"), // JSON for additional context
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// User IP history for tracking login locations
export const userIpHistory = pgTable("user_ip_history", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ipAddress: text("ipAddress").notNull(),
  firstSeen: timestamp("firstSeen").notNull().defaultNow(),
  lastSeen: timestamp("lastSeen").notNull().defaultNow(),
  loginCount: text("loginCount").notNull().default("1"), // Using text to store number as string for simplicity
});

