import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/server/db/schemas/index.ts",
  dialect: "postgresql",
  out: "./src/server/db/drizzle",
  dbCredentials: {
    url: process.env.NEON_DB_URL as string,
  },
});
