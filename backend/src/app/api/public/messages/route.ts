import { NextRequest, NextResponse } from "next/server";
import { db, contactMessages } from "@/lib/db";
import {
  validateEmail,
  sanitizeText,
  validateNotEmpty,
} from "@/lib/utils/validation";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitErrorResponse,
} from "@/lib/utils/rate-limiter";
import { verifyRecaptchaToken } from "@/lib/utils/recaptcha";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 messages per 20 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 5, 20 * 60 * 1000);

    if (rateLimit.isLimited) {
      const errorResponse = getRateLimitErrorResponse(rateLimit.retryAfter!);
      return NextResponse.json(
        {
          error: errorResponse.error,
          message: errorResponse.message,
        },
        { status: 429, headers: { "Retry-After": errorResponse.retryAfter.toString() } }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, captchaToken } = body;

    // Optional reCAPTCHA verification (enforced when RECAPTCHA_SECRET_KEY is set)
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!captchaToken || typeof captchaToken !== "string") {
        return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 },
        );
      }
      const captchaResult = await verifyRecaptchaToken(captchaToken, clientIP);
      if (!captchaResult.success) {
        console.error(
          "reCAPTCHA verification failed for contact message:",
          captchaResult["error-codes"],
        );
        return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 },
        );
      }
    }

    // Validation
    if (!validateNotEmpty(name)) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(subject)) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!validateNotEmpty(message)) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedSubject = sanitizeText(subject);
    const sanitizedMessage = sanitizeText(message);

    // Insert message
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        name: sanitizedName,
        email: email.trim().toLowerCase(),
        subject: sanitizedSubject,
        message: sanitizedMessage,
        status: "unread",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: newMessage.id,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
