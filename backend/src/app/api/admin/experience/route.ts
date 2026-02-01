import { NextRequest, NextResponse } from "next/server";
import { db, workExperience } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { validateNotEmpty, sanitizeText, validateDate } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allExperience = await db
      .select()
      .from(workExperience)
      .orderBy(desc(workExperience.startDate), workExperience.order);
    return NextResponse.json({ experiences: allExperience });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
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
    const { position, company, location, description, startDate, endDate, current, order } = body;

    // Validate bilingual objects { en, fr }
    const requireBilingual = (val: unknown, name: string) => {
      if (!val || typeof val !== "object" || !("en" in val)) {
        return NextResponse.json({ error: `${name} (English) is required` }, { status: 400 });
      }
      const o = val as { en?: string; fr?: string };
      if (!validateNotEmpty(String(o.en ?? ""))) {
        return NextResponse.json({ error: `${name} (English) is required` }, { status: 400 });
      }
      return null;
    };
    let err = requireBilingual(position, "Position");
    if (err) return err;
    err = requireBilingual(company, "Company");
    if (err) return err;
    err = requireBilingual(location, "Location");
    if (err) return err;
    err = requireBilingual(description, "Description");
    if (err) return err;

    if (!validateDate(startDate)) {
      return NextResponse.json(
        { error: "Valid start date is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (endDate && !validateDate(endDate)) {
      return NextResponse.json(
        { error: "Invalid end date format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const toBilingual = (o: { en?: string; fr?: string }) => ({
      en: sanitizeText(String(o.en ?? "").trim()),
      fr: sanitizeText(String(o.fr ?? "").trim()),
    });
    const isCurrent = current === true;
    const orderValue = order != null ? parseInt(String(order), 10) : 0;

    const [newExperience] = await db
      .insert(workExperience)
      .values({
        position: toBilingual(position as { en?: string; fr?: string }),
        company: toBilingual(company as { en?: string; fr?: string }),
        location: toBilingual(location as { en?: string; fr?: string }),
        description: toBilingual(description as { en?: string; fr?: string }),
        startDate,
        endDate: endDate || null,
        current: isCurrent,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ experience: newExperience }, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create work experience" },
      { status: 500 }
    );
  }
}
