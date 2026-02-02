import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");

    // Build where conditions
    const conditions = [eq(projects.status, "published")];
    if (featured === "true") {
      conditions.push(eq(projects.featured, true));
    }

    const allProjects = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(projects.createdAt);

    // Return full bilingual objects - let frontend handle language selection
    return NextResponse.json({ projects: allProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
