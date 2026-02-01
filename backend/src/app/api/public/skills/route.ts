import { NextRequest, NextResponse } from "next/server";
import { db, skills } from "@/lib/db";
import { eq } from "drizzle-orm";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));

    const allSkills = await db.select().from(skills).orderBy(skills.order);

    // Extract requested language from JSONB name field
    const skillsWithLanguage = allSkills.map((skill) => ({
      id: skill.id,
      name: extractLanguageFromJsonb(skill.name, lang),
      category: skill.category,
      order: skill.order,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }));

    return NextResponse.json({ skills: skillsWithLanguage });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
