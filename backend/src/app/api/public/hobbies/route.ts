import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    const rows = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));

    const hobbiesList = rows.map((h) => ({
      ...h,
      title: extractLanguageFromJsonb(h.title, lang),
      description: h.description ? extractLanguageFromJsonb(h.description, lang) : null,
    }));

    return NextResponse.json({ hobbies: hobbiesList });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}
