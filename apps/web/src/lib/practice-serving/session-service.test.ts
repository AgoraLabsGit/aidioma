import { describe, expect, it } from "vitest";

import { InMemoryPracticeSessionRepository } from "./in-memory-session-repository";
import {
  PracticeSessionService,
  type PracticeSessionEvaluation,
  type PracticeSessionEvaluator,
  type RetainedAdaptiveSession,
} from "./session-service";
import { resolvePromotedPracticeSource } from "./promoted-source";

function graded(verdict: "correct" | "wrong"): PracticeSessionEvaluation {
  return verdict === "correct"
    ? {
        status: "graded",
        evaluation: { status: "graded", score: 100, verdict, feedback: "Correct.", errorTags: [], evalSource: "comparison" },
      }
    : {
        status: "graded",
        evaluation: {
          status: "graded",
          score: 35,
          verdict,
          feedback: "Use the active Argentine form.",
          errorTags: [],
          evalSource: "comparison",
          correction: { text: "Vos vivís acá.", highlights: [] },
        },
      };
}

class QueueEvaluator implements PracticeSessionEvaluator {
  readonly queue: PracticeSessionEvaluation[] = [graded("wrong"), graded("correct")];
  async evaluate() {
    return this.queue.shift() ?? graded("correct");
  }
}

