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
 * Get the auth service base URL for Better Auth client.
 * Must include /api/auth – the client appends paths like sign-in/email directly.
 * Examples: https://yacinehdn.dev/auth/api/auth (prod), http://localhost:3001/api/auth (dev).
 */
export function getAuthServiceUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001/api/auth";
  } else {
    return process.env.AUTH_SERVICE_URL ||
           process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
           "http://localhost:3001/api/auth";
  }
}
