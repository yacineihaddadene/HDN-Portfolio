import { NextRequest, NextResponse } from "next/server";
import { db, testimonials } from "@/lib/db";
import { validateLanguage } from "@/lib/utils/validation";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import {
  validateEmail,
  sanitizeText,
  validateNotEmpty,
  validateRating,
} from "@/lib/utils/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = validateLanguage(searchParams.get("lang")); // For consistency

    // Only return approved testimonials
    const approvedTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.status, "approved"))
      .orderBy(desc(testimonials.submittedAt));

    return NextResponse.json({ testimonials: approvedTestimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position, company, email, message, rating } = body;

    // Validation
    if (!validateNotEmpty(name)) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(position)) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(message)) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!validateRating(rating)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedPosition = sanitizeText(position);
    const sanitizedCompany = company ? sanitizeText(company) : null;
    const sanitizedMessage = sanitizeText(message);

    // Insert testimonial with pending status
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        name: sanitizedName,
        position: sanitizedPosition,
        company: sanitizedCompany,
        email: email.trim().toLowerCase(),
        message: sanitizedMessage,
        rating: parseInt(rating, 10),
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully. It will be reviewed before publication.",
      id: newTestimonial.id,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