describe("durable Practice session service", () => {
  it("retains miss, retry, save, pause/resume, completion, and stale-request protection", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    const service = new PracticeSessionService(repository, new QueueEvaluator(), {
      now: () => new Date("2026-08-24T20:00:00.000Z"),
      randomId: () => "session-1",
      seed: () => "seed-1",
    });
    const started = await service.start({ learnerId: "learner-1", profile: "es-AR", sourceKind: "collection" });
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.value.session.currentOffer.reason).toBe("new_in_scope");

    const missed = await service.answer({
      answer: "Tú vives aquí.",
      learnerId: "learner-1",
      offerOrdinal: 1,
      sessionId: "session-1",
    });
    expect(missed.ok).toBe(true);
    if (!missed.ok) return;
    expect(missed.value.record.session.currentOffer.reason).toBe("retry_after_miss");
    expect(missed.value.record.session.attempts[0].correction).toEqual({
      text: "Vos vivís acá.",
      highlights: [],
    });
    expect(repository.attempts.size).toBe(1);

    const duplicate = await service.answer({
      answer: "duplicate",
      learnerId: "learner-1",
      offerOrdinal: 1,
      sessionId: "session-1",
    });
    expect(duplicate).toMatchObject({ ok: false, failure: "session_conflict" });
    expect(repository.attempts.size).toBe(1);

    const saved = await service.setSaved({ itemId: "unit.a1.you-live-here", learnerId: "learner-1", saved: true, sessionId: "session-1" });
    expect(saved).toEqual({ ok: true, value: ["unit.a1.you-live-here"] });
    expect(repository.attempts.size).toBe(1);

    expect((await service.changeStatus({ learnerId: "learner-1", sessionId: "session-1", status: "paused" }))).toMatchObject({ ok: true, value: { status: "paused" } });
    expect(await service.current("learner-1")).toMatchObject({ ok: true, value: { status: "paused" } });
    expect((await service.changeStatus({ learnerId: "learner-1", sessionId: "session-1", status: "active" }))).toMatchObject({ ok: true, value: { status: "active" } });

    const corrected = await service.answer({ answer: "Vos vivís acá.", learnerId: "learner-1", offerOrdinal: 2, sessionId: "session-1" });
    expect(corrected).toMatchObject({ ok: true, value: { evaluation: { verdict: "correct" } } });
    expect(repository.attempts.size).toBe(2);
    expect(repository.evidence.get("learner-1\u001funit.a1.you-live-here")).toMatchObject({ unresolvedMisses: 0, seenCount: 2 });
  });

  it("uses the same promoted session contract for collection and All saved", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    let sequence = 0;
    const service = new PracticeSessionService(repository, new QueueEvaluator(), {
      randomId: () => `session-${++sequence}`,
      seed: () => "seed",
    });
    const collection = await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" });
    expect(collection).toMatchObject({ ok: true, value: { session: { source: { kind: "collection" } } } });
    if (collection.ok) await service.changeStatus({ learnerId: "learner", sessionId: collection.value.session.sessionId, status: "ended" });
    expect(await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "saved" })).toMatchObject({ ok: false, failure: "empty_saved_scope" });
    const nextCollection = await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" });
    if (!nextCollection.ok) throw new Error("Expected collection session.");
    await service.setSaved({ itemId: "unit.a1.you-live-here", learnerId: "learner", saved: true, sessionId: nextCollection.value.session.sessionId });
    await service.changeStatus({ learnerId: "learner", sessionId: nextCollection.value.session.sessionId, status: "ended" });
    expect(await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "saved" })).toMatchObject({ ok: true, value: { session: { source: { kind: "saved", id: "saved.all" } } } });
  });

  it("gates lesson collections until completion makes them available", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    const service = new PracticeSessionService(repository, new QueueEvaluator());
    expect(await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
      sourceId: "collection.a1.present-regular-ir",
    })).toMatchObject({ ok: false, failure: "no_promoted_content" });
    repository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
    expect(await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
      sourceId: "collection.a1.present-regular-ir",
    })).toMatchObject({
      ok: true,
      value: { session: { source: { id: "collection.a1.present-regular-ir", title: "Present -ir forms" } } },
    });
  });

  it.each(["active", "paused"] as const)(
    "starts the requested recommended collection instead of resuming an unrelated %s session",
    async (existingStatus) => {
      const repository = new InMemoryPracticeSessionRepository();
      repository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
      let sequence = 0;
      const service = new PracticeSessionService(repository, new QueueEvaluator(), {
        randomId: () => `session-${++sequence}`,
        seed: () => "seed",
      });
      const existing = await service.start({
        learnerId: "learner",
        profile: "es-AR",
        sourceKind: "collection",
      });
      if (!existing.ok) throw new Error("Expected the initial collection session.");
      if (existingStatus === "paused") {
        await service.changeStatus({
          learnerId: "learner",
          sessionId: existing.value.session.sessionId,
          status: "paused",
        });
      }

      const recommended = await service.start({
        learnerId: "learner",
        profile: "es-AR",
        sourceKind: "collection",
        sourceId: "collection.a1.present-regular-ir",
      });

      expect(recommended).toMatchObject({
        ok: true,
        value: {
          session: {
            sessionId: "session-2",
            source: { id: "collection.a1.present-regular-ir", title: "Present -ir forms" },
          },
        },
      });
      expect(await repository.findSession("learner", "session-1")).toMatchObject({
        status: "ended",
      });
    },
  );

  it("fails closed before reloading or grading a retained session whose promotion changed", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    const evaluator = new QueueEvaluator();
    let available = true;
    const service = new PracticeSessionService(repository, evaluator, {
      randomId: () => "session-stale",
      seed: () => "seed",
      resolveCollection: (profile) => {
        const promoted = resolvePromotedPracticeSource(profile);
        if (!available || promoted.status !== "ready") {
          return { status: "unavailable", reason: "promotion_integrity_failed" };
        }
        return promoted;
      },
    });
    const started = await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
    });
    if (!started.ok) throw new Error("Expected a promoted session.");

    available = false;
    expect(await service.current("learner")).toMatchObject({
      ok: false,
      failure: "no_promoted_content",
    });
    expect(await service.answer({
      answer: "Vos vivís acá.",
      learnerId: "learner",
      offerOrdinal: 1,
      sessionId: "session-stale",
    })).toMatchObject({ ok: false, failure: "no_promoted_content" });
    expect(evaluator.queue).toHaveLength(2);
    expect(repository.attempts.size).toBe(0);
  });

  it("rejects retained item and source-version drift without mutating progress", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    const evaluator = new QueueEvaluator();
    let changed = false;
    const service = new PracticeSessionService(repository, evaluator, {
      randomId: () => "session-version",
      seed: () => "seed",
      resolveCollection: (profile) => {
        const promoted = resolvePromotedPracticeSource(profile);
        if (!changed || promoted.status !== "ready") return promoted;
        return {
          ...promoted,
          items: promoted.items.map((item) => ({ ...item, contentVersion: 2 })),
          source: { ...promoted.source, version: `${promoted.source.version}-changed` },
        };
      },
    });
    const started = await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
    });
    if (!started.ok) throw new Error("Expected a promoted session.");

    changed = true;
    expect(await service.current("learner")).toMatchObject({
      ok: false,
      failure: "no_promoted_content",
    });
    expect(await service.answer({
      answer: "Vos vivís acá.",
      learnerId: "learner",
      offerOrdinal: 1,
      sessionId: "session-version",
    })).toMatchObject({ ok: false, failure: "no_promoted_content" });
    expect(evaluator.queue).toHaveLength(2);
    expect(repository.attempts.size).toBe(0);
  });

  it("replaces a same-source stale session when the learner explicitly starts again", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    let changed = false;
    let sequence = 0;
    const service = new PracticeSessionService(repository, new QueueEvaluator(), {
      randomId: () => `session-restart-${++sequence}`,
      seed: () => "seed",
      resolveCollection: (profile) => {
        const promoted = resolvePromotedPracticeSource(profile);
        if (!changed || promoted.status !== "ready") return promoted;
        return {
          ...promoted,
          items: promoted.items.map((item) => ({ ...item, contentVersion: 2 })),
          source: { ...promoted.source, version: `${promoted.source.version}-changed` },
        };
      },
    });
    const first = await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" });
    if (!first.ok) throw new Error("Expected the initial session.");

    changed = true;
    const restarted = await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" });
    expect(restarted).toMatchObject({
      ok: true,
      value: {
        session: {
          items: [{ contentVersion: 2 }],
          sessionId: "session-restart-2",
          source: { version: "unit.a1.you-live-here@1-changed" },
        },
      },
    });
    expect(await repository.findSession("learner", "session-restart-1")).toMatchObject({ status: "ended" });
  });

  it("validates and replaces a stale concurrent session-creation winner", async () => {
    const staleRepository = new InMemoryPracticeSessionRepository();
    const staleService = new PracticeSessionService(staleRepository, new QueueEvaluator(), {
      randomId: () => "session-race-stale",
      seed: () => "seed",
    });
    const stale = await staleService.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" });
    if (!stale.ok) throw new Error("Expected the stale session fixture.");
    const staleRecord = stale.value;

    class RaceRepository extends InMemoryPracticeSessionRepository {
      private returnedWinner = false;

      override async createSession(record: RetainedAdaptiveSession) {
        if (!this.returnedWinner) {
          this.returnedWinner = true;
          return super.createSession(staleRecord);
        }
        return super.createSession(record);
      }
    }

    const repository = new RaceRepository();
    const service = new PracticeSessionService(repository, new QueueEvaluator(), {
      randomId: () => "session-race-current",
      seed: () => "seed",
      resolveCollection: (profile) => {
        const promoted = resolvePromotedPracticeSource(profile);
        if (promoted.status !== "ready") return promoted;
        return {
          ...promoted,
          items: promoted.items.map((item) => ({ ...item, contentVersion: 2 })),
          source: { ...promoted.source, version: `${promoted.source.version}-changed` },
        };
      },
    });

    expect(await service.start({ learnerId: "learner", profile: "es-AR", sourceKind: "collection" })).toMatchObject({
      ok: true,
      value: { session: { sessionId: "session-race-current", items: [{ contentVersion: 2 }] } },
    });
    expect(await repository.findSession("learner", "session-race-stale")).toMatchObject({ status: "ended" });
  });

  it("returns a conflict without ending an unrelated collection that wins session creation", async () => {
    const winnerRepository = new InMemoryPracticeSessionRepository();
    winnerRepository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
    const winnerService = new PracticeSessionService(winnerRepository, new QueueEvaluator(), {
      randomId: () => "session-unrelated",
      seed: () => "seed",
    });
    const winner = await winnerService.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
      sourceId: "collection.a1.present-regular-ir",
    });
    if (!winner.ok) throw new Error("Expected the unrelated collection fixture.");
    const winnerRecord = winner.value;

    class RaceRepository extends InMemoryPracticeSessionRepository {
      override async createSession() {
        return super.createSession(winnerRecord);
      }
    }

    const repository = new RaceRepository();
    repository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
    const service = new PracticeSessionService(repository, new QueueEvaluator(), {
      randomId: () => "session-requested",
      seed: () => "seed",
    });

    expect(await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceKind: "collection",
    })).toMatchObject({ ok: false, failure: "session_conflict" });
    expect(await repository.findSession("learner", "session-unrelated")).toMatchObject({
      status: "active",
    });
  });

  it("revokes a recommended collection before reload, resume, save, or grading", async () => {
    const repository = new InMemoryPracticeSessionRepository();
    const evaluator = new QueueEvaluator();
    repository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
    const service = new PracticeSessionService(repository, evaluator, {
      randomId: () => "session-revoked",
      seed: () => "seed",
    });
    const started = await service.start({
      learnerId: "learner",
      profile: "es-AR",
      sourceId: "collection.a1.present-regular-ir",
      sourceKind: "collection",
    });
    if (!started.ok) throw new Error("Expected the unlocked collection.");
    await service.changeStatus({ learnerId: "learner", sessionId: "session-revoked", status: "paused" });

    repository.unlocked.delete("learner");
    expect(await service.current("learner")).toMatchObject({ ok: false, failure: "no_promoted_content" });
    expect(await service.changeStatus({ learnerId: "learner", sessionId: "session-revoked", status: "active" })).toMatchObject({ ok: false, failure: "no_promoted_content" });
    expect(await service.setSaved({ itemId: "unit.a1.you-live-here", learnerId: "learner", saved: true, sessionId: "session-revoked" })).toMatchObject({ ok: false, failure: "no_promoted_content" });

    repository.unlocked.set("learner", new Set(["collection.a1.present-regular-ir"]));
    await service.changeStatus({ learnerId: "learner", sessionId: "session-revoked", status: "active" });
    repository.unlocked.delete("learner");
    expect(await service.answer({ answer: "Vos vivís acá.", learnerId: "learner", offerOrdinal: 1, sessionId: "session-revoked" })).toMatchObject({ ok: false, failure: "no_promoted_content" });
    expect(evaluator.queue).toHaveLength(2);
    expect(repository.attempts.size).toBe(0);
    expect(repository.saved.size).toBe(0);
  });
});
