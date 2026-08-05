import { watch, type FSWatcher } from "chokidar";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { derive, type DeriveIndex } from "../work-registry/derive.js";

const dashboardDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = path.join(dashboardDirectory, "public");
const DEFAULT_PORT = 4317;
const DEBOUNCE_MS = 300;

const staticAssets = new Map([
  ["/", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/styles.css", { file: "styles.css", contentType: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", contentType: "text/javascript; charset=utf-8" }],
]);

export type DashboardServerOptions = {
  repositoryRoot?: string;
  docsRoot?: string;
  onError?: (error: unknown) => void;
  watch?: boolean;
};

type SseClient = ServerResponse;

export function assertDashboardEnvironment(nodeEnvironment = process.env.NODE_ENV): void {
  if (nodeEnvironment === "production") {
    throw new Error("The work dashboard is local-only and refuses to run in production.");
  }
}

export function isAllowedHost(host: string | undefined): boolean {
  if (!host) return false;
  try {
    const parsed = new URL(`http://${host}`);
    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return false;
    }
    return parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

function setSecurityHeaders(response: ServerResponse): void {
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  );
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function send(
  request: IncomingMessage,
  response: ServerResponse,
  status: number,
  contentType: string,
  body: string | Buffer,
): void {
  response.statusCode = status;
  response.setHeader("Content-Type", contentType);
  response.setHeader("Content-Length", Buffer.byteLength(body));
  if (request.method === "HEAD") response.end();
  else response.end(body);
}

function resolveRepositoryRoot(options: DashboardServerOptions): string {
  return options.repositoryRoot
    ? path.resolve(options.repositoryRoot)
    : path.resolve(dashboardDirectory, "../..");
}

async function findDocPath(
  index: DeriveIndex,
  repositoryRoot: string,
  id: string,
): Promise<string | null> {
  const docsRoot = path.join(repositoryRoot, "Docs");
  const phase = index.phases.find((item) => item.id === id);
  if (phase) return path.join(docsRoot, phase.sourcePath);
  const spec = index.specs.find((item) => item.id === id);
  if (spec) return path.join(docsRoot, spec.sourcePath);
  const research = index.research.find((item) => item.id === id);
  if (research) return path.join(docsRoot, research.sourcePath);
  if (id === "HANDOFF") return path.join(docsRoot, "Handoffs", "HANDOFF.md");
  if (id === "PRODUCT") return path.join(docsRoot, "PRODUCT.md");
  if (id === "DECISIONS") return path.join(docsRoot, "DECISIONS.md");
  return null;
}

export function createDashboardServer(options: DashboardServerOptions = {}): Server {
  assertDashboardEnvironment();
  const repositoryRoot = resolveRepositoryRoot(options);
  const sseClients = new Set<SseClient>();
  let cachedIndex: DeriveIndex | null = null;
  let debounceTimer: NodeJS.Timeout | null = null;
  let watcher: FSWatcher | null = null;
  let rebuilding = false;
  let rebuildQueued = false;

  const broadcast = (index: DeriveIndex): void => {
    const payload = `event: index\ndata: ${JSON.stringify({ indexed_at: index.indexed_at })}\n\n`;
    for (const client of sseClients) {
      client.write(payload);
    }
  };

  const rebuild = async (): Promise<DeriveIndex> => {
    if (rebuilding) {
      rebuildQueued = true;
      while (rebuilding) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      if (!rebuildQueued && cachedIndex) return cachedIndex;
    }
    rebuilding = true;
    rebuildQueued = false;
    try {
      cachedIndex = await derive({
        repositoryRoot,
        docsRoot: options.docsRoot,
        writeIndex: true,
      });
      broadcast(cachedIndex);
      return cachedIndex;
    } finally {
      rebuilding = false;
      if (rebuildQueued) {
        rebuildQueued = false;
        void rebuild().catch((error) => options.onError?.(error));
      }
    }
  };

  const scheduleRebuild = (): void => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void rebuild().catch((error) => options.onError?.(error));
    }, DEBOUNCE_MS);
  };

  if (options.watch !== false) {
    const docsPath = path.join(repositoryRoot, "Docs");
    const activityPath = path.join(repositoryRoot, ".work", "activity");
    watcher = watch([docsPath, activityPath], {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    });
    watcher.on("all", () => scheduleRebuild());
    watcher.on("error", (error) => options.onError?.(error));
  }

  void rebuild().catch((error) => options.onError?.(error));

  const server = createServer((request, response) => {
    void handleRequest(request, response).catch((error) => {
      options.onError?.(error);
      if (!response.headersSent) {
        setSecurityHeaders(response);
        send(
          request,
          response,
          500,
          "application/json; charset=utf-8",
          JSON.stringify({ error: "Unexpected dashboard error." }),
        );
      } else {
        response.destroy();
      }
    });
  });

  async function handleRequest(
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<void> {
    setSecurityHeaders(response);

    if (!isAllowedHost(request.headers.host)) {
      send(
        request,
        response,
        400,
        "application/json; charset=utf-8",
        JSON.stringify({ error: "Invalid Host header." }),
      );
      return;
    }

    let pathname: string;
    let searchParams: URLSearchParams;
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      pathname = url.pathname;
      searchParams = url.searchParams;
    } catch {
      send(
        request,
        response,
        400,
        "application/json; charset=utf-8",
        JSON.stringify({ error: "Invalid URL." }),
      );
      return;
    }

    if (pathname === "/api/events") {
      if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        send(
          request,
          response,
          405,
          "application/json; charset=utf-8",
          JSON.stringify({ error: "Method not allowed." }),
        );
        return;
      }
      response.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      response.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);
      sseClients.add(response);
      request.on("close", () => {
        sseClients.delete(response);
      });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "POST") {
      response.setHeader("Allow", "GET, HEAD, POST");
      send(
        request,
        response,
        405,
        "application/json; charset=utf-8",
        JSON.stringify({ error: "Method not allowed." }),
      );
      return;
    }

    if (pathname === "/api/reindex" && request.method === "POST") {
      const index = await rebuild();
      send(
        request,
        response,
        200,
        "application/json; charset=utf-8",
        JSON.stringify({ indexed_at: index.indexed_at }),
      );
      return;
    }

    if (pathname === "/api/index" || pathname === "/api/registry") {
      try {
        const index = cachedIndex ?? (await rebuild());
        send(request, response, 200, "application/json; charset=utf-8", JSON.stringify(index));
      } catch (error) {
        options.onError?.(error);
        send(
          request,
          response,
          500,
          "application/json; charset=utf-8",
          JSON.stringify({ error: "Index could not be derived." }),
        );
      }
      return;
    }

    if (pathname === "/api/doc") {
      const id = searchParams.get("id");
      if (!id) {
        send(
          request,
          response,
          400,
          "application/json; charset=utf-8",
          JSON.stringify({ error: "Missing id." }),
        );
        return;
      }
      try {
        const index = cachedIndex ?? (await rebuild());
        const docPath = await findDocPath(index, repositoryRoot, id);
        if (!docPath) {
          send(
            request,
            response,
            404,
            "application/json; charset=utf-8",
            JSON.stringify({ error: "Document not found." }),
          );
          return;
        }
        const body = await readFile(docPath, "utf8");
        send(
          request,
          response,
          200,
          "application/json; charset=utf-8",
          JSON.stringify({ id, path: path.relative(repositoryRoot, docPath), body }),
        );
      } catch (error) {
        options.onError?.(error);
        send(
          request,
          response,
          500,
          "application/json; charset=utf-8",
          JSON.stringify({ error: "Document could not be loaded." }),
        );
      }
      return;
    }

    const asset = staticAssets.get(pathname);
    if (!asset) {
      send(request, response, 404, "text/plain; charset=utf-8", "Not found.");
      return;
    }

    try {
      const body = await readFile(path.join(publicDirectory, asset.file));
      send(request, response, 200, asset.contentType, body);
    } catch (error) {
      options.onError?.(error);
      send(request, response, 500, "text/plain; charset=utf-8", "Dashboard asset unavailable.");
    }
  }

  server.on("close", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    void watcher?.close();
    for (const client of sseClients) client.end();
    sseClients.clear();
  });

  return server;
}

