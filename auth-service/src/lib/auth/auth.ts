import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "../email/email-client";
import { createHash } from "crypto";

// Helper function to create a privacy-safe identifier from email
// Returns a deterministic hash of the email for logging purposes
function getPrivacySafeEmailIdentifier(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex").substring(0, 16);
}

// Helper function to truncate email for logging (shows first 3 chars + domain)
function getTruncatedEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return "***@***";
  const truncatedLocal = localPart.length > 3 ? `${localPart.substring(0, 3)}***` : "***";
  return `${truncatedLocal}@${domain}`;
}

// Get connection string - use placeholder during build, real value at runtime
const connectionString = process.env.DATABASE_URL || "postgres://build:build@localhost:5432/build";

// Create postgres connection
// Note: During build, this will use a placeholder connection string
// At runtime, DATABASE_URL must be set or this will fail
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Validate environment variables at runtime (not during build)
// This function will be called when the module is actually used, not during Next.js build
function validateEnvironment() {
  // Skip validation during build time - Next.js sets this during build
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return;
  }
  
  // Only validate at runtime when actually needed
  if (typeof window !== "undefined") {
    return; // Client-side, skip validation
  }
  
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_JWT_SECRET;
  const jwtSecret = process.env.BETTER_AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET || process.env.BETTER_AUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  const baseUrl = process.env.BETTER_AUTH_URL;
  
  if (!betterAuthSecret || betterAuthSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET or AUTH_JWT_SECRET must be set and be at least 32 characters long. " +
      "This is required for security."
    );
  }
  
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_JWT_SECRET or AUTH_JWT_SECRET must be set and be at least 32 characters long. " +
      "This is required for security."
    );
  }
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required.");
  }
  
  if (!baseUrl) {
    throw new Error("BETTER_AUTH_URL environment variable is required.");
  }
}

// Validate environment when module is actually used (runtime)
// This ensures validation happens when the app runs, not during build
let validationDone = false;
function ensureValidated() {
  if (!validationDone && typeof window === "undefined") {
    validateEnvironment();
    validationDone = true;
  }
}

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim()).filter(Boolean)
  : ["http://localhost:3000"]; // Fallback for development only

// Create auth instance - validation will happen when it's actually used
// During build, use placeholders; at runtime, real values will be used
export const auth = betterAuth({
  secret: (process.env.BETTER_AUTH_SECRET || process.env.AUTH_JWT_SECRET) || "build-time-placeholder-secret-must-be-32-chars-min",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: corsOrigins,
  // Allow skipping state cookie check for cross-origin OAuth (development only)
  // This is needed when frontend and auth-service are on different ports
  account: process.env.NODE_ENV === "development" ? {
    skipStateCookieCheck: true, // Only for localhost development
  } : undefined,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        // Build the reset URL with token as query parameter
        // Better Auth provides both url and token, we'll construct our own URL
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
        
        const result = await sendPasswordResetEmail(
          user.email,
          resetUrl,
          user.name || undefined
        );
        
        const userIdentifier = user.id || getPrivacySafeEmailIdentifier(user.email);
        const truncatedEmail = getTruncatedEmail(user.email);
        
        if (!result.success) {
          // Log error but don't throw - allow auth flow to continue
          console.error(`Failed to send password reset email to user ${userIdentifier} (${truncatedEmail}):`, result.error);
          if (process.env.PRIVACY_LOG_VERBOSE === "true") {
            console.error(`[VERBOSE] Full email: ${user.email}`);
          }
        } else {
          console.log(`Password reset email sent to user ${userIdentifier} (${truncatedEmail}), messageId: ${result.messageId}`);
          if (process.env.PRIVACY_LOG_VERBOSE === "true") {
            console.log(`[VERBOSE] Full email: ${user.email}`);
          }
        }
      } catch (error) {
        // Log error but don't throw - allow auth flow to continue
        const userIdentifier = user.id || getPrivacySafeEmailIdentifier(user.email);
        const truncatedEmail = getTruncatedEmail(user.email);
        console.error(`Error sending password reset email to user ${userIdentifier} (${truncatedEmail}):`, error);
        if (process.env.PRIVACY_LOG_VERBOSE === "true") {
          console.error(`[VERBOSE] Full email: ${user.email}`);
        }
      }
    },
    onPasswordReset: async ({ user }, request) => {
      // Log password reset event
      const userIdentifier = user.id || getPrivacySafeEmailIdentifier(user.email);
      const truncatedEmail = getTruncatedEmail(user.email);
      console.log(`Password reset completed for user ${userIdentifier} (${truncatedEmail})`);
      if (process.env.PRIVACY_LOG_VERBOSE === "true") {
        console.log(`[VERBOSE] Full email: ${user.email}`);
      }
    },
  },
  // Email verification (requires email service)
  emailVerification: {
    enabled: true,
    requireEmailVerification: true, // Require verification before login
    sendOnSignUp: true, // Automatically send verification email on signup
    autoSignInAfterVerification: true, // Automatically log in user after email verification
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        // Replace auth-service URL with frontend URL for email verification
        // Also replace the API path with the frontend page path
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        let verificationUrl = url.replace(
          process.env.BETTER_AUTH_URL || "http://localhost:3001",
          frontendUrl
        );
        // Replace /api/auth/verify-email with /verify-email (frontend page)
        verificationUrl = verificationUrl.replace("/api/auth/verify-email", "/verify-email");
        
        const result = await sendVerificationEmail(
          user.email,
          verificationUrl,
          user.name || undefined
        );
        
        const userIdentifier = user.id || getPrivacySafeEmailIdentifier(user.email);
        const truncatedEmail = getTruncatedEmail(user.email);
        
        if (!result.success) {
          // Log error but don't throw - allow auth flow to continue
          console.error(`Failed to send verification email to user ${userIdentifier} (${truncatedEmail}):`, result.error);
          if (process.env.PRIVACY_LOG_VERBOSE === "true") {
            console.error(`[VERBOSE] Full email: ${user.email}`);
          }
        } else {
          console.log(`Verification email sent to user ${userIdentifier} (${truncatedEmail}), messageId: ${result.messageId}`);
          if (process.env.PRIVACY_LOG_VERBOSE === "true") {
            console.log(`[VERBOSE] Full email: ${user.email}`);
          }
        }
      } catch (error) {
        // Log error but don't throw - allow auth flow to continue
        const userIdentifier = user.id || getPrivacySafeEmailIdentifier(user.email);
        const truncatedEmail = getTruncatedEmail(user.email);
        console.error(`Error sending verification email to user ${userIdentifier} (${truncatedEmail}):`, error);
        if (process.env.PRIVACY_LOG_VERBOSE === "true") {
          console.error(`[VERBOSE] Full email: ${user.email}`);
        }
      }
    },
  },
  // Google OAuth provider (only enabled if credentials are provided)
  socialProviders: 
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      // Removed strategy: "compact" - not available in stable 1.0.0
    },
    // Cookie settings for cross-origin support (localhost development)
    cookieOptions: {
      sameSite: "lax", // Allows cookies in top-level navigations
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    },
  },
  jwt: {
    secret: (process.env.BETTER_AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET || process.env.BETTER_AUTH_SECRET) || "build-time-placeholder-secret-must-be-32-chars-min",
    issuer: process.env.BETTER_AUTH_JWT_ISS || process.env.AUTH_JWT_ISS || "portfolio-auth",
    audience: process.env.BETTER_AUTH_JWT_AUD || process.env.AUTH_JWT_AUD || "portfolio-api",
    expiresIn: "1h",
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

