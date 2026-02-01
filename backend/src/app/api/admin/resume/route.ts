import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateNotEmpty, validateURL, sanitizeText } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get active resume
    const activeResume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.isActive, true))
      .limit(1);

    if (activeResume.length === 0) {
      return NextResponse.json({ resume: null });
    }

    return NextResponse.json({ resume: activeResume[0] });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { filename, fileUrl } = body;

    // Validation
    if (!validateNotEmpty(filename)) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    if (!validateURL(fileUrl)) {
      return NextResponse.json(
        { error: "Valid file URL is required" },
        { status: 400 }
      );
    }

    const sanitizedFilename = sanitizeText(filename);

    // Check if there's an active resume
    const [activeResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.isActive, true))
      .limit(1);

    // Deactivate all existing resumes first
    await db.update(resumes).set({ isActive: false });

    // If there was an active resume, update it; otherwise create new
    if (activeResume) {
      const [updatedResume] = await db
        .update(resumes)
        .set({
          filename: sanitizedFilename,
          fileUrl,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, activeResume.id))
        .returning();
      return NextResponse.json({ resume: updatedResume });
    } else {
      const [newResume] = await db
        .insert(resumes)
        .values({
          filename: sanitizedFilename,
          fileUrl,
          isActive: true,
        })
        .returning();
      return NextResponse.json({ resume: newResume }, { status: 201 });
    }
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}
