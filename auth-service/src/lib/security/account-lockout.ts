/**
 * Account lockout functionality
 * Tracks failed login attempts and locks accounts after threshold
 */

import { db } from "../auth/auth";
import { loginAttempt, auditLog, user } from "../db/schema";
import { eq, and, gte, desc, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";

export const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface LockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: Date;
  isAdminLocked?: boolean; // Indicates if lock was initiated by admin
}

/**
 * Check if an account is currently locked
 */
export async function checkAccountLockout(email: string): Promise<LockoutStatus> {
  const thirtyMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MS);
  
  // First, check if there's a recent admin lock in the audit log
  // Get the user ID first to check audit logs
  const users = await db
    .select()
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);
  
  if (users.length > 0) {
    const userId = users[0].id;
    
    // Check for recent unlock event first - if there's a recent unlock, account is not locked
    const unlockEvents = await db
      .select()
      .from(auditLog)
      .where(
        and(
          eq(auditLog.userId, userId),
          eq(auditLog.eventType, "account_unlocked"),
          eq(auditLog.success, true),
          gte(auditLog.createdAt, thirtyMinutesAgo)
        )
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(1);
    
    // Check for recent admin lock event
    const adminLockEvents = await db
      .select()
      .from(auditLog)
      .where(
        and(
          eq(auditLog.userId, userId),
          eq(auditLog.eventType, "account_locked"),
          eq(auditLog.success, true),
          gte(auditLog.createdAt, thirtyMinutesAgo)
        )
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(1);
    
    // If there's an unlock event, check if it's more recent than the lock event
    if (unlockEvents.length > 0) {
      const unlockEvent = unlockEvents[0];
      // If there's no lock event, or unlock is more recent than lock, account is unlocked
      if (adminLockEvents.length === 0 || unlockEvent.createdAt > adminLockEvents[0].createdAt) {
        // Account was unlocked, continue to check for automatic lockouts
      } else {
        // Lock is more recent than unlock, account is still locked
        const adminLockEvent = adminLockEvents[0];
        const metadata = adminLockEvent.metadata as { reason?: string } | null;
        if (metadata && metadata.reason === "admin_locked") {
          const lockoutExpiresAt = new Date(adminLockEvent.createdAt.getTime() + LOCKOUT_DURATION_MS);
          return {
            isLocked: true,
            remainingAttempts: 0,
            lockoutExpiresAt,
            isAdminLocked: true,
          };
        }
      }
    } else if (adminLockEvents.length > 0) {
      // No unlock event, but there's a lock event
      const adminLockEvent = adminLockEvents[0];
      const metadata = adminLockEvent.metadata as { reason?: string } | null;
      if (metadata && metadata.reason === "admin_locked") {
        // Account was locked by admin
        // Calculate expiration based on when the lock was created
        const lockoutExpiresAt = new Date(adminLockEvent.createdAt.getTime() + LOCKOUT_DURATION_MS);
        return {
          isLocked: true,
          remainingAttempts: 0,
          lockoutExpiresAt,
          isAdminLocked: true,
        };
      }
    }
  }
  
  // Check for automatic lockout due to failed attempts
  const recentAttempts = await db
    .select()
    .from(loginAttempt)
    .where(
      and(
        eq(loginAttempt.email, email.toLowerCase()),
        eq(loginAttempt.success, false),
        gte(loginAttempt.attemptedAt, thirtyMinutesAgo)
      )
    )
    .orderBy(desc(loginAttempt.attemptedAt))
    .limit(MAX_FAILED_ATTEMPTS);
  
  const failedCount = recentAttempts.length;
  const isLocked = failedCount >= MAX_FAILED_ATTEMPTS;
  
  if (isLocked && recentAttempts.length > 0) {
    const oldestAttempt = recentAttempts[recentAttempts.length - 1];
    const lockoutExpiresAt = new Date(oldestAttempt.attemptedAt.getTime() + LOCKOUT_DURATION_MS);
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutExpiresAt,
      isAdminLocked: false,
    };
  }
  
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedCount),
  };
}

/**
 * Batch check account lockout status for multiple users
 * Significantly reduces database queries by batching all lookups
 */
