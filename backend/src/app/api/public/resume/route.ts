import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    // Get active resume for the specified language
    const activeResume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.isActive, true))
      .limit(2); // Get up to 2 to check for language-specific

    if (activeResume.length === 0) {
      return NextResponse.json(
        { resume: null },
        { status: 200 }
      );
    }

    // Try to find resume matching the requested language
    let resume = activeResume.find(r => r.language === lang);
    
    // If no language-specific resume found, fall back to first active resume
    if (!resume) {
      resume = activeResume[0];
    }
    return NextResponse.json({
      resume: {
        id: resume.id,
        filename: resume.filename,
        fileUrl: resume.fileUrl,
        isActive: resume.isActive,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}
