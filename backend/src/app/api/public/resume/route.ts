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
        { error: "No active resume found" },
        { status: 404 }
      );
    }

    const resume = activeResume[0];
    return NextResponse.json({
      filename: resume.filename,
      file_url: resume.fileUrl,
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}
