import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // During build time, DATABASE_URL might not be set, so we'll create a dummy connection
      // that will fail at runtime if actually used, but won't break the build
      if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is not set");
      }
      // For build time, use a dummy connection string
      const dummyClient = postgres("postgres://dummy:dummy@localhost:5432/dummy");
      _db = drizzle(dummyClient, { schema });
    } else {
      const client = postgres(connectionString);
      _db = drizzle(client, { schema });
    }
  }
  return _db;
}

// Export db getter - lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

// Export schema and all tables for use in other files
export { schema };
export {
  skills,
  projects,
  workExperience,
  education,
  hobbies,
  testimonials,
  contactMessages,
  resumes,
  contactInfo,
} from "./schema";
