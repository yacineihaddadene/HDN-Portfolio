import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq, desc } from "drizzle-orm";
import { validateNotEmpty, validateURL, sanitizeText } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    // Get all resumes, ordered by creation date (newest first)
    const allResumes = await db
      .select()
      .from(resumes)
      .orderBy(desc(resumes.createdAt));

    return NextResponse.json({ resumes: allResumes });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { filename, fileUrl, isActive, language } = body;

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

    // Validate language
    const resumeLanguage = language === 'fr' ? 'fr' : 'en';

    const sanitizedFilename = sanitizeText(filename);

    // If setting this as active, deactivate all others with the same language
    if (isActive) {
      await db.update(resumes)
        .set({ isActive: false })
        .where(eq(resumes.language, resumeLanguage));
    }

    // Create new resume
    const [newResume] = await db
      .insert(resumes)
      .values({
        filename: sanitizedFilename,
        fileUrl,
        language: resumeLanguage,
        isActive: isActive || false,
      })
      .returning();

    return NextResponse.json({ resume: newResume }, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
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
