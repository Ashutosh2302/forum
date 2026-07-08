import type { Config } from "drizzle-kit";

const isTurso = !!process.env.DATABASE_AUTH_TOKEN;

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: isTurso
    ? {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    : {
        url: process.env.DATABASE_URL ?? "file:./forum.db",
      },
} satisfies Config;
