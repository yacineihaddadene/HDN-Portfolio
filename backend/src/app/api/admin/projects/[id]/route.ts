import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import {
  validateNotEmpty,
  sanitizeText,
  validateURL,
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
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if project exists
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "object" || !body.title.en || !body.title.fr) {
        return NextResponse.json(
          { error: "Title must be an object with 'en' and 'fr' properties" },
          { status: 400 }
        );
      }
      updateData.title = {
        en: sanitizeText(body.title.en),
        fr: sanitizeText(body.title.fr),
      };
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "object" || !body.description.en || !body.description.fr) {
        return NextResponse.json(
          { error: "Description must be an object with 'en' and 'fr' properties" },
          { status: 400 }
        );
      }
      updateData.description = {
        en: sanitizeText(body.description.en),
        fr: sanitizeText(body.description.fr),
      };
    }

    if (body.fullDescription !== undefined) {
      if (body.fullDescription === null) {
        updateData.fullDescription = null;
      } else if (typeof body.fullDescription === "object" && body.fullDescription.en && body.fullDescription.fr) {
        updateData.fullDescription = {
          en: sanitizeText(body.fullDescription.en),
          fr: sanitizeText(body.fullDescription.fr),
        };
      } else {
        return NextResponse.json(
          { error: "Full description must be an object with 'en' and 'fr' properties or null" },
          { status: 400 }
        );
      }
    }

    if (body.client !== undefined) {
      updateData.client = body.client ? sanitizeText(body.client) : null;
    }

    if (body.projectUrl !== undefined) {
      if (body.projectUrl && !validateURL(body.projectUrl)) {
        return NextResponse.json(
          { error: "Invalid project URL" },
          { status: 400 }
        );
      }
      updateData.projectUrl = body.projectUrl || null;
    }

    if (body.githubUrl !== undefined) {
      if (body.githubUrl && !validateURL(body.githubUrl)) {
        return NextResponse.json(
          { error: "Invalid GitHub URL" },
          { status: 400 }
        );
      }
      updateData.githubUrl = body.githubUrl || null;
    }

    if (body.imageUrl !== undefined) {
      if (body.imageUrl && !validateURL(body.imageUrl)) {
        return NextResponse.json(
          { error: "Invalid image URL" },
          { status: 400 }
        );
      }
      updateData.imageUrl = body.imageUrl || null;
    }

    if (body.color !== undefined) {
      updateData.color = body.color || null;
    }

    if (body.technologies !== undefined) {
      updateData.technologies = Array.isArray(body.technologies) ? body.technologies : [];
    }

    if (body.startDate !== undefined) {
      if (body.startDate && !validateDate(body.startDate)) {
        return NextResponse.json(
          { error: "Invalid start date format (YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      updateData.startDate = body.startDate || null;
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

    if (body.status !== undefined) {
      if (!["draft", "published"].includes(body.status)) {
        return NextResponse.json(
          { error: "Status must be 'draft' or 'published'" },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.featured !== undefined) {
      updateData.featured = body.featured === true;
    }

    updateData.updatedAt = new Date();

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Check if project exists
    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db.delete(projects).where(eq(projects.id, id));

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
