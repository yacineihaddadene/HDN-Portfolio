import { NextRequest, NextResponse } from "next/server";
import { db, testimonials } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/jwt-verification";
import { eq } from "drizzle-orm";
import { validateUUID } from "@/lib/utils/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!validateUUID(id)) {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 });
    }

    // Check if testimonial exists
    const [existingTestimonial] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1);

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Update status to approved
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, id))
      .returning();

    return NextResponse.json({ testimonial: updatedTestimonial });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    return NextResponse.json(
      { error: "Failed to approve testimonial" },
      { status: 500 }
    );
  }
}
