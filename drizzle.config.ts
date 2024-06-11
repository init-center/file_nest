import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/server/db/schemas/index.ts",
  dialect: "postgresql",
  out: "./src/server/db/drizzle",
  dbCredentials: {
    host: "localhost",
    port: 55000,
    user: "postgres",
    password: "postgres",
    database: "file_nest",
  },
});
