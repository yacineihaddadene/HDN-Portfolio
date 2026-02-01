import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * POST /api/auth/admin/users/:userId/reset-password - Admin-initiated password reset
 * Requires ADMIN role
 * 
 * Uses Better Auth's internal API to generate password reset tokens properly
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
        { error: "Forbidden: Only admins can reset user passwords" },
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

    // Reject password resets for soft-deleted users
    if (targetUser.deletedAt) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Use Better Auth's server-side API to trigger password reset
    // This is the proper way to programmatically trigger password reset as an admin
    try {
      // Use Better Auth's server-side API method
      // This will generate the token correctly and trigger the sendResetPassword hook
      await auth.api.requestPasswordReset({
        body: {
          email: targetUser.email,
          redirectTo: "/reset-password",
        },
        headers: request.headers,
      });

      // Better Auth returns { status: true } on success, even if email doesn't exist
      // (to prevent email enumeration attacks)

      // Log password reset initiation
      await logAuthEvent(
        "password_change",
        targetUserId,
        true,
        request,
        {
          initiatedBy: currentUser.id,
          initiatedByEmail: currentUser.email,
          emailSent: true,
        }
      );

      return NextResponse.json({
        message: "Password reset email sent successfully",
        userId: targetUserId,
        emailSent: true,
      });
    } catch (authError) {
      // Log errors for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("Error calling Better Auth forgot-password:", authError);
      }

      // Log the failure
      await logAuthEvent(
        "password_change",
        targetUserId,
        false,
        request,
        {
          initiatedBy: currentUser.id,
          initiatedByEmail: currentUser.email,
          emailSent: false,
          error: authError instanceof Error ? authError.message : "Unknown error",
        }
      );

      return NextResponse.json(
        { error: "Failed to initiate password reset. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error initiating password reset:", error);
    }
    return NextResponse.json(
      { error: "Failed to initiate password reset" },
      { status: 500 }
    );
  }
}

