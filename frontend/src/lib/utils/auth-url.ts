/**
 * Get the auth service base URL WITHOUT /api/auth for manual fetch calls.
 * Use this when you're manually adding /api/auth to the path.
 */
export function getAuthServiceBaseUrl(): string {
  const url = getAuthServiceUrl();
  // Remove /api/auth if present (for manual fetch calls that add it themselves)
  return url.replace(/\/api\/auth\/?$/, "");
}

/**
 * Get the auth service base URL for BetterAuth client.
 * In production, use the full path including /api/auth
 * In development, use localhost without path (BetterAuth adds /api/auth)
 */
export function getAuthServiceUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_AUTH_SERVICE_URL
    return process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001";
  } else {
    // Server-side: use AUTH_SERVICE_URL or fallback to NEXT_PUBLIC
    return process.env.AUTH_SERVICE_URL || 
           process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 
           "http://localhost:3001";
  }
}
