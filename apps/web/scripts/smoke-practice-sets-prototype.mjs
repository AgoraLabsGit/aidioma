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
const buildId = path.join(appDirectory, ".next", "BUILD_ID");
const screenshotsDirectory = path.join(appDirectory, "artifacts/practice-sets-prototype");
const require = createRequire(import.meta.url);
const nextBinary = require.resolve("next/dist/bin/next");
const port = await reservePort(process.env.AIDIOMA_SMOKE_PORT);
const baseUrl = `http://127.0.0.1:${port}`;

const viewports = [
  { id: "phone", width: 390, height: 844 },
  { id: "desktop", width: 1440, height: 900 },
];

async function reservePort(requestedPort) {
  const preferred = requestedPort === undefined ? 0 : Number(requestedPort);
  if (!Number.isInteger(preferred) || preferred < 0 || preferred > 65_535) {
    throw new Error(`Invalid AIDIOMA_SMOKE_PORT: ${requestedPort}.`);
  }

  return new Promise((resolve, reject) => {
    const reservation = createServer();
    reservation.once("error", reject);
    reservation.listen(preferred, "127.0.0.1", () => {
      const address = reservation.address();
      const available = typeof address === "object" && address ? address.port : undefined;
      reservation.close((error) => {
        if (error) reject(error);
        else if (available === undefined) reject(new Error("Could not reserve a smoke-test port."));
        else resolve(available);
      });
    });
  });
}

