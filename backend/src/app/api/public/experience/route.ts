import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const experiences = await db
      .select()
      .from(workExperience)
      .orderBy(desc(workExperience.startDate), workExperience.order);

    // Return full bilingual objects - let frontend handle language selection
    return NextResponse.json({ experiences });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
      { status: 500 }
    );
  }
}
