import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Parse CORS origins from environment variable
const getAllowedOrigins = (): string[] => {
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(",").map(origin => origin.trim()).filter(Boolean);
  }
  // Fallback for development only
  if (process.env.NODE_ENV === "development") {
    return ["http://localhost:3000", "http://localhost:3002"];
  }
  return [];
};

// Simple in-memory rate limiting store
// In production, use Redis or a proper rate limiting service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

function getRateLimitIdentifier(request: NextRequest): string {
  // Use IP address for rate limiting
  // Try to get IP from various headers (for proxies/load balancers)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             request.headers.get("cf-connecting-ip") || // Cloudflare
             request.headers.get("x-client-ip") ||
             "unknown";
  return `rate-limit:${ip}`;
}

export function middleware(request: NextRequest) {
  // For OAuth callbacks at /callback/*, let the route handler deal with it
  // The route handler at /callback/[...path]/route.ts will forward to Better Auth
  // We don't need to rewrite here - the route handler is more reliable
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/callback/")) {
    // Let the route handler process this - don't intercept
    return NextResponse.next();
  }
  
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // HSTS header (only for HTTPS)
  if (process.env.NODE_ENV === "production" && request.url.startsWith("https://")) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  // Handle CORS for auth endpoints
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.length === 0) {
      console.error("CORS_ORIGINS not configured. CORS requests will be blocked.");
    }
    
    const allowedOrigin = origin && allowedOrigins.includes(origin) 
      ? origin 
      : (allowedOrigins.length > 0 ? allowedOrigins[0] : null);
    
    if (allowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    
    // Rate limiting for authentication endpoints
    const isAuthEndpoint = request.nextUrl.pathname.includes("/sign-in") || 
                          request.nextUrl.pathname.includes("/sign-up");
    
    if (isAuthEndpoint && request.method === "POST") {
      const identifier = getRateLimitIdentifier(request);
      
      // 5 attempts per 15 minutes
      const shortWindow = checkRateLimit(`${identifier}:short`, 5, 15 * 60 * 1000);
      // 20 attempts per hour
      const longWindow = checkRateLimit(`${identifier}:long`, 20, 60 * 60 * 1000);
      
      if (!shortWindow || !longWindow) {
        response.headers.set("Retry-After", "900"); // 15 minutes
        return NextResponse.json(
          { 
            error: "Too many requests", 
            message: "Rate limit exceeded. Please try again later." 
          },
          { 
            status: 429,
            headers: response.headers 
          }
        );
      }
      
      // Add rate limit headers
      const shortRecord = rateLimitStore.get(`${identifier}:short`);
      
      if (shortRecord) {
        response.headers.set("X-RateLimit-Limit", "5");
        response.headers.set("X-RateLimit-Remaining", String(Math.max(0, 5 - shortRecord.count)));
        response.headers.set("X-RateLimit-Reset", String(Math.ceil(shortRecord.resetTime / 1000)));
      }
    }
    
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }
  
  return response;
}

export const config = {
  // Match all routes that need middleware processing
  // Include /callback/* to ensure it passes through middleware (which just calls next())
  matcher: [
    "/api/auth/:path*",
    "/api/auth/token",
    "/callback/:path*", // Ensure OAuth callbacks are processed
  ],
};

