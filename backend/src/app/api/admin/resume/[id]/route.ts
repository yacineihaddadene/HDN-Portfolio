import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateUUID, validateNotEmpty, validateURL, sanitizeText } from "@/lib/utils/validation";

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
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    const body = await request.json();
    const { filename, fileUrl, isActive, language } = body;

    // Check if resume exists first
    const [existingResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .limit(1);

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      filename?: string;
      fileUrl?: string;
      isActive?: boolean;
      language?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // If filename is provided, validate and update it
    if (filename !== undefined) {
      if (!validateNotEmpty(filename)) {
        return NextResponse.json(
          { error: "Filename is required" },
          { status: 400 }
        );
      }
      updateData.filename = sanitizeText(filename);
    }

    // If fileUrl is provided, validate and update it
    if (fileUrl !== undefined) {
      if (!validateURL(fileUrl)) {
        return NextResponse.json(
          { error: "Valid file URL is required" },
          { status: 400 }
        );
      }
      updateData.fileUrl = fileUrl;
    }

    // If language is provided, validate and update it
    if (language !== undefined) {
      updateData.language = language === 'fr' ? 'fr' : 'en';
    }

    // Determine the language to use for deactivation
    const targetLanguage = updateData.language || existingResume.language;

    // If isActive is provided, update it
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      
      // If setting this resume as active, deactivate all others with the same language
      if (isActive) {
        await db
          .update(resumes)
          .set({ isActive: false })
          .where(eq(resumes.language, targetLanguage));
      }
    }

    // Update the resume
    const [updatedResume] = await db
      .update(resumes)
      .set(updateData)
      .where(eq(resumes.id, id))
      .returning();

    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
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
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 });
    }

    // Check if resume exists
    const [existingResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .limit(1);

    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await db.delete(resumes).where(eq(resumes.id, id));

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