async function waitForServer(server, serverError, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited early. ${serverError()}`.trim());
    }
    try {
      const response = await fetch(`${baseUrl}/practice`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
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
        .map((violation) => `${violation.id} at ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`)
        .join(", ")}.`,
    );
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const bounds = element.getBoundingClientRect();
        if (bounds.left >= -1 && bounds.right <= viewportWidth + 1) return false;

        let ancestor = element.parentElement;
        while (ancestor && ancestor !== document.body) {
          const ancestorStyle = getComputedStyle(ancestor);
          if (
            ["auto", "scroll"].includes(ancestorStyle.overflowX) &&
            ancestor.scrollWidth > ancestor.clientWidth
          ) {
            return false;
          }
          ancestor = ancestor.parentElement;
        }
        return true;
      })
      .slice(0, 5)
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`);
    return {
      offenders,
      pageOverflows: document.documentElement.scrollWidth > viewportWidth + 1,
    };
  });

  if (result.pageOverflows || result.offenders.length > 0) {
    throw new Error(`${label} overflows horizontally: ${result.offenders.join(", ")}.`);
  }
}

async function assertReducedMotion(page, label) {
  const result = await page.evaluate(() => {
    const control = document.querySelector(".filter-chip, .button");
    return {
      matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionDuration: control ? getComputedStyle(control).transitionDuration : "missing",
    };
  });
  if (!result.matches || !["0s", "0.00001s", "1e-05s"].includes(result.transitionDuration)) {
    throw new Error(`${label} does not honor reduced motion (${JSON.stringify(result)}).`);
  }
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(screenshotsDirectory, `${name}.png`) });
}

async function assertKeyboardCatalogEntry(page) {
  await page.keyboard.press("Tab");
  if ((await page.locator(":focus").getAttribute("class")) !== "skip-link") {
    throw new Error("Skip link is not the first keyboard focus target.");
  }
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  const focusedText = (await focused.innerText()).trim();
  const outline = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  if (!focusedText.includes("Collections")) {
    throw new Error(`Keyboard focus reached ${focusedText || "an unnamed control"} instead of Collections.`);
  }
  if (outline.style === "none" || outline.width === "0px") {
    throw new Error("Collections does not have a visible keyboard focus indicator.");
  }
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: "Collections", exact: true }).waitFor();
}

async function assertOptionsKeyboard(page, label) {
  const focused = page.locator(":focus");
  if ((await focused.getAttribute("aria-label")) !== "Close practice options") {
    throw new Error(`Practice options did not move focus into the dialog in ${label}.`);
  }
  const outline = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  if (outline.style === "none" || outline.width === "0px") {
    throw new Error(`Practice options close control has no visible focus in ${label}.`);
  }

  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Practice options", exact: true }).waitFor({
    state: "detached",
  });
  await page.getByRole("button", { name: "Customize Essential Verbs", exact: true }).press("Enter");
  await page.getByRole("dialog", { name: "Practice options", exact: true }).waitFor();
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
  await access(buildId).catch(() => {
    throw new Error("No production build found. Run `npm run build` before this smoke test.");
  });
  await mkdir(screenshotsDirectory, { recursive: true });

  const server = spawn(
    process.execPath,
    [nextBinary, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: appDirectory,
      env: {
        ...process.env,
        CLERK_SECRET_KEY: "",
        DATABASE_URL: "",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
        PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let serverError = "";
  server.stderr.on("data", (chunk) => {
    serverError += chunk.toString();
  });

  let browser;
  let screenshotCount = 0;
  try {
    await waitForServer(server, () => serverError.trim());
    browser = await chromium.launch({ headless: true });

    for (const viewport of viewports) {
      for (const theme of ["light", "dark"]) {
        const label = `${viewport.id}-${theme}`;
        const context = await browser.newContext({
          colorScheme: theme,
          reducedMotion: "reduce",
          viewport,
        });
        await context.addInitScript((selectedTheme) => {
          localStorage.setItem("aidioma-theme", selectedTheme);
          localStorage.removeItem("aidioma-practice-set-prototype-configurations:v1");
        }, theme);
        const page = await context.newPage();
        await page.goto(`${baseUrl}/practice`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "Practice", exact: true }).waitFor();
        await assertAccessible(page, `entry ${label}`);
        await assertNoHorizontalOverflow(page, `entry ${label}`);

        if (viewport.id === "phone" && theme === "light") {
          await assertKeyboardCatalogEntry(page);
        } else {
          await page.getByRole("button", { name: "Collections", exact: true }).click();
        }
        await screenshot(page, `catalog-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `catalog ${label}`);
        await assertNoHorizontalOverflow(page, `catalog ${label}`);
        await assertReducedMotion(page, `catalog ${label}`);

        await page.getByRole("button", { name: "Start Essential Verbs", exact: true }).click();
        await page.getByLabel("Type a prototype answer", { exact: true }).fill("soy");
        await page.getByRole("button", { name: "Preview feedback", exact: true }).click();
        await page.getByText("Representative feedback state", { exact: true }).waitFor();
        await screenshot(page, `type-session-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `type session ${label}`);
        await assertNoHorizontalOverflow(page, `type session ${label}`);
        await page.getByRole("button", { name: "End preview and return to Collections", exact: true }).click();

        const customizeButton = page.getByRole("button", {
          name: "Customize Essential Verbs",
          exact: true,
        });
        if (viewport.id === "phone" && theme === "light") {
          await customizeButton.press("Enter");
        } else {
          await customizeButton.click();
        }
        await page.getByRole("dialog", { name: "Practice options", exact: true }).waitFor();
        if (viewport.id === "phone" && theme === "light") {
          await assertOptionsKeyboard(page, label);
        }
        await screenshot(page, `customize-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `customize ${label}`);
        await assertNoHorizontalOverflow(page, `customize ${label}`);

        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await assertNoHorizontalOverflow(page, `customize ${label} at 200% text`);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });

        await page.getByRole("button", { name: "5", exact: true }).click();
        const imperative = page.getByRole("button", { name: "Imperative", exact: true });
        if (!(await imperative.isEnabled())) throw new Error(`Imperative did not enable for a 5-item session in ${label}.`);
        await imperative.click();
        if (await page.getByRole("button", { name: "I · yo", exact: true }).isEnabled()) {
          throw new Error(`Invalid first-person imperative is enabled in ${label}.`);
        }
        await page.getByRole("button", { name: "EN → ES", exact: true }).click();
        if (await page.getByRole("button", { name: "Recognize form", exact: true }).isEnabled()) {
          throw new Error(`Recognize form is enabled for EN → ES in ${label}.`);
        }

        await page.getByRole("button", { name: "Flashcards", exact: true }).click();
        await page.getByRole("button", { name: "Start practice", exact: true }).click();
        await page.getByRole("button", { name: "Reveal flashcard answer", exact: true }).waitFor();
        await screenshot(page, `flashcard-session-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `flashcard session ${label}`);
        await assertNoHorizontalOverflow(page, `flashcard session ${label}`);
        await page.getByRole("button", { name: "Reveal flashcard answer", exact: true }).click();
        await page.getByRole("button", { name: "Hide flashcard answer", exact: true }).waitFor();

        await context.close();
      }
    }

    console.log(
      `PRACTICE SETS SMOKE PASS: Practice entry, Collections catalog, direct session, and options; capability rules; axe; keyboard; visible focus; reduced motion; 200% text; no horizontal overflow; ${screenshotCount} screenshots.`,
    );
    console.log(`Screenshots: ${screenshotsDirectory}`);
  } finally {
    await browser?.close();
    await stopServer(server);
  }
}

run().catch((error) => {
  console.error(`PRACTICE SETS SMOKE FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
