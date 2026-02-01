import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";
export async function POST(
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
        { error: "Forbidden: Only admins can restore accounts" },
        { status: 403 }
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

    if (!targetUser.deletedAt) {
      return NextResponse.json(
        { error: "User account is not deleted" },
        { status: 400 }
      );
    }

    const restoredAt = new Date();
    await db
      .update(user)
      .set({
        deletedAt: null,
        updatedAt: restoredAt,
      })
      .where(eq(user.id, targetUserId));

    await logAuthEvent(
      "account_restored",
      targetUserId,
      true,
      request,
      {
        restoredBy: currentUser.id,
        restoredByEmail: currentUser.email,
        email: targetUser.email,
        wasDeletedAt: targetUser.deletedAt.toISOString(),
      }
    );

    return NextResponse.json({
      message: "User account restored successfully",
      userId: targetUserId,
      restoredAt: restoredAt.toISOString(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error restoring user account:", error);
    }
    return NextResponse.json(
      { error: "Failed to restore user account" },
      { status: 500 }
    );
  }
}
