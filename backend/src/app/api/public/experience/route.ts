import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    const rows = await db
      .select()
      .from(workExperience)
      .orderBy(desc(workExperience.startDate), workExperience.order);

    const experiences = rows.map((e) => ({
      ...e,
      position: extractLanguageFromJsonb(e.position, lang),
      company: extractLanguageFromJsonb(e.company, lang),
      location: extractLanguageFromJsonb(e.location, lang),
      description: extractLanguageFromJsonb(e.description, lang),
    }));

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
      { status: 500 }
    );
  }
}
