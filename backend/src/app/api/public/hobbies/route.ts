import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const hobbiesList = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));

    // Return full bilingual objects - let frontend handle language selection
    return NextResponse.json({ hobbies: hobbiesList });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}
