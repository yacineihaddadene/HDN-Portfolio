import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateUUID } from "@/lib/utils/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!validateUUID(id)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    // Check if message exists
    const [existingMessage] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update status to unread
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({
        status: "unread",
        updatedAt: new Date(),
      })
      .where(eq(contactMessages.id, id))
      .returning();

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("Error marking message as unread:", error);
    return NextResponse.json(
      { error: "Failed to update message status" },
      { status: 500 }
    );
  }
}
