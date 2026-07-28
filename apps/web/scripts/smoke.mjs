import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const nextBuild = path.join(appDirectory, ".next", "BUILD_ID");
const nextBinary = path.join(appDirectory, "node_modules", "next", "dist", "bin", "next");
const resultsDirectory = path.join(appDirectory, "artifacts");
const screenshotPath = path.join(resultsDirectory, "a1-shell-mobile.png");
const port = Number(process.env.AIDIOMA_SMOKE_PORT ?? "4311");
const baseUrl = `http://127.0.0.1:${port}`;

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

    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (mobileOverflow) throw new Error("Home page overflows horizontally at 390px.");

    await page.screenshot({ path: screenshotPath });

    await page.getByRole("link", { name: "Lessons", exact: true }).click();
    await page.getByRole("heading", { name: "Lessons", exact: true }).waitFor();
    await page.getByText("No lessons loaded yet", { exact: true }).waitFor();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    if (desktopOverflow) throw new Error("Home page overflows horizontally at 1280px.");

    await page.goto(`${baseUrl}/sign-in`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Authentication is ready to connect" })
      .waitFor();

    console.log(`SMOKE PASS: home, lessons, and keyless sign-in at phone/desktop widths.`);
    console.log(`Screenshot: ${screenshotPath}`);
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(`SMOKE FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
