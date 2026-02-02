import { NextRequest, NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency

    // Get active resume
    const activeResume = await db
      .select()
      .from(resumes)
      .where(eq(resumes.isActive, true))
      .limit(1);

    if (activeResume.length === 0) {
      return NextResponse.json(
        { resume: null },
        { status: 200 }
      );
    }

    const resume = activeResume[0];
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
