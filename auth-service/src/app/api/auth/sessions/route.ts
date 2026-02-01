import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserSessions, revokeAllSessionsExcept } from "@/lib/security/session-management";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * GET /api/auth/sessions - List all active sessions for current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (!sessionResult || !sessionResult.user || !sessionResult.session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = sessionResult.user.id;
    const currentSessionId = sessionResult.session.id;
    
    // Get all active sessions
    const sessions = await getUserSessions(userId, currentSessionId);
    
    return NextResponse.json({ sessions });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching sessions:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions - Revoke all sessions except current
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (!sessionResult || !sessionResult.user || !sessionResult.session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = sessionResult.user.id;
    const currentSessionId = sessionResult.session.id;
    
    // Revoke all sessions except current
    const revokedCount = await revokeAllSessionsExcept(userId, currentSessionId);
    
    // Log session revocations
    await logAuthEvent(
      "session_revoked",
      userId,
      true,
      request,
      {
        reason: "revoke_all_except_current",
        revokedCount,
      }
    );
    
    return NextResponse.json({
      message: `Revoked ${revokedCount} session(s)`,
      success: true,
      revokedCount,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error revoking sessions:", error);
    }
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}

