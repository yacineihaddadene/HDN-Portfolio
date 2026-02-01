import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { validateLanguage, extractLanguageFromJsonb } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang"));
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

    // Extract requested language from JSONB fields
    const projectsWithLanguage = allProjects.map((project) => ({
      id: project.id,
      title: extractLanguageFromJsonb(project.title, lang),
      description: extractLanguageFromJsonb(project.description, lang),
      fullDescription: project.fullDescription
        ? extractLanguageFromJsonb(project.fullDescription, lang)
        : null,
      client: project.client,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      technologies: project.technologies || [],
      imageUrl: project.imageUrl,
      color: project.color,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      featured: project.featured,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return NextResponse.json({ projects: projectsWithLanguage });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
