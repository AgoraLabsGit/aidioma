import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadRegistry, type LoadRegistryOptions } from "../work-registry/index.js";

const dashboardDirectory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = path.join(dashboardDirectory, "public");
const DEFAULT_PORT = 4317;

const staticAssets = new Map([
  ["/", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/styles.css", { file: "styles.css", contentType: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", contentType: "text/javascript; charset=utf-8" }],
]);

export type DashboardServerOptions = LoadRegistryOptions & {
  onError?: (error: unknown) => void;
};

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

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: DashboardServerOptions,
): Promise<void> {
  setSecurityHeaders(response);

  if (!isAllowedHost(request.headers.host)) {
    send(request, response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Invalid Host header." }));
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    send(
      request,
      response,
      405,
      "application/json; charset=utf-8",
      JSON.stringify({ error: "Method not allowed." }),
    );
    return;
  }

  let pathname: string;
  try {
    pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  } catch {
    send(request, response, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Invalid URL." }));
    return;
  }

  if (pathname === "/api/registry") {
    try {
      const snapshot = await loadRegistry(options);
      send(
        request,
        response,
        snapshot.valid ? 200 : 422,
        "application/json; charset=utf-8",
        JSON.stringify(snapshot),
      );
    } catch (error) {
      options.onError?.(error);
      send(
        request,
        response,
        500,
        "application/json; charset=utf-8",
        JSON.stringify({ error: "Registry data could not be loaded." }),
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

export function createDashboardServer(options: DashboardServerOptions = {}): Server {
  assertDashboardEnvironment();
  return createServer((request, response) => {
    void handleRequest(request, response, options).catch((error) => {
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
