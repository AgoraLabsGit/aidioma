import type { SeedLesson } from "./seed";
import {
  assertDatabaseIdentity,
  type DatabaseExpectation,
  type DatabaseIdentityRow,
} from "../db/safety";

export interface ContentSeedClient {
  identity(): Promise<DatabaseIdentityRow[]>;
  upsert(lessons: readonly SeedLesson[]): Promise<readonly (readonly unknown[])[]>;
}

export async function runContentSeed(
  client: ContentSeedClient,
  lessons: readonly SeedLesson[],
  expectation: DatabaseExpectation,
): Promise<number> {
  assertDatabaseIdentity(await client.identity(), expectation);
  const results = await client.upsert(lessons);
  return results.reduce((count, rows) => count + rows.length, 0);
}
