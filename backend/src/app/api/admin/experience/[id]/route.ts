import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
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
      return NextResponse.json({ error: "Invalid experience ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if experience exists
    const [existingExperience] = await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.id, id))
      .limit(1);

    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    const toBilingual = (o: { en?: string; fr?: string }) => ({
      en: sanitizeText(String(o.en ?? "").trim()),
      fr: sanitizeText(String(o.fr ?? "").trim()),
    });
    const requireBilingual = (val: unknown, name: string) => {
      if (!val || typeof val !== "object" || !("en" in val)) return false;
      const o = val as { en?: string; fr?: string };
      return validateNotEmpty(String(o.en ?? ""));
    };

    // Build update object
    const updateData: any = {};

    if (body.position !== undefined) {
      if (!requireBilingual(body.position, "Position")) {
        return NextResponse.json({ error: "Position (English) is required" }, { status: 400 });
      }
      updateData.position = toBilingual(body.position as { en?: string; fr?: string });
    }

    if (body.company !== undefined) {
      if (!requireBilingual(body.company, "Company")) {
        return NextResponse.json({ error: "Company (English) is required" }, { status: 400 });
      }
      updateData.company = toBilingual(body.company as { en?: string; fr?: string });
    }

    if (body.location !== undefined) {
      if (!requireBilingual(body.location, "Location")) {
        return NextResponse.json({ error: "Location (English) is required" }, { status: 400 });
      }
      updateData.location = toBilingual(body.location as { en?: string; fr?: string });
    }

    if (body.description !== undefined) {
      if (!requireBilingual(body.description, "Description")) {
        return NextResponse.json({ error: "Description (English) is required" }, { status: 400 });
      }
      updateData.description = toBilingual(body.description as { en?: string; fr?: string });
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

    if (body.current !== undefined) {
      updateData.current = body.current === true;
    }

    if (body.order !== undefined) {
      updateData.order = parseInt(body.order, 10);
    }

    updateData.updatedAt = new Date();

    const [updatedExperience] = await db
      .update(workExperience)
      .set(updateData)
      .where(eq(workExperience.id, id))
      .returning();

    return NextResponse.json({ experience: updatedExperience });
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update work experience" },
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
      return NextResponse.json({ error: "Invalid experience ID" }, { status: 400 });
    }

    // Check if experience exists
    const [existingExperience] = await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.id, id))
      .limit(1);

    if (!existingExperience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    await db.delete(workExperience).where(eq(workExperience.id, id));

    return NextResponse.json({ success: true, message: "Experience deleted" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Failed to delete work experience" },
      { status: 500 }
    );
  }
}
