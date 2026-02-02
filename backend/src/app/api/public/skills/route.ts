import { NextRequest, NextResponse } from "next/server";
import { db, skills } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const allSkills = await db.select().from(skills).orderBy(skills.order);

    // Return full bilingual objects - let frontend handle language selection
    return NextResponse.json({ skills: allSkills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
