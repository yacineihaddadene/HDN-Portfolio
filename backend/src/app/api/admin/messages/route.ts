import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build query with optional status filter
    if (status && ["unread", "read"].includes(status)) {
      const allMessages = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.status, status))
        .orderBy(desc(contactMessages.createdAt));
      return NextResponse.json({ messages: allMessages });
    }

    const allMessages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));

    return NextResponse.json({ messages: allMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