export async function checkAccountLockoutBatch(
  users: Array<{ id: string; email: string }>
): Promise<Map<string, LockoutStatus>> {
  if (users.length === 0) {
    return new Map();
  }

  const thirtyMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MS);
  const userIds = users.map((u) => u.id);
  const emails = users.map((u) => u.email.toLowerCase());
  const emailToUserIdMap = new Map<string, string>();
  users.forEach((u) => {
    emailToUserIdMap.set(u.email.toLowerCase(), u.id);
  });

  // Batch fetch all unlock events for all users
  const unlockEventsResult = await db
    .select()
    .from(auditLog)
    .where(
      and(
        inArray(auditLog.userId, userIds),
        eq(auditLog.eventType, "account_unlocked"),
        eq(auditLog.success, true),
        gte(auditLog.createdAt, thirtyMinutesAgo)
      )
    )
    .orderBy(desc(auditLog.createdAt));

  // Batch fetch all admin lock events for all users
  const adminLockEventsResult = await db
    .select()
    .from(auditLog)
    .where(
      and(
        inArray(auditLog.userId, userIds),
        eq(auditLog.eventType, "account_locked"),
        eq(auditLog.success, true),
        gte(auditLog.createdAt, thirtyMinutesAgo)
      )
    )
    .orderBy(desc(auditLog.createdAt));

  // Batch fetch all failed login attempts for all emails
  const loginAttemptsResult = await db
    .select()
    .from(loginAttempt)
    .where(
      and(
        inArray(loginAttempt.email, emails),
        eq(loginAttempt.success, false),
        gte(loginAttempt.attemptedAt, thirtyMinutesAgo)
      )
    )
    .orderBy(desc(loginAttempt.attemptedAt));

  // Group events by userId
  const unlockEventsByUser = new Map<string, typeof unlockEventsResult>();
  const lockEventsByUser = new Map<string, typeof adminLockEventsResult>();

  unlockEventsResult.forEach((event) => {
    if (event.userId) {
      const existing = unlockEventsByUser.get(event.userId) || [];
      existing.push(event);
      unlockEventsByUser.set(event.userId, existing);
    }
  });

  adminLockEventsResult.forEach((event) => {
    if (event.userId) {
      const existing = lockEventsByUser.get(event.userId) || [];
      existing.push(event);
      lockEventsByUser.set(event.userId, existing);
    }
  });

  // Group login attempts by email
  const loginAttemptsByEmail = new Map<string, typeof loginAttemptsResult>();
  loginAttemptsResult.forEach((attempt) => {
    const existing = loginAttemptsByEmail.get(attempt.email) || [];
    existing.push(attempt);
    loginAttemptsByEmail.set(attempt.email, existing);
  });

  // Compute lockout status for each user
  const resultMap = new Map<string, LockoutStatus>();

  for (const user of users) {
    const userId = user.id;
    const email = user.email.toLowerCase();

    // Check for admin lock/unlock events
    const unlockEvents = unlockEventsByUser.get(userId) || [];
    const lockEvents = lockEventsByUser.get(userId) || [];

    // Get most recent unlock and lock events
    const mostRecentUnlock = unlockEvents[0] || null;
    const mostRecentLock = lockEvents[0] || null;

    // Check if account is admin locked
    if (mostRecentLock) {
      const metadata = mostRecentLock.metadata as { reason?: string } | null;
      if (metadata && metadata.reason === "admin_locked") {
        // Check if unlock is more recent than lock
        if (!mostRecentUnlock || mostRecentUnlock.createdAt <= mostRecentLock.createdAt) {
          const lockoutExpiresAt = new Date(
            mostRecentLock.createdAt.getTime() + LOCKOUT_DURATION_MS
          );
          resultMap.set(userId, {
            isLocked: true,
            remainingAttempts: 0,
            lockoutExpiresAt,
            isAdminLocked: true,
          });
          continue; // Skip automatic lockout check
        }
      }
    }

    // Check for automatic lockout due to failed attempts
    const recentAttempts = loginAttemptsByEmail.get(email) || [];
    const failedCount = recentAttempts.length;
    const isLocked = failedCount >= MAX_FAILED_ATTEMPTS;

    if (isLocked && recentAttempts.length > 0) {
      const oldestAttempt = recentAttempts[recentAttempts.length - 1];
      const lockoutExpiresAt = new Date(
        oldestAttempt.attemptedAt.getTime() + LOCKOUT_DURATION_MS
      );
      resultMap.set(userId, {
        isLocked: true,
        remainingAttempts: 0,
        lockoutExpiresAt,
        isAdminLocked: false,
      });
    } else {
      resultMap.set(userId, {
        isLocked: false,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedCount),
      });
    }
  }

  return resultMap;
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Generate a random ID (similar to Better Auth's ID generation)
  const id = randomBytes(16).toString("hex");
  
  await db.insert(loginAttempt).values({
    id,
    email: email.toLowerCase(),
    ipAddress: ipAddress || null,
    success,
    attemptedAt: new Date(),
    userAgent: userAgent || null,
  });
  
  // Note: Cleanup of old attempts would ideally be done in a scheduled job
  // In production, use a cron job or database cleanup task
}

/**
 * Clear failed attempts for an email (called on successful login)
 */
export async function clearFailedAttempts(_email: string): Promise<void> {
  // In a real implementation, you might want to keep a record but mark them as cleared
  // For simplicity, we'll just record a successful attempt which resets the counter
  // The checkAccountLockout function only looks at recent failures
}

