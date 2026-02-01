import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/security/session-management";
import { logAuthEvent } from "@/lib/security/audit-log";

/**
 * DELETE /api/auth/sessions/[sessionId] - Revoke a specific session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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
    const resolvedParams = await params;
    const targetSessionId = resolvedParams.sessionId;
    
    // Prevent revoking current session
    if (targetSessionId === currentSessionId) {
      return NextResponse.json(
        { error: "Cannot revoke current session" },
        { status: 400 }
      );
    }
    
    const success = await revokeSession(targetSessionId, userId);
    
    if (success) {
      // Log session revocation
      await logAuthEvent(
        "session_revoked",
        userId,
        true,
        request,
        {
          sessionId: targetSessionId,
          reason: "user_revoked",
        }
      );
      
      return NextResponse.json({
        message: "Session revoked successfully",
        success: true,
      });
    } else {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error revoking session:", error);
    }
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}

