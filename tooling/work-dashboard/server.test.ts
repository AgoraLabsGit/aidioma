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

async function createFixture(options: { semanticError?: boolean } = {}) {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "aidioma-dashboard-"));
  temporaryDirectories.push(repositoryRoot);
  const docsRoot = path.join(repositoryRoot, "Docs");
  await mkdir(path.join(docsRoot, "Specs"), { recursive: true });
  await Promise.all([
    writeFile(path.join(docsRoot, "INDEX.md"), "# Index\n"),
    writeFile(path.join(docsRoot, "HANDOFF.md"), "# Handoff\n"),
    writeFile(
      path.join(docsRoot, "PRODUCT.md"),
      `---
id: PRODUCT-001
title: Product principles
area: product
status: draft
implementation: none
founder_review: required
updated: 2026-08-03
---
# Product
`,
    ),
    writeFile(
      path.join(docsRoot, "WORK.yaml"),
      options.semanticError
        ? `version: 1
work:
  - id: SYSTEM-WORK-001
    title: System work
    area: system
    status: active
    kind: system
    founder_approval: approved
    summary: System work needs a specification.
    spec: null
    dependencies: []
    blocked_by: []
    reusable_by: [all-surfaces]
    next_slice: Plan the work.
    evidence: [Approval recorded.]
`
        : "version: 1\nwork: []\n",
    ),
    writeFile(path.join(docsRoot, "FIXES.yaml"), "version: 1\nfixes: []\n"),
  ]);
  return repositoryRoot;
}

async function startFixtureServer(options: { semanticError?: boolean } = {}) {
  const repositoryRoot = await createFixture(options);
  const server = createDashboardServer({ repositoryRoot });
  openServers.push(server);
  const port = await listenOnLoopback(server, 0);
  return { port, server };
}

type ResponseHeaders = Record<string, string | string[] | undefined>;

function rawRequest(port: number, options: { host?: string; method?: string; path?: string }) {
  return new Promise<{ body: string; headers: ResponseHeaders; status: number }>(
    (resolve, reject) => {
      let responseHeaders: ResponseHeaders = {};
      const outgoing = request(
        {
          host: "127.0.0.1",
          port,
          method: options.method ?? "GET",
          path: options.path ?? "/",
          headers: options.host ? { Host: options.host } : undefined,
        },
        (response) => {
          responseHeaders = response.headers;
          let body = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => { body += chunk; });
          response.on("end", () =>
            resolve({ body, headers: responseHeaders, status: response.statusCode ?? 0 }),
          );
        },
      );
      outgoing.once("error", reject);
      outgoing.end();
    },
  );
}

describe("dashboard boundary", () => {
  it("accepts only loopback Host values and refuses production", () => {
    expect(isAllowedHost("127.0.0.1:4317")).toBe(true);
    expect(isAllowedHost("localhost:4317")).toBe(true);
    expect(isAllowedHost("127.0.0.1.example.com:4317")).toBe(false);
    expect(isAllowedHost("localhost#example.com")).toBe(false);
    expect(isAllowedHost("0.0.0.0:4317")).toBe(false);
    expect(isAllowedHost(undefined)).toBe(false);
    expect(() => assertDashboardEnvironment("production")).toThrowError(/local-only/u);
  });

  it("serves registry data with strict security and no-store headers", async () => {
    const { port, server } = await startFixtureServer();
    const address = server.address();
    expect(address).toMatchObject({ address: "127.0.0.1" });

    const response = await rawRequest(port, { path: "/api/registry" });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      counts: { work: 0, fixes: 0, specs: 0 },
      sourceRoot: "Docs",
      valid: true,
    });
    expect(response.headers["cache-control"]).toContain("no-store");
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("returns a readable 422 snapshot when semantic validation fails", async () => {
    const { port } = await startFixtureServer({ semanticError: true });

    const response = await rawRequest(port, { path: "/api/registry" });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.body)).toMatchObject({
      counts: { errors: 1 },
      sourceRoot: "Docs",
      valid: false,
      warnings: [expect.objectContaining({ code: "missing_required_spec" })],
    });
  });

  it("rejects foreign hosts and non-read methods", async () => {
    const { port } = await startFixtureServer();
    expect((await rawRequest(port, { host: "dashboard.example.com" })).status).toBe(400);
    const post = await rawRequest(port, { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe("GET, HEAD");
  });

  it("supports HEAD without returning a body", async () => {
    const { port } = await startFixtureServer();
    const response = await rawRequest(port, { method: "HEAD", path: "/styles.css" });
    expect(response.status).toBe(200);
    expect(response.body).toBe("");
  });
});
