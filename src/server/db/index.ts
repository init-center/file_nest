import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schemas";

function createDB() {
  const neonDBUrl = process.env.NEON_DB_URL;
  if (neonDBUrl) {
    const client = neon(neonDBUrl);
    return drizzleHttp(client, {
      schema,
    });
  }
  const queryClient = postgres(
    "postgres://postgres:postgres@0.0.0.0:55000/file_nest"
  );
  return drizzle(queryClient, {
    schema,
  });
}

export default createDB();
