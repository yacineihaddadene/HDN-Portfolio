import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  name?: string;
  role?: string;
  locale?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

/**
 * Verify JWT token from Authorization header
 * Returns the decoded payload if valid, null otherwise
 */
export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const jwtSecret = process.env.AUTH_JWT_SECRET;
    
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("JWT secret is missing or too short");
      return null;
    }

    const issuer = process.env.AUTH_JWT_ISS || "portfolio-auth";
    const audience = process.env.AUTH_JWT_AUD || "portfolio-api";

    const decoded = jwt.verify(token, jwtSecret, {
      issuer,
      audience,
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("JWT verification error:", error);
    }
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

/**
 * Get authenticated user from request
 * Returns user payload if token is valid, null otherwise
 */
export function getAuthenticatedUser(request: NextRequest): JwtPayload | null {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
}

/**
 * Middleware helper to check if user is authenticated
 * Returns NextResponse with error if not authenticated, null if authenticated
 */
export function requireAuth(request: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthenticatedUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware helper to check if user has ADMIN role
 * Returns NextResponse with error if not admin, null if admin
 */
export function requireAdmin(request: NextRequest): { user: JwtPayload } | NextResponse {
  const authResult = requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Not authenticated
  }

  const { user } = authResult;
  const role = user.role?.toUpperCase();

  if (role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return { user };
}
