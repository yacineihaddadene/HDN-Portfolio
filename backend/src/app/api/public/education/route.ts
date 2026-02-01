import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    const rows = await db
      .select()
      .from(education)
      .orderBy(desc(education.startDate), education.order);

    const educationEntries = rows.map((e) => ({
      ...e,
      degree: extractLanguageFromJsonb(e.degree, lang),
      institution: extractLanguageFromJsonb(e.institution, lang),
      location: extractLanguageFromJsonb(e.location, lang),
      description: e.description ? extractLanguageFromJsonb(e.description, lang) : null,
    }));

    return NextResponse.json({ education: educationEntries });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}
