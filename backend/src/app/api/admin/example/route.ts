import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

/**
 * Example admin-only API route
 * GET /api/admin/example
 * Requires ADMIN role
 */
export async function GET(request: NextRequest) {
  const adminResult = requireAdmin(request);
  
  if (adminResult instanceof NextResponse) {
    return adminResult; // Error response (401 or 403)
  }

  const { user } = adminResult;

  // Admin is authenticated and authorized
  return NextResponse.json({
    message: "Admin access granted",
    user: {
      id: user.sub,
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * Example admin-only POST route
 * POST /api/admin/example
 * Requires ADMIN role
 */
export async function POST(request: NextRequest) {
  const adminResult = requireAdmin(request);
  
  if (adminResult instanceof NextResponse) {
    return adminResult; // Error response (401 or 403)
  }

  const { user } = adminResult;
  const body = await request.json();

  // Admin can perform admin actions here
  return NextResponse.json({
    message: "Admin action completed",
    data: body,
    performedBy: {
      id: user.sub,
      email: user.email,
    },
  });
}
