import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user, loginAttempt } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * POST /api/auth/admin/users/:userId/unlock - Unlock a locked account
 * Requires ADMIN role
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

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    if (currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can unlock accounts" },
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

    // Clear all failed login attempts for this user's email
    // This effectively unlocks the account
    await db
      .delete(loginAttempt)
      .where(eq(loginAttempt.email, targetUser.email.toLowerCase()));

    // Log account unlock event
    await logAuthEvent(
      "account_unlocked",
      targetUserId,
      true,
      request,
      {
        unlockedBy: currentUser.id,
        unlockedByEmail: currentUser.email,
      }
    );

    return NextResponse.json({
      message: "Account unlocked successfully",
      userId: targetUserId,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error unlocking account:", error);
    }
    return NextResponse.json(
      { error: "Failed to unlock account" },
      { status: 500 }
    );
  }
}

