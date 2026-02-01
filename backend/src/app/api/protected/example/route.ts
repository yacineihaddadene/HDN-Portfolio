import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Example protected API route (requires authentication, any role)
 * GET /api/protected/example
 */
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Not authenticated
  }

  const { user } = authResult;

  // User is authenticated
  return NextResponse.json({
    message: "Access granted",
    user: {
      id: user.sub,
      email: user.email,
      role: user.role || "CUSTOMER",
    },
  });
}
