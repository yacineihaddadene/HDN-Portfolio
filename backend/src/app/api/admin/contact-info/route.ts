import { NextRequest, NextResponse } from "next/server";
import { db, contactInfo } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { validateNotEmpty, sanitizeText } from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const allContactInfo = await db
      .select()
      .from(contactInfo)
      .orderBy(asc(contactInfo.order));
    return NextResponse.json({ contactInfo: allContactInfo });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact information" },
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
    const { type, value, order } = body;

    // Validation
    if (!validateNotEmpty(type)) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    if (!["email", "phone", "address", "social_links"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of: email, phone, address, social_links" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(value)) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    // Sanitize
    const sanitizedType = sanitizeText(type);
    const sanitizedValue = sanitizeText(value);
    const orderValue = order ? parseInt(order, 10) : 0;

    const [newContactInfo] = await db
      .insert(contactInfo)
      .values({
        type: sanitizedType,
        value: sanitizedValue,
        order: orderValue,
      })
      .returning();

    return NextResponse.json({ contactInfo: newContactInfo }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact info:", error);
    return NextResponse.json(
      { error: "Failed to create contact information" },
      { status: 500 }
    );
  }
}
