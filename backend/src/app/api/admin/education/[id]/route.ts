import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import {
  validateNotEmpty,
  sanitizeText,
  validateDate,
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
      return NextResponse.json({ error: "Invalid education ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if education exists
    const [existingEducation] = await db
      .select()
      .from(education)
      .where(eq(education.id, id))
      .limit(1);

    if (!existingEducation) {
      return NextResponse.json({ error: "Education entry not found" }, { status: 404 });
    }

    const toBilingual = (o: { en?: string; fr?: string }) => ({
      en: sanitizeText(String(o.en ?? "").trim()),
      fr: sanitizeText(String(o.fr ?? "").trim()),
    });
    const requireBilingual = (val: unknown) => {
      if (!val || typeof val !== "object" || !("en" in val)) return false;
      return validateNotEmpty(String((val as { en?: string }).en ?? ""));
    };

    // Build update object
    const updateData: any = {};

    if (body.degree !== undefined) {
      if (!requireBilingual(body.degree)) {
        return NextResponse.json({ error: "Degree (English) is required" }, { status: 400 });
      }
      updateData.degree = toBilingual(body.degree as { en?: string; fr?: string });
    }

    if (body.institution !== undefined) {
      if (!requireBilingual(body.institution)) {
        return NextResponse.json({ error: "Institution (English) is required" }, { status: 400 });
      }
      updateData.institution = toBilingual(body.institution as { en?: string; fr?: string });
    }

    if (body.location !== undefined) {
      if (!requireBilingual(body.location)) {
        return NextResponse.json({ error: "Location (English) is required" }, { status: 400 });
      }
      updateData.location = toBilingual(body.location as { en?: string; fr?: string });
    }

    if (body.description !== undefined) {
      if (body.description == null) {
        updateData.description = null;
      } else if (typeof body.description === "object" && body.description !== null && "en" in body.description) {
        updateData.description = toBilingual(body.description as { en?: string; fr?: string });
      } else {
        updateData.description = null;
      }
    }

    if (body.startDate !== undefined) {
      if (!validateDate(body.startDate)) {
        return NextResponse.json(
          { error: "Invalid start date format (YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      updateData.startDate = body.startDate;
    }

    if (body.endDate !== undefined) {
      if (body.endDate && !validateDate(body.endDate)) {
        return NextResponse.json(
          { error: "Invalid end date format (YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      updateData.endDate = body.endDate || null;
    }

    if (body.gpa !== undefined) {
      updateData.gpa = body.gpa ? sanitizeText(body.gpa) : null;
    }

    if (body.order !== undefined) {
      updateData.order = parseInt(body.order, 10);
    }

    updateData.updatedAt = new Date();

    const [updatedEducation] = await db
      .update(education)
      .set(updateData)
      .where(eq(education.id, id))
      .returning();

    return NextResponse.json({ education: updatedEducation });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education entry" },
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
      return NextResponse.json({ error: "Invalid education ID" }, { status: 400 });
    }

    // Check if education exists
    const [existingEducation] = await db
      .select()
      .from(education)
      .where(eq(education.id, id))
      .limit(1);

    if (!existingEducation) {
      return NextResponse.json({ error: "Education entry not found" }, { status: 404 });
    }

    await db.delete(education).where(eq(education.id, id));

    return NextResponse.json({ success: true, message: "Education entry deleted" });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education entry" },
      { status: 500 }
    );
  }
}
