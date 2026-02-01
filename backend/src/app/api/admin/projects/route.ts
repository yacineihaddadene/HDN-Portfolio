import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import {
  validateNotEmpty,
  sanitizeText,
  validateURL,
  validateDate,
} from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.createdAt);
    return NextResponse.json({ projects: allProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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
    const {
      title,
      description,
      fullDescription,
      client,
      projectUrl,
      githubUrl,
      technologies,
      imageUrl,
      color,
      startDate,
      endDate,
      status,
      featured,
    } = body;

    // Validation
    if (!title || typeof title !== "object" || !title.en || !title.fr) {
      return NextResponse.json(
        { error: "Title must be an object with 'en' and 'fr' properties" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "object" || !description.en || !description.fr) {
      return NextResponse.json(
        { error: "Description must be an object with 'en' and 'fr' properties" },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    if (projectUrl && !validateURL(projectUrl)) {
      return NextResponse.json(
        { error: "Invalid project URL" },
        { status: 400 }
      );
    }

    if (githubUrl && !validateURL(githubUrl)) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
    }

    if (imageUrl && !validateURL(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (startDate && !validateDate(startDate)) {
      return NextResponse.json(
        { error: "Invalid start date format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (endDate && !validateDate(endDate)) {
      return NextResponse.json(
        { error: "Invalid end date format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitizedTitle = {
      en: sanitizeText(title.en),
      fr: sanitizeText(title.fr),
    };
    const sanitizedDescription = {
      en: sanitizeText(description.en),
      fr: sanitizeText(description.fr),
    };
    const sanitizedFullDescription = fullDescription
      ? {
          en: sanitizeText(fullDescription.en),
          fr: sanitizeText(fullDescription.fr),
        }
      : null;

    const [newProject] = await db
      .insert(projects)
      .values({
        title: sanitizedTitle,
        description: sanitizedDescription,
        fullDescription: sanitizedFullDescription,
        client: client ? sanitizeText(client) : null,
        projectUrl: projectUrl || null,
        githubUrl: githubUrl || null,
        technologies: Array.isArray(technologies) ? technologies : [],
        imageUrl: imageUrl || null,
        color: color || null,
        startDate: startDate || null,
        endDate: endDate || null,
        status: status || "draft",
        featured: featured === true,
      })
      .returning();

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
