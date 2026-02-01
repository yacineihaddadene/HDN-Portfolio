import { NextRequest, NextResponse } from "next/server";
import { db, skills } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateNotEmpty, sanitizeText } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allSkills = await db.select().from(skills).orderBy(skills.order);
    return NextResponse.json({ skills: allSkills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const { name, category, order } = body;

    // Validation
    if (!name || typeof name !== "object" || !name.en || !name.fr) {
      return NextResponse.json(
        { error: "Name must be an object with 'en' and 'fr' properties" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(name.en) || !validateNotEmpty(name.fr)) {
      return NextResponse.json(
        { error: "Name in both languages is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(category)) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitizedName = {
      en: sanitizeText(name.en),
      fr: sanitizeText(name.fr),
    };
    const sanitizedCategory = sanitizeText(category);
    const orderValue = order ? parseInt(order, 10) : 0;

    const [newSkill] = await db
      .insert(skills)
      .values({
        name: sanitizedName,
        category: sanitizedCategory,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ skill: newSkill }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
