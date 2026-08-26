import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "../../..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

test("run skill requires a coordinating phase agent", () => {
  const skill = read(".claude/skills/run/SKILL.md");
  assert.match(skill, /you are the \*\*coordinator\*\*/i);
  assert.match(skill, /Preserve your context window/);
  assert.match(skill, /Delegate coding/);
  assert.match(skill, /area of concern/);
  assert.match(skill, /Do not implement the phase yourself/);
  assert.match(skill, /One sub-agent per area/);
  assert.match(skill, /Do not start a Praxis or external/);
  assert.match(skill, /Do not give one sub-agent the whole phase/);
});

test("phase template kickoff tells the agent to coordinate", () => {
  const template = read("Docs/System/Templates/phase.md");
  assert.match(template, /## Coordination/);
  assert.match(template, /coordinator for this phase/);
  assert.match(template, /Delegate coding by area of concern/);
  assert.match(template, /preserve your context window/);
});

test("AGENTS.md routes phase /run through the coordinator", () => {
  const agents = read("AGENTS.md");
  assert.match(
    agents,
    /`\/plan` \/ `\/run` — follow `Docs\/Roadmap\/Phases\/` as coordinator/,
  );
});
