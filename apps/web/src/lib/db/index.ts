import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is required when database access is requested.");
    this.name = "DatabaseConfigurationError";
  }
}

export type AIdiomaDatabase = NeonHttpDatabase<typeof schema>;

let database: AIdiomaDatabase | undefined;

export function getDatabase(): AIdiomaDatabase {
  if (database) {
    return database;
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError();
  }

  const client = neon(connectionString);
  database = drizzle({ client, schema });
  return database;
}
