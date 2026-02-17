const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

/**
 * Verify a Google reCAPTCHA v2 token with the Google API.
 *
 * If RECAPTCHA_SECRET_KEY is not set:
 * - In production, verification fails (more secure).
 * - In development, verification is skipped (always succeeds).
 */
export async function verifyRecaptchaToken(
  token: string,
  remoteIp?: string | null,
): Promise<RecaptchaVerifyResponse> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, "error-codes": ["missing-secret"] };
    }
    // In development, allow missing secret for easier local testing
    return { success: true };
  }

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      console.error("reCAPTCHA verify HTTP error:", res.status);
      return { success: false, "error-codes": ["http-error"] };
    }

    const data = (await res.json()) as RecaptchaVerifyResponse;
    return data;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return { success: false, "error-codes": ["network-error"] };
  }
}
