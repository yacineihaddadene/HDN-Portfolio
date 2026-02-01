import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { blacklistToken } from "@/lib/security/token-blacklist";
import { logAuthEvent } from "@/lib/security/audit-log";
import jwt from "jsonwebtoken";

/**
 * Logout endpoint that blacklists the current JWT token
 */
export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from Authorization header if present
    const authHeader = request.headers.get("authorization");
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    
    // Also try to get token from request body
    if (!token) {
      try {
        const body = await request.json();
        token = body?.token || null;
      } catch {
        // Body might not be JSON or might be empty
      }
    }
    
    // Get session to find user ID
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const user = sessionResult.user;
    
    // If we have a token, blacklist it
    if (token) {
      try {
        // Decode token to get expiration (without verification since we're blacklisting)
        const decoded = jwt.decode(token) as jwt.JwtPayload | null;
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await blacklistToken(token, user.id, expiresAt, "logout");
        }
      } catch (error) {
        // If token decoding fails, continue with logout anyway
        if (process.env.NODE_ENV === "development") {
          console.error("Error blacklisting token:", error);
        }
      }
    }
    
    // Sign out from Better Auth (invalidates session)
    await auth.api.signOut({
      headers: {
        cookie: cookieHeader,
      },
    });
    
    // Log logout event
    await logAuthEvent(
      "logout",
      user.id,
      true,
      request,
      {
        reason: "user_logout",
        sessionId: sessionResult?.session?.id,
      }
    );
    
    // Create response with success message
    const response = NextResponse.json({ 
      message: "Logged out successfully",
      success: true 
    });
    
    // Explicitly clear all authentication cookies by setting them to expire immediately
    const baseUrl = new URL(request.url);
    const hostname = baseUrl.hostname;
    // Extract root domain for production (e.g., app.staging.example.com -> .example.com)
    // Keep localhost as-is for development
    const domain = hostname === "localhost" 
      ? "localhost" 
      : hostname.split('.').length > 1
        ? `.${hostname.split('.').slice(-2).join('.')}`
        : hostname;
    
    // Clear Better Auth session cookies
    // Better Auth uses these cookie names: better-auth.session_token, better-auth.session_data, better-auth.state
    const cookieNames = [
      "better-auth.session_token",
      "better-auth.session_data", 
      "better-auth.state",
      "token" // Also clear the custom token cookie
    ];
    
    cookieNames.forEach(cookieName => {
      response.headers.append(
        "set-cookie",
        `${cookieName}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
      );
    });
    
    return response;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Logout error:", error);
    }
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

