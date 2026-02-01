import { NextRequest, NextResponse } from "next/server";
import { db, skills } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateNotEmpty, sanitizeText, validateUUID } from "@/lib/utils/validation";

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
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, order } = body;

    // Check if skill exists
    const [existingSkill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1);

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "object" || !name.en || !name.fr) {
        return NextResponse.json(
          { error: "Name must be an object with 'en' and 'fr' properties" },
          { status: 400 }
        );
      }
      updateData.name = {
        en: sanitizeText(name.en),
        fr: sanitizeText(name.fr),
      };
    }

    if (category !== undefined) {
      if (!validateNotEmpty(category)) {
        return NextResponse.json(
          { error: "Category cannot be empty" },
          { status: 400 }
        );
      }
      updateData.category = sanitizeText(category);
    }

    if (order !== undefined) {
      updateData.order = parseInt(order, 10);
    }

    updateData.updatedAt = new Date();

    const [updatedSkill] = await db
      .update(skills)
      .set(updateData)
      .where(eq(skills.id, id))
      .returning();

    return NextResponse.json({ skill: updatedSkill });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
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
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 });
    }

    // Check if skill exists
    const [existingSkill] = await db
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1);

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    await db.delete(skills).where(eq(skills.id, id));

    return NextResponse.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
