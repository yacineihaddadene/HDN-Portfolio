/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 */

function validateSecret(name: string, value: string | undefined, minLength: number = 32): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `This variable must be set and cannot be empty.`
    );
  }
  
  if (value.length < minLength) {
    throw new Error(
      `Environment variable ${name} is too short (minimum ${minLength} characters). ` +
      `This is a security requirement.`
    );
  }
  
  // Check for common weak/default values
  const weakValues = [
    "dev_secret_change_me",
    "change_me",
    "secret",
    "password",
    "123456",
    "default",
  ];
  
  if (weakValues.some(weak => value.toLowerCase().includes(weak))) {
    throw new Error(
      `Environment variable ${name} contains a weak/default value. ` +
      `Please use a strong, randomly generated secret.`
    );
  }
  
  return value;
}

function validateRequired(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `This variable must be set.`
    );
  }
  return value;
}

export function validateAuthEnvironment() {
  const errors: string[] = [];
  
  try {
    // Validate secrets (must be at least 32 characters)
    validateSecret("BETTER_AUTH_SECRET", process.env.BETTER_AUTH_SECRET);
    validateSecret("AUTH_JWT_SECRET", process.env.AUTH_JWT_SECRET);
    validateSecret("BETTER_AUTH_JWT_SECRET", process.env.BETTER_AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET);
    
    // Validate required config
    validateRequired("DATABASE_URL", process.env.DATABASE_URL);
    validateRequired("BETTER_AUTH_URL", process.env.BETTER_AUTH_URL);
    
    // Validate CORS origins (at least one must be set)
    const corsOrigins = process.env.CORS_ORIGINS;
    if (!corsOrigins || corsOrigins.trim().length === 0) {
      errors.push("CORS_ORIGINS environment variable is required. Set it to comma-separated list of allowed origins.");
    }
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  
  if (errors.length > 0) {
    console.error("=".repeat(80));
    console.error("ENVIRONMENT VALIDATION FAILED");
    console.error("=".repeat(80));
    errors.forEach(err => console.error(`   ${err}`));
    console.error("=".repeat(80));
    console.error("\nPlease set all required environment variables before starting the application.");
    console.error("See .env.example or documentation for required variables.\n");
    process.exit(1);
  }
  
  console.log("✅ Environment variables validated successfully");
}

