import { chromium } from "@playwright/test";
import axeCore from "axe-core";
import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const nextBuild = path.join(appDirectory, ".next", "BUILD_ID");
const require = createRequire(import.meta.url);
const nextBinary = require.resolve("next/dist/bin/next");
const resultsDirectory = path.join(appDirectory, "artifacts");
const screenshotPath = path.join(resultsDirectory, "a1-shell-mobile.png");
const port = await reserveSmokePort(process.env.AIDIOMA_SMOKE_PORT);
const baseUrl = `http://127.0.0.1:${port}`;

async function reserveSmokePort(requestedPort) {
  const preferredPort = requestedPort === undefined ? 0 : Number(requestedPort);
  if (!Number.isInteger(preferredPort) || preferredPort < 0 || preferredPort > 65_535) {
    throw new Error(`Invalid AIDIOMA_SMOKE_PORT: ${requestedPort}.`);
  }

  return new Promise((resolve, reject) => {
    const reservation = createServer();
    reservation.once("error", reject);
    reservation.listen(preferredPort, "127.0.0.1", () => {
      const address = reservation.address();
      const availablePort = typeof address === "object" && address ? address.port : undefined;
      reservation.close((error) => {
        if (error) reject(error);
        else if (availablePort === undefined) reject(new Error("Could not reserve a smoke-test port."));
        else resolve(availablePort);
      });
    });
  });
}

async function requireBuild() {
  try {
    await access(nextBuild);
  } catch {
    throw new Error("No production build found. Run `npm run build` before `npm run smoke`.");
  }
}

async function waitForServer(server, serverError, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited early. ${serverError()}`.trim());
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Server did not become ready at ${baseUrl}.`);
}

async function assertAccessible(page, label) {
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () =>
    window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
    }),
  );
  if (results.violations.length > 0) {
    throw new Error(
      `${label} has accessibility violations: ${results.violations
        .map((item) => `${item.id} (${item.impact ?? "unknown"})`)
        .join(", ")}.`,
    );
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflows) throw new Error(`${label} overflows horizontally.`);
}

async function stopServer(server) {
  if (server.exitCode !== null) return;

  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");
  const stopped = await Promise.race([
    exited.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!stopped && server.exitCode === null) {
    server.kill("SIGKILL");
    await exited;
  }
}

async function run() {
  await requireBuild();
  await mkdir(resultsDirectory, { recursive: true });

  const environment = { ...process.env, PORT: String(port) };
  delete environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  delete environment.CLERK_SECRET_KEY;
  delete environment.DATABASE_URL;

  const server = spawn(
    process.execPath,
    [nextBinary, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: appDirectory,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let serverError = "";
  server.stderr.on("data", (chunk) => {
    serverError += chunk.toString();
  });

  let browser;
  try {
    await waitForServer(server, () => serverError.trim());
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Buenos días." }).waitFor();
    await page.getByText("0 days", { exact: true }).waitFor();

    await assertNoHorizontalOverflow(page, "Home page at 390px");
    await assertAccessible(page, "Light home page");
    await page.screenshot({ path: screenshotPath });

    await page.keyboard.press("Tab");
    const firstFocusedClass = await page.locator(":focus").getAttribute("class");
    if (firstFocusedClass !== "skip-link") {
      throw new Error("Skip link is not the first keyboard focus target.");
    }
    const focusOutline = await page.locator(":focus").evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    if (focusOutline.style === "none" || focusOutline.width === "0px") {
      throw new Error("Keyboard focus indicator is not visible.");
    }

    await page.getByRole("link", { name: "Lessons", exact: true }).click();
    await page.getByRole("heading", { name: "Lessons", exact: true }).waitFor();
    await page.getByText("No lessons loaded yet", { exact: true }).waitFor();
    await assertAccessible(page, "Lessons page");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await assertNoHorizontalOverflow(page, "Home page with 200% text");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await assertAccessible(page, "Dark home page");

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await assertNoHorizontalOverflow(page, "Home page at 1280px");

    await page.goto(`${baseUrl}/sign-in`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Authentication is ready to connect" })
      .waitFor();
    await assertAccessible(page, "Keyless sign-in page");

    console.log(
      "SMOKE PASS: light/dark accessibility, keyboard focus, 200% text, and home/lessons/keyless sign-in at phone/desktop widths.",
    );
    console.log(`Screenshot: ${screenshotPath}`);
  } finally {
    await browser?.close();
    await stopServer(server);
  }
}

run().catch((error) => {
  console.error(`SMOKE FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
