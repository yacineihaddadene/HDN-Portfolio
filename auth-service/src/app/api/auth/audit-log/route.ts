import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { auditLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/auth/audit-log - Get recent audit log entries for current user
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
    
    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = sessionResult.user.id;
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20", 10);
    
    // Get recent audit log entries for this user
    const logs = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(Math.min(limit, 100)); // Cap at 100
    
    return NextResponse.json({ logs });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching audit log:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}

