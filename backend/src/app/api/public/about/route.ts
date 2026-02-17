import { NextRequest, NextResponse } from "next/server";
import { db, about } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    // Get the first (and only) about record
    const [aboutData] = await db.select().from(about).limit(1);

    // Return 200 with null when no about record (so page still loads; frontend handles null)
    return NextResponse.json({ about: aboutData ?? null });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return NextResponse.json(
      { error: "Failed to fetch about data" },
      { status: 500 },
    );
  }
}
