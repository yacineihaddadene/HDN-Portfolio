import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  return handleTokenRequest(request);
}

export async function POST(request: NextRequest) {
  return handleTokenRequest(request);
}

async function handleTokenRequest(request: NextRequest) {
  try {
    // Get session from cookies using Better Auth
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Use Better Auth's session handler
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
    
    // Generate JWT token manually using the same secret and config as Better Auth
    const jwtSecret = process.env.BETTER_AUTH_JWT_SECRET || 
                     process.env.AUTH_JWT_SECRET || 
                     process.env.BETTER_AUTH_SECRET;
    
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("JWT secret is missing or too short");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name || null,
        role: (user as any).role || "CUSTOMER",
        locale: (user as any).locale || "en",
        iss: process.env.BETTER_AUTH_JWT_ISS || process.env.AUTH_JWT_ISS || "portfolio-auth",
        aud: process.env.BETTER_AUTH_JWT_AUD || process.env.AUTH_JWT_AUD || "portfolio-api",
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    return NextResponse.json({ token });
  } catch (error) {
    // Log error server-side only (not exposed to client)
    if (process.env.NODE_ENV === "development") {
      console.error("Token generation error:", error);
    }
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

