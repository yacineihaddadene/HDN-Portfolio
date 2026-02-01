import { NextRequest, NextResponse } from "next/server";
import { db, education } from "@/lib/db";
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
    const allEducation = await db
      .select()
      .from(education)
      .orderBy(desc(education.startDate), education.order);
    return NextResponse.json({ education: allEducation });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
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
    const { degree, institution, location, description, startDate, endDate, gpa, order } = body;

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
    let err = requireBilingual(degree, "Degree");
    if (err) return err;
    err = requireBilingual(institution, "Institution");
    if (err) return err;
    err = requireBilingual(location, "Location");
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
    const toBilingualOpt = (o: { en?: string; fr?: string } | null | undefined) =>
      o && typeof o === "object" && "en" in o ? toBilingual(o as { en?: string; fr?: string }) : null;
    const orderValue = order != null ? parseInt(String(order), 10) : 0;
    const sanitizedGpa = gpa ? sanitizeText(String(gpa)) : null;

    const [newEducation] = await db
      .insert(education)
      .values({
        degree: toBilingual(degree as { en?: string; fr?: string }),
        institution: toBilingual(institution as { en?: string; fr?: string }),
        location: toBilingual(location as { en?: string; fr?: string }),
        description: toBilingualOpt(description),
        startDate,
        endDate: endDate || null,
        gpa: sanitizedGpa,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ education: newEducation }, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { error: "Failed to create education entry" },
      { status: 500 }
    );
  }
}
