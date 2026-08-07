import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertDashboardEnvironment,
  createDashboardServer,
  isAllowedHost,
  listenOnLoopback,
} from "./server.js";

const temporaryDirectories: string[] = [];
const openServers: ReturnType<typeof createDashboardServer>[] = [];

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve())),
    ),
  );
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

async function createFixture() {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "aidioma-dashboard-"));
  temporaryDirectories.push(repositoryRoot);
  const docsRoot = path.join(repositoryRoot, "Docs");
  await mkdir(path.join(docsRoot, "Roadmap", "Phases"), { recursive: true });
  await mkdir(path.join(docsRoot, "Specs", "Features"), { recursive: true });
  await mkdir(path.join(docsRoot, "Handoffs"), { recursive: true });
  await Promise.all([
    writeFile(
      path.join(docsRoot, "Roadmap", "Phases", "PHASE-001.md"),
      `---
id: PHASE-001
title: Dashboard
type: build
proof_kind: visual
state: ready
order: 1
depends_on: []
from_backlog: null
owner: founder
outcome: "See the dashboard"
proof: "/dashboard"
non_goals: []
amends_specs: []
opened: 2026-08-05
closed: null
lessons: null
---
# PHASE-001
`,
    ),
    writeFile(path.join(docsRoot, "WORK.yaml"), "[]\n"),
    writeFile(
      path.join(docsRoot, "DECISIONS.md"),
      `# Decisions

## D-001 — Fixture decision
Date: 2026-08-05 · Phase: PHASE-001 · From: — · Affects: []
Chose: Keep decisions in DECISIONS.md
Why: One living home
Revisit if: Per-file decisions land

## D-002 — Other decision
Date: 2026-08-05 · Phase: PHASE-001 · From: — · Affects: []
Chose: Second entry for section isolation
Why: Prove /api/doc slices one block
Revisit if: Never
`,
    ),
    writeFile(path.join(docsRoot, "RELEASES.md"), "# Releases\n"),
    writeFile(path.join(docsRoot, "PRODUCT.md"), "# Product\n"),
    writeFile(path.join(docsRoot, "Handoffs", "HANDOFF.md"), "# Handoff\n"),
  ]);
  return repositoryRoot;
}

async function startFixtureServer() {
  const repositoryRoot = await createFixture();
  const server = createDashboardServer({ repositoryRoot, watch: false });
  openServers.push(server);
  const port = await listenOnLoopback(server, 0);
  return { repositoryRoot, port };
}

function getJson(port: number, pathname: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "127.0.0.1", port, path: pathname, method: "GET", headers: { Host: "127.0.0.1" } },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: response.statusCode ?? 0,
            body: text ? JSON.parse(text) : null,
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

