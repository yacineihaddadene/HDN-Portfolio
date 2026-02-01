/**
 * IP-based security functionality
 * Tracks user IP history and detects new login locations
 */

import { db } from "../auth/auth";
import { userIpHistory } from "../db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IPHistoryEntry {
  id: string;
  userId: string;
  ipAddress: string;
  firstSeen: Date;
  lastSeen: Date;
  loginCount: number;
}

/**
 * Check if an IP address is new for a user
 */
export async function isNewIP(userId: string, ipAddress: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(userIpHistory)
    .where(
      and(
        eq(userIpHistory.userId, userId),
        eq(userIpHistory.ipAddress, ipAddress)
      )
    )
    .limit(1);
  
  return existing.length === 0;
}

/**
 * Record a login IP address
 * Updates existing entry or creates new one
 */
export async function recordLoginIP(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<IPHistoryEntry> {
  // Check if IP already exists for this user
  const existing = await db
    .select()
    .from(userIpHistory)
    .where(
      and(
        eq(userIpHistory.userId, userId),
        eq(userIpHistory.ipAddress, ipAddress)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing entry - delete and recreate for simplicity
    // (Drizzle update syntax can be complex, this is simpler)
    const entry = existing[0];
    const newLoginCount = parseInt(entry.loginCount || "1", 10) + 1;
    
    // Delete old entry
    await db.delete(userIpHistory).where(eq(userIpHistory.id, entry.id));
    
    // Create updated entry
    await db.insert(userIpHistory).values({
      id: entry.id,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      firstSeen: entry.firstSeen,
      lastSeen: new Date(),
      loginCount: newLoginCount.toString(),
    });
    
    return {
      id: entry.id,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      firstSeen: entry.firstSeen,
      lastSeen: new Date(),
      loginCount: newLoginCount,
    };
  } else {
    // Create new entry
    const id = randomBytes(16).toString("hex");
    
    await db.insert(userIpHistory).values({
      id,
      userId,
      ipAddress,
      firstSeen: new Date(),
      lastSeen: new Date(),
      loginCount: "1",
    });
    
    return {
      id,
      userId,
      ipAddress,
      firstSeen: new Date(),
      lastSeen: new Date(),
      loginCount: 1,
    };
  }
}

/**
 * Get IP history for a user
 */
export async function getUserIPHistory(userId: string): Promise<IPHistoryEntry[]> {
  const history = await db
    .select()
    .from(userIpHistory)
    .where(eq(userIpHistory.userId, userId))
    .orderBy(desc(userIpHistory.lastSeen));
  
  return history.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    ipAddress: entry.ipAddress,
    firstSeen: entry.firstSeen,
    lastSeen: entry.lastSeen,
    loginCount: parseInt(entry.loginCount || "1", 10),
  }));
}

/**
 * Check for suspicious activity based on IP patterns
 */
export async function checkSuspiciousActivity(
  userId: string,
  ipAddress: string
): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];
  
  // Get recent IP history (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentHistory = await db
    .select()
    .from(userIpHistory)
    .where(
      and(
        eq(userIpHistory.userId, userId),
        gte(userIpHistory.lastSeen, oneDayAgo)
      )
    );
  
  // Check for multiple IPs in short time (potential account compromise)
  const uniqueIPs = new Set(recentHistory.map((h) => h.ipAddress));
  if (uniqueIPs.size > 3) {
    reasons.push(`Login from ${uniqueIPs.size} different IP addresses in the last 24 hours`);
  }
  
  // Note: Additional checks can be added here:
  // - Check against known malicious IP ranges (requires threat intel feed)
  // - Geographic anomaly detection (requires IP geolocation)
  // - Unusual login times
  
  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Get approximate location from IP (optional - placeholder for future implementation)
 * Can integrate with services like:
 * - ipapi.co (free tier available)
 * - ip-api.com (free tier available)
 * - MaxMind GeoIP2 (paid)
 */
export async function getIPLocation(ipAddress: string): Promise<{
  country?: string;
  city?: string;
  region?: string;
} | null> {
  // Placeholder - implement when needed
  // Example integration:
  // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
  // const data = await response.json();
  // return { country: data.country_name, city: data.city, region: data.region };
  
  return null;
}

