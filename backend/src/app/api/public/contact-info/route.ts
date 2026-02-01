import { NextRequest, NextResponse } from "next/server";
import { db, contactInfo } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency

    const contactInfoList = await db
      .select()
      .from(contactInfo)
      .orderBy(asc(contactInfo.order));

    return NextResponse.json({ contactInfo: contactInfoList });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact information" },
      { status: 500 }
    );
  }
}