describe("work dashboard", () => {
  it("refuses production", () => {
    expect(() => assertDashboardEnvironment("production")).toThrow(/local-only/i);
  });

  it("allows only loopback hosts", () => {
    expect(isAllowedHost("127.0.0.1:4317")).toBe(true);
    expect(isAllowedHost("localhost")).toBe(true);
    expect(isAllowedHost("example.com")).toBe(false);
  });

  it("serves derived index with phases and next_command", async () => {
    const { port } = await startFixtureServer();
    const { status, body } = await getJson(port, "/api/index");
    expect(status).toBe(200);
    expect(body).toMatchObject({
      next_command: "/run",
      phases: [expect.objectContaining({ id: "PHASE-001", state: "ready" })],
    });
  });

  it("serves static shell", async () => {
    const { port } = await startFixtureServer();
    const html = await new Promise<string>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port, path: "/", method: "GET", headers: { Host: "127.0.0.1" } },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        },
      );
      req.on("error", reject);
      req.end();
    });
    expect(html).toContain('id="brand-name"');
    expect(html).toContain('id="worktrees-panel-btn"');
    expect(html).toContain('id="worktrees-panel"');
    expect(html).toContain('data-page="active"');
    expect(html).toContain('data-page="work"');
    expect(html).toContain('data-page="roadmap"');
    expect(html).toContain('id="issue-pill"');
    expect(html).toContain('id="page-signals"');
    expect(html).not.toMatch(/class="tab"[^>]*data-page="signals"/);
    expect(html).toContain('class="reindex-icon"');
    expect(html).toContain('id="commands-panel-btn"');
    expect(html).toContain('id="commands-panel"');
    const activeAt = html.indexOf('data-page="active"');
    const workAt = html.indexOf('data-page="work"');
    const roadmapAt = html.indexOf('data-page="roadmap"');
    expect(activeAt).toBeGreaterThan(-1);
    expect(workAt).toBeGreaterThan(activeAt);
    expect(roadmapAt).toBeGreaterThan(workAt);
  });

  it("serves individual decision bodies from DECISIONS.md", async () => {
    const { port } = await startFixtureServer();
    const { status, body } = await getJson(port, "/api/doc?id=D-001");
    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: "D-001",
      path: path.join("Docs", "DECISIONS.md"),
    });
    const doc = body as { body: string };
    expect(doc.body).toContain("## D-001 — Fixture decision");
    expect(doc.body).toContain("Chose: Keep decisions in DECISIONS.md");
    expect(doc.body).not.toContain("## D-002");
  });

  it("404s unknown decision ids", async () => {
    const { port } = await startFixtureServer();
    const { status, body } = await getJson(port, "/api/doc?id=D-999");
    expect(status).toBe(404);
    expect(body).toMatchObject({ error: "Document not found." });
  });

  it("404s missing static assets without treating ENOENT as a server error", async () => {
    const repositoryRoot = await createFixture();
    const emptyPublic = path.join(repositoryRoot, "empty-public");
    await mkdir(emptyPublic, { recursive: true });
    const errors: unknown[] = [];
    const server = createDashboardServer({
      repositoryRoot,
      watch: false,
      publicDirectory: emptyPublic,
      onError: (error) => errors.push(error),
    });
    openServers.push(server);
    const port = await listenOnLoopback(server, 0);
    const result = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port, path: "/", method: "GET", headers: { Host: "127.0.0.1" } },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
    expect(result.status).toBe(404);
    expect(result.body).toMatch(/not found/i);
    expect(errors).toEqual([]);
  });

  it("overlays active phase docs from a linked worktree onto primary-rooted index", async () => {
    const primary = await createFixture();
    const overlay = await mkdtemp(path.join(tmpdir(), "aidioma-dash-overlay-"));
    temporaryDirectories.push(overlay);
    await mkdir(path.join(overlay, "Docs", "Roadmap", "Phases"), { recursive: true });
    await mkdir(path.join(overlay, "Docs", "Handoffs"), { recursive: true });
    await writeFile(
      path.join(overlay, "Docs", "Roadmap", "Phases", "PHASE-001.md"),
      `---
id: PHASE-001
title: Dashboard
type: build
proof_kind: visual
state: active
order: 1
depends_on: []
from_backlog: null
owner: founder
outcome: "See the dashboard"
proof: "/dashboard"
non_goals: []
amends_specs: []
opened: 2026-08-05
closed: null
lessons: null
---
# PHASE-001 overlay
`,
    );
    await writeFile(
      path.join(overlay, "Docs", "Handoffs", "HANDOFF.md"),
      "# Handoff\nFrom overlay worktree\n",
    );

    const worktrees = [
      { path: primary, head: null, branch: "main", isPrimary: true as const },
      { path: overlay, head: null, branch: "phase/001", isPrimary: false as const },
    ];
    const server = createDashboardServer({
      repositoryRoot: primary,
      watch: false,
      worktrees,
    });
    openServers.push(server);
    const port = await listenOnLoopback(server, 0);

    const { status, body } = await getJson(port, "/api/index");
    expect(status).toBe(200);
    expect(body).toMatchObject({
      phases: [expect.objectContaining({ id: "PHASE-001", state: "active" })],
      handoff: expect.objectContaining({ body: expect.stringContaining("From overlay worktree") }),
      projection_roots: expect.objectContaining({
        overlay_phase: "PHASE-001",
        overlay_branch: "phase/001",
      }),
    });

    const doc = await getJson(port, "/api/doc?id=HANDOFF");
    expect(doc.status).toBe(200);
    expect((doc.body as { body: string }).body).toContain("From overlay worktree");
  });
});
