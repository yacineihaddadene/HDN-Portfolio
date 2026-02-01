import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * PUT /api/auth/users/:userId/role - Update user role
 * Requires ADMIN role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { userId: targetUserId } = await params;
    
    // Get current user session to verify admin permissions
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

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    // Only admins can change roles
    if (currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can change user roles" },
        { status: 403 }
      );
    }

    // Get the new role from request body
    const body = await request.json();
    const newRole = body?.role;

    if (!newRole || typeof newRole !== "string") {
      return NextResponse.json(
        { error: "Role is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate role value
    const validRoles = ["CUSTOMER", "ADMIN"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const oldRole = targetUser[0].role || "CUSTOMER";

    // Prevent changing your own role (security measure)
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Update user role in database using raw SQL
    // Drizzle doesn't have a direct update method, so we use raw SQL
    await db.execute(
      sql`UPDATE "user" SET "role" = ${newRole}, "updatedAt" = NOW() WHERE "id" = ${targetUserId}`
    );

    // Log role change event
    await logAuthEvent(
      "role_changed",
      targetUserId,
      true,
      request,
      {
        oldRole,
        newRole,
        changedBy: currentUser.id,
        changedByEmail: currentUser.email,
      }
    );

    return NextResponse.json({
      message: "User role updated successfully",
      userId: targetUserId,
      oldRole,
      newRole,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating user role:", error);
    }
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/users/:userId/role - Get user role
 * Requires ADMIN role or the user themselves
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { userId: targetUserId } = await params;
    
    // Get current user session
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

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    // Users can only view their own role, admins can view any role
    if (currentUser.id !== targetUserId && currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get user from database
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: targetUserId,
      role: targetUser[0].role || "CUSTOMER",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting user role:", error);
    }
    return NextResponse.json(
      { error: "Failed to get user role" },
      { status: 500 }
    );
  }
}