export async function listenOnLoopback(server: Server, port = DEFAULT_PORT): Promise<number> {
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("Dashboard port must be an integer from 0 through 65535.");
  }

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string" || address.address !== "127.0.0.1") {
    server.close();
    throw new Error("Dashboard did not bind to the required loopback address.");
  }
  return address.port;
}

type CliOptions = {
  docsRoot?: string;
  port: number;
};

function parseCliOptions(argumentsList: string[]): CliOptions {
  let docsRoot: string | undefined;
  let port = DEFAULT_PORT;
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--docs-root") {
      docsRoot = argumentsList[index + 1];
      if (!docsRoot) throw new Error("--docs-root requires a path.");
      index += 1;
    } else if (argument === "--port") {
      const value = argumentsList[index + 1];
      if (!value) throw new Error("--port requires a number.");
      port = Number(value);
      index += 1;
    } else {
      throw new Error(`Unknown dashboard option: ${argument}`);
    }
  }
  return { docsRoot, port };
}

async function run(): Promise<void> {
  assertDashboardEnvironment();
  const options = parseCliOptions(process.argv.slice(2));
  const server = createDashboardServer({
    docsRoot: options.docsRoot,
    onError: (error) => console.error(error),
    watch: true,
  });
  const port = await listenOnLoopback(server, options.port);
  console.log(`AIdioma work dashboard: http://127.0.0.1:${port}`);

  const close = () => server.close(() => process.exit(0));
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
