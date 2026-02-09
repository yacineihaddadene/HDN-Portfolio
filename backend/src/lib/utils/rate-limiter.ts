import { NextRequest } from "next/server";

// In-memory store for rate limiting (IP -> timestamps of submissions)
// In production, consider using Redis or a database
const rateLimitStore = new Map<string, number[]>();

// Cleanup old entries every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const SUBMISSION_WINDOW = 20 * 60 * 1000; // 20 minutes

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    // Remove timestamps older than 20 minutes
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < SUBMISSION_WINDOW,
    );
    if (recentTimestamps.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, recentTimestamps);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers in order of preference
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback - use a hash of the user agent if no IP available
  const userAgent = request.headers.get("user-agent") || "unknown";
  return userAgent;
}

/**
 * Check if IP has exceeded rate limit
 * @param ip Client IP address
 * @param maxSubmissions Maximum submissions allowed
 * @param windowMs Time window in milliseconds
 * @returns Object with isLimited boolean and retryAfter timestamp
 */
export function checkRateLimit(
  ip: string,
  maxSubmissions: number = 5,
  windowMs: number = SUBMISSION_WINDOW,
): {
  isLimited: boolean;
  remaining: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) || [];

  // Remove timestamps outside the window
  const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (recentTimestamps.length >= maxSubmissions) {
    // Find the oldest timestamp to calculate when the limit resets
    const oldestTimestamp = Math.min(...recentTimestamps);
    const retryAfter = oldestTimestamp + windowMs;

    return {
      isLimited: true,
      remaining: 0,
      retryAfter,
    };
  }

  // Record this submission
  recentTimestamps.push(now);
  rateLimitStore.set(ip, recentTimestamps);

  return {
    isLimited: false,
    remaining: maxSubmissions - recentTimestamps.length,
  };
}

/**
 * Format rate limit error response
 */
export function getRateLimitErrorResponse(retryAfter: number): {
  error: string;
  retryAfter: number;
  message: string;
} {
  const secondsUntilRetry = Math.ceil((retryAfter - Date.now()) / 1000);

  return {
    error: "Rate limit exceeded",
    retryAfter: Math.max(1, secondsUntilRetry),
    message: `Too many submissions. Please try again in ${Math.max(1, secondsUntilRetry)} seconds.`,
  };
}
