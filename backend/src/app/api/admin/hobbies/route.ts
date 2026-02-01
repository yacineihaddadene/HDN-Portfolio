import { NextRequest, NextResponse } from "next/server";
import { db, hobbies } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { validateNotEmpty, sanitizeText, validateURL } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allHobbies = await db
      .select()
      .from(hobbies)
      .orderBy(asc(hobbies.order));
    return NextResponse.json({ hobbies: allHobbies });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
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
    const { title, description, imageUrl, color, order } = body;

    if (!title || typeof title !== "object" || !("en" in title) || !validateNotEmpty(String((title as { en?: string }).en ?? ""))) {
      return NextResponse.json({ error: "Title (English) is required" }, { status: 400 });
    }

    if (imageUrl && !validateURL(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid image URL" },
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

    const [newHobby] = await db
      .insert(hobbies)
      .values({
        title: toBilingual(title as { en?: string; fr?: string }),
        description: toBilingualOpt(description),
        imageUrl: imageUrl || null,
        color: color || null,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ hobby: newHobby }, { status: 201 });
  } catch (error) {
    console.error("Error creating hobby:", error);
    return NextResponse.json(
      { error: "Failed to create hobby" },
      { status: 500 }
    );
  }
}
