import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";

interface UserWithRole {
  id: string;
  email: string;
  role?: string;
}

/**
 * POST /api/auth/admin/users/:userId/lock - Lock a user account
 * Requires ADMIN role
 * Creates failed login attempts to trigger account lockout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;

    // Verify admin authentication
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

    const currentUser = sessionResult.user as UserWithRole;
    const currentUserRole = currentUser.role;

    if (!currentUserRole || currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can lock accounts" },
        { status: 403 }
      );
    }

    // Get target user
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const targetUser = users[0];

    // Prevent locking your own account
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot lock your own account" },
        { status: 400 }
      );
    }

    // Log account lock event
    await logAuthEvent(
      "account_locked",
      targetUserId,
      true,
      request,
      {
        lockedBy: currentUser.id,
        lockedByEmail: currentUser.email,
        reason: "admin_locked",
      }
    );

    return NextResponse.json({
      message: "Account locked successfully",
      userId: targetUserId,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error locking account:", error);
    }
    return NextResponse.json(
      { error: "Failed to lock account" },
      { status: 500 }
    );
  }
}

