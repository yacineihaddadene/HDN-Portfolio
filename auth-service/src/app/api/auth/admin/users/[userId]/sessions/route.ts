import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * GET /api/auth/admin/users/:userId/sessions - Get all sessions for a user
 * Requires ADMIN role
 */
export async function GET(
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
        { error: "Forbidden: Only admins can view user sessions" },
        { status: 403 }
      );
    }

    // Verify user exists
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

    // Get all sessions for the user
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, targetUserId))
      .orderBy(session.createdAt);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user sessions:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch user sessions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/admin/users/:userId/sessions - Revoke all sessions for a user
 * Requires ADMIN role
 */
export async function DELETE(
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
        { error: "Forbidden: Only admins can revoke user sessions" },
        { status: 403 }
      );
    }

    // Verify user exists
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

    // Get count of sessions before deletion
    const sessionsBefore = await db
      .select()
      .from(session)
      .where(eq(session.userId, targetUserId));

    const sessionCount = sessionsBefore.length;

    // Delete all sessions for the user
    await db.delete(session).where(eq(session.userId, targetUserId));

    // Log session revocation
    await logAuthEvent(
      "session_revoked",
      targetUserId,
      true,
      request,
      {
        revokedBy: currentUser.id,
        revokedByEmail: currentUser.email,
        sessionCount,
        reason: "admin_revoked_all",
      }
    );

    return NextResponse.json({
      message: "All sessions revoked successfully",
      userId: targetUserId,
      revokedCount: sessionCount,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error revoking user sessions:", error);
    }
    return NextResponse.json(
      { error: "Failed to revoke user sessions" },
      { status: 500 }
    );
  }
}

