import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user, session, auditLog } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { checkAccountLockout } from "@/lib/security/account-lockout";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * GET /api/auth/admin/users/:userId - Get user details
 * Requires ADMIN role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: { cookie: cookieHeader },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    if (currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can access this endpoint" },
        { status: 403 }
      );
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found", userId: targetUserId },
        { status: 404 }
      );
    }

    const targetUser = users[0];
    const lockoutStatus = await checkAccountLockout(targetUser.email);

    const now = new Date();
    const sessionCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(session)
      .where(
        and(
          eq(session.userId, targetUser.id),
          gte(session.expiresAt, now)
        )
      );
    const sessionCount = Number(sessionCountResult[0]?.count || 0);

    const lastLoginResult = await db
      .select()
      .from(auditLog)
      .where(
        and(
          eq(auditLog.userId, targetUser.id),
          eq(auditLog.eventType, "login"),
          eq(auditLog.success, true)
        )
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(1);

    const lastLogin = lastLoginResult[0]?.createdAt || null;

    return NextResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        username: targetUser.username,
        displayUsername: targetUser.displayUsername,
        role: targetUser.role || "CUSTOMER",
        locale: targetUser.locale || "en",
        emailVerified: targetUser.emailVerified,
        image: targetUser.image,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
        deletedAt: targetUser.deletedAt,
        isDeleted: !!targetUser.deletedAt,
      },
      lockoutStatus: {
        isLocked: lockoutStatus.isLocked,
        remainingAttempts: lockoutStatus.remainingAttempts,
        lockoutExpiresAt: lockoutStatus.lockoutExpiresAt
          ? lockoutStatus.lockoutExpiresAt.toISOString()
          : undefined,
      },
      sessionCount,
      lastLogin: lastLogin ? lastLogin.toISOString() : null,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user details:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: { cookie: cookieHeader },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    if (currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete accounts" },
        { status: 403 }
      );
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = users[0];

    if (targetUser.deletedAt) {
      return NextResponse.json(
        { error: "User account is already deleted", deletedAt: targetUser.deletedAt },
        { status: 400 }
      );
    }

    const deletedAt = new Date();
    await db
      .update(user)
      .set({
        deletedAt,
        updatedAt: deletedAt,
      })
      .where(eq(user.id, targetUserId));

    await db.delete(session).where(eq(session.userId, targetUserId));

    await logAuthEvent(
      "account_deleted",
      targetUserId,
      true,
      request,
      {
        deletedBy: currentUser.id,
        deletedByEmail: currentUser.email,
        deletionType: "soft",
        email: targetUser.email,
      }
    );

    return NextResponse.json({
      message: "User account deleted successfully",
      userId: targetUserId,
      deletedAt: deletedAt.toISOString(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting user account:", error);
    }
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}

