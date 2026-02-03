import { NextRequest, NextResponse } from "next/server";
import { db, about } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    // Get the first (and only) about record
    const [aboutData] = await db.select().from(about).limit(1);

    if (!aboutData) {
      return NextResponse.json(
        { error: "About data not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ about: aboutData });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return NextResponse.json(
      { error: "Failed to fetch about data" },
      { status: 500 },
    );
  }
}
