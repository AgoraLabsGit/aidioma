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
    writeFile(path.join(docsRoot, "FIXES.yaml"), "[]\n"),
    writeFile(path.join(docsRoot, "DECISIONS.md"), "# Decisions\n"),
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
    expect(html).toContain("AIdioma");
    expect(html).toContain('data-page="active"');
    expect(html).toContain('data-page="roadmap"');
  });
});
