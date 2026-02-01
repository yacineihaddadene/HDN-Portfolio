import { NextRequest, NextResponse } from "next/server";
import { db, testimonials } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build query with optional status filter
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      const allTestimonials = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.status, status))
        .orderBy(desc(testimonials.submittedAt));
      return NextResponse.json({ testimonials: allTestimonials });
    }

    const allTestimonials = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.submittedAt));

    return NextResponse.json({ testimonials: allTestimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
