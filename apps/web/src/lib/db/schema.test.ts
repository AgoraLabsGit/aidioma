import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  learnerItemStates,
  lessons,
  practiceAttempts,
  practiceSessions,
  savedPracticeItems,
} from "./schema";

describe("lessons schema declaration", () => {
  it("leaves deferred ordinal uniqueness to authoritative SQL migrations", () => {
    const indexNames = getTableConfig(lessons).indexes.map((index) => index.config.name);

    expect(indexNames).toContain("lessons_slug_unique");
    expect(indexNames).not.toContain("lessons_ordinal_unique");
  });
});

describe("durable production-first Practice schema", () => {
  it("retains sessions, idempotent attempts, undirected item state, and All saved identity", () => {
    const session = getTableConfig(practiceSessions);
    const attempts = getTableConfig(practiceAttempts);
    const state = getTableConfig(learnerItemStates);
    const saved = getTableConfig(savedPracticeItems);

    expect(session.indexes.map((index) => index.config.name)).toContain(
      "practice_sessions_learner_status_idx",
    );
    expect(attempts.indexes.map((index) => index.config.name)).toContain(
      "practice_attempts_session_offer_unique",
    );
    expect(state.indexes.map((index) => index.config.name)).toContain(
      "learner_item_states_identity_unique",
    );
    expect(saved.indexes.map((index) => index.config.name)).toContain(
      "saved_practice_items_identity_unique",
    );
    expect(attempts.columns.map((column) => column.name)).not.toContain("direction");
    expect(state.columns.map((column) => column.name)).not.toContain("direction");
  });
});
