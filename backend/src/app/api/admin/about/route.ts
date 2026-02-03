import { NextRequest, NextResponse } from "next/server";
import { db, about } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { validateNotEmpty, sanitizeText } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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

export async function PUT(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { welcomeText, mainHeading, subtext } = body;

    // Validation
    if (
      !welcomeText ||
      typeof welcomeText !== "object" ||
      !welcomeText.en ||
      !welcomeText.fr
    ) {
      return NextResponse.json(
        {
          error: "Welcome text must be an object with 'en' and 'fr' properties",
        },
        { status: 400 },
      );
    }

    if (
      !mainHeading ||
      typeof mainHeading !== "object" ||
      !mainHeading.en ||
      !mainHeading.fr
    ) {
      return NextResponse.json(
        {
          error: "Main heading must be an object with 'en' and 'fr' properties",
        },
        { status: 400 },
      );
    }

    if (!subtext || typeof subtext !== "object" || !subtext.en || !subtext.fr) {
      return NextResponse.json(
        { error: "Subtext must be an object with 'en' and 'fr' properties" },
        { status: 400 },
      );
    }

    if (
      !validateNotEmpty(welcomeText.en) ||
      !validateNotEmpty(welcomeText.fr)
    ) {
      return NextResponse.json(
        { error: "Welcome text in both languages is required" },
        { status: 400 },
      );
    }

    if (
      !validateNotEmpty(mainHeading.en) ||
      !validateNotEmpty(mainHeading.fr)
    ) {
      return NextResponse.json(
        { error: "Main heading in both languages is required" },
        { status: 400 },
      );
    }

    if (!validateNotEmpty(subtext.en) || !validateNotEmpty(subtext.fr)) {
      return NextResponse.json(
        { error: "Subtext in both languages is required" },
        { status: 400 },
      );
    }

    // Sanitize
    const sanitizedWelcomeText = {
      en: sanitizeText(welcomeText.en),
      fr: sanitizeText(welcomeText.fr),
    };
    const sanitizedMainHeading = {
      en: sanitizeText(mainHeading.en),
      fr: sanitizeText(mainHeading.fr),
    };
    const sanitizedSubtext = {
      en: sanitizeText(subtext.en),
      fr: sanitizeText(subtext.fr),
    };

    // Get the first about record (there should only be one)
    const [existingAbout] = await db.select().from(about).limit(1);

    if (!existingAbout) {
      // Create new about record if none exists
      const [newAbout] = await db
        .insert(about)
        .values({
          welcomeText: sanitizedWelcomeText,
          mainHeading: sanitizedMainHeading,
          subtext: sanitizedSubtext,
        })
        .returning();

      return NextResponse.json({ about: newAbout }, { status: 201 });
    }

    // Update existing about record
    const [updatedAbout] = await db
      .update(about)
      .set({
        welcomeText: sanitizedWelcomeText,
        mainHeading: sanitizedMainHeading,
        subtext: sanitizedSubtext,
        updatedAt: new Date(),
      })
      .where(eq(about.id, existingAbout.id))
      .returning();

    return NextResponse.json({ about: updatedAbout });
  } catch (error) {
    console.error("Error updating about data:", error);
    return NextResponse.json(
      { error: "Failed to update about data" },
      { status: 500 },
    );
  }
}
