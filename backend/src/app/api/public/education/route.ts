import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const educationEntries = await db
      .select()
      .from(education)
      .orderBy(desc(education.startDate), education.order);

    // Return full bilingual objects - let frontend handle language selection
    return NextResponse.json({ education: educationEntries });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}
