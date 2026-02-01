import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserIPHistory } from "@/lib/security/ip-security";

/**
 * GET /api/auth/ip-history - Get IP history for current user
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
    
    // Get IP history
    const history = await getUserIPHistory(userId);
    
    return NextResponse.json({ history });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching IP history:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch IP history" },
      { status: 500 }
    );
  }
}

