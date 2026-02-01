import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user, tokenBlacklist } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";
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
        { error: "Forbidden: Only admins can permanently delete accounts" },
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
    const userEmail = targetUser.email;
    const deletedAt = targetUser.deletedAt;

    // Use transaction to ensure atomicity: delete tokenBlacklist entries, then user
    // Note: Sessions are automatically deleted via CASCADE constraint
    // Audit logs are kept for compliance (nullable userId allows retention)
    await db.transaction(async (tx) => {
      // Delete token blacklist entries for this user
      await tx.delete(tokenBlacklist).where(eq(tokenBlacklist.userId, targetUserId));
      
      // Delete the user (sessions cascade automatically)
      await tx.delete(user).where(eq(user.id, targetUserId));
    });

    // Log the deletion event (after successful deletion)
    await logAuthEvent(
      "account_deleted",
      targetUserId,
      true,
      request,
      {
        deletedBy: currentUser.id,
        deletedByEmail: currentUser.email,
        deletionType: "permanent",
        email: userEmail,
        wasSoftDeleted: !!deletedAt,
        softDeletedAt: deletedAt?.toISOString(),
      }
    );

    return NextResponse.json({
      message: "User account permanently deleted",
      userId: targetUserId,
      email: userEmail,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error permanently deleting user account:", error);
    }
    return NextResponse.json(
      { error: "Failed to permanently delete user account" },
      { status: 500 }
    );
  }
}
