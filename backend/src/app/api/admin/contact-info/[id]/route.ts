import { NextRequest, NextResponse } from "next/server";
import { db, contactInfo } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import {
  validateNotEmpty,
  sanitizeText,
  validateUUID,
} from "@/lib/utils/validation";

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
      return NextResponse.json({ error: "Invalid contact info ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if contact info exists
    const [existingContactInfo] = await db
      .select()
      .from(contactInfo)
      .where(eq(contactInfo.id, id))
      .limit(1);

    if (!existingContactInfo) {
      return NextResponse.json({ error: "Contact info not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (body.type !== undefined) {
      if (!validateNotEmpty(body.type)) {
        return NextResponse.json(
          { error: "Type cannot be empty" },
          { status: 400 }
        );
      }
      if (!["email", "phone", "address", "social_links"].includes(body.type)) {
        return NextResponse.json(
          { error: "Type must be one of: email, phone, address, social_links" },
          { status: 400 }
        );
      }
      updateData.type = sanitizeText(body.type);
    }

    if (body.value !== undefined) {
      if (!validateNotEmpty(body.value)) {
        return NextResponse.json(
          { error: "Value cannot be empty" },
          { status: 400 }
        );
      }
      updateData.value = sanitizeText(body.value);
    }

    if (body.order !== undefined) {
      updateData.order = parseInt(body.order, 10);
    }

    updateData.updatedAt = new Date();

    const [updatedContactInfo] = await db
      .update(contactInfo)
      .set(updateData)
      .where(eq(contactInfo.id, id))
      .returning();

    return NextResponse.json({ contactInfo: updatedContactInfo });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { error: "Failed to update contact information" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: "Invalid contact info ID" }, { status: 400 });
    }

    // Check if contact info exists
    const [existingContactInfo] = await db
      .select()
      .from(contactInfo)
      .where(eq(contactInfo.id, id))
      .limit(1);

    if (!existingContactInfo) {
      return NextResponse.json({ error: "Contact info not found" }, { status: 404 });
    }

    await db.delete(contactInfo).where(eq(contactInfo.id, id));

    return NextResponse.json({ success: true, message: "Contact info deleted" });
  } catch (error) {
    console.error("Error deleting contact info:", error);
    return NextResponse.json(
      { error: "Failed to delete contact information" },
      { status: 500 }
    );
  }
}
