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
 * Centralized to avoid duplication and ensure consistency.
 * 
 * IMPORTANT: BetterAuth behavior depends on whether baseURL has a path:
 * - If baseURL has NO path (e.g., http://localhost:3001): BetterAuth adds /api/auth automatically
 * - If baseURL HAS a path (e.g., https://.../auth): BetterAuth uses that path as-is, does NOT add /api/auth
 * 
 * - Dev: BetterAuth runs on http://localhost:3001, routes are at /api/auth/*
 *   baseURL should be: http://localhost:3001 (no path)
 *   BetterAuth will call: http://localhost:3001/api/auth/get-session ✅
 * 
 * - Prod: BetterAuth is mounted at /auth, routes are at /auth/api/auth/*
 *   baseURL should be: https://yourdomain.com/auth/api/auth (include /api/auth)
 *   BetterAuth will call: https://yourdomain.com/auth/api/auth/get-session ✅
 * 
 * For manual fetch calls, use getAuthServiceBaseUrl() instead, which removes /api/auth.
 */
export function getAuthServiceUrl(): string {
  let url =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001"
      : process.env.AUTH_SERVICE_URL ||
        process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
        "http://localhost:3001";

  // Remove trailing slash if present
  url = url.trim().replace(/\/$/, "");
  
  // Parse URL to check if it has a path component
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    // If URL parsing fails, construct from current origin in browser
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (url.startsWith("/")) {
        url = `${origin}${url}`;
        urlObj = new URL(url);
      } else {
        // Default to /auth/api/auth for production
        url = `${origin}/auth/api/auth`;
        urlObj = new URL(url);
      }
    } else {
      // Server-side/build: use localhost fallback (no path, BetterAuth will add /api/auth)
      return "http://localhost:3001";
    }
  }
  
  // Check if URL has a path component (other than just "/")
  const hasPath = urlObj.pathname && urlObj.pathname !== "/";
  
  if (hasPath) {
    // URL has a path (production case): BetterAuth will NOT add /api/auth automatically
    // Ensure /api/auth is included in the path
    if (!urlObj.pathname.endsWith("/api/auth")) {
      // Remove /api/auth if it's duplicated, then add it
      let path = urlObj.pathname.replace(/\/api\/auth\/?$/, "");
      if (!path.endsWith("/")) {
        path += "/";
      }
      urlObj.pathname = path + "api/auth";
    }
    return urlObj.toString().replace(/\/$/, ""); // Remove trailing slash
  } else {
    // URL has no path (dev case): BetterAuth will add /api/auth automatically
    // Remove /api/auth if it was incorrectly included
    return url.replace(/\/api\/auth\/?$/, "");
  }
}
