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

async function assertKeyboardCatalogControls(page) {
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
  if (focusedText !== "All") {
    throw new Error(`Keyboard focus reached ${focusedText || "an unnamed control"} instead of the All filter.`);
  }
  if (outline.style === "none" || outline.width === "0px") {
    throw new Error("The All filter does not have a visible keyboard focus indicator.");
  }
  await page.keyboard.press("Tab");
  const saved = page.locator(":focus");
  if ((await saved.innerText()).trim() !== "Saved") {
    throw new Error("Saved is not the second catalog filter in keyboard order.");
  }
}

async function assertOptionsKeyboard(page, label) {
  const focused = page.locator(":focus");
  if ((await focused.getAttribute("aria-label")) !== "Close practice settings") {
    throw new Error(`Practice settings did not move focus into the dialog in ${label}.`);
  }
  const outline = await focused.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  if (outline.style === "none" || outline.width === "0px") {
    throw new Error(`Practice settings close control has no visible focus in ${label}.`);
  }

  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Practice settings", exact: true }).waitFor({
    state: "detached",
  });
  await page.getByRole("button", { name: "Adjust Restaurant Spanish settings", exact: true }).press("Enter");
  await page.getByRole("dialog", { name: "Practice settings", exact: true }).waitFor();
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
        AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION: "true",
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
          localStorage.removeItem("aidioma-intermediate-pilot-configurations:v1");
        }, theme);
        const page = await context.newPage();
        await page.goto(`${baseUrl}/lessons/intermediate/tell-what-happened`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "Tell what happened", exact: true }).waitFor();
        await screenshot(page, `intermediate-lesson-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `intermediate lesson ${label}`);
        await assertNoHorizontalOverflow(page, `intermediate lesson ${label}`);
        const lessonsNavigation = page.getByRole("link", { name: "Lessons", exact: true }).first();
        if ((await lessonsNavigation.getAttribute("aria-current")) !== "page") {
          throw new Error(`Lessons navigation is not current on the lesson preview in ${label}.`);
        }
        await page.getByRole("link", { name: "End lesson and return to Lessons", exact: true }).click();
        await page.getByRole("heading", { name: "Lessons", exact: true }).waitFor();

        await page.goto(`${baseUrl}/practice`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "Practice", exact: true }).waitFor();
        if (await page.getByText(/Working prototype|Prototype lens/i).count()) {
          throw new Error(`Development chrome is visible in the catalog in ${label}.`);
        }
        await assertAccessible(page, `catalog ${label}`);
        await assertNoHorizontalOverflow(page, `catalog ${label}`);

        if (viewport.id === "phone" && theme === "light") {
          await assertKeyboardCatalogControls(page);
        }

        await screenshot(page, `catalog-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `catalog ${label}`);
        await assertNoHorizontalOverflow(page, `catalog ${label}`);
        await assertReducedMotion(page, `catalog ${label}`);
        const collectionRows = await page.locator(".practice-set-card").evaluateAll((cards) =>
          cards.slice(0, 2).map((card) => {
            const bounds = card.getBoundingClientRect();
            return { left: bounds.left, top: bounds.top, width: bounds.width };
          }),
        );
        if (
          collectionRows.length !== 2 ||
          collectionRows[1].top <= collectionRows[0].top ||
          Math.abs(collectionRows[1].left - collectionRows[0].left) > 1 ||
          Math.abs(collectionRows[1].width - collectionRows[0].width) > 1
        ) {
          throw new Error(`Collections are not rendered as consistent rows in ${label}.`);
        }

        await page.getByRole("button", { name: "Save Restaurant Spanish", exact: true }).click();
        await page.getByRole("button", { name: "Saved", exact: true }).click();
        await page.getByRole("button", { name: "Start Restaurant Spanish", exact: true }).waitFor();
        await screenshot(page, `saved-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `saved ${label}`);
        await assertNoHorizontalOverflow(page, `saved ${label}`);
        await page
          .getByRole("button", { name: "Adjust Restaurant Spanish settings", exact: true })
          .click();
        await page.getByRole("checkbox", { name: /Vary the order/ }).uncheck();
        await page.getByRole("button", { name: "Start practice", exact: true }).click();
        await page
          .getByRole("button", { name: "End practice and review this session", exact: true })
          .click();

        await page.getByRole("button", { name: "Start Restaurant Spanish", exact: true }).click();
        if (await page.getByText("Current scope", { exact: true }).count()) {
          throw new Error(`Focused practice still shows the redundant Current scope card in ${label}.`);
        }
        const answerInput = page.getByLabel("Type your answer", { exact: true });
        await answerInput.fill("Ayer pedí sopa, pero me trajeron una ensalada.");
        if ((await answerInput.inputValue()) !== "Ayer pedí sopa, pero me trajeron una ensalada.") {
          throw new Error(`The typed answer is not visible in the composer in ${label}.`);
        }
        await page.getByRole("button", { name: "Send answer", exact: true }).click();
        await page.getByRole("status", { name: "Feedback: Correct", exact: true }).waitFor();
        const submittedAnswer = await page.getByLabel("Your answer", { exact: true }).innerText();
        if (!submittedAnswer.includes("Ayer pedí sopa, pero me trajeron una ensalada.")) {
          throw new Error(`Feedback does not preserve the submitted answer in ${label}.`);
        }
        await screenshot(page, `type-session-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `type session ${label}`);
        await assertNoHorizontalOverflow(page, `type session ${label}`);
        if (await page.getByRole("button", { name: "Next practice", exact: true }).count()) {
          throw new Error(`A Next practice gate is still visible in ${label}.`);
        }
        const servedPromptHeadings = await page
          .locator(".prompt-message h2")
          .evaluateAll((headings) => headings.map((heading) => heading.textContent?.trim()));
        if (
          servedPromptHeadings.length < 2 ||
          servedPromptHeadings.at(-1) === servedPromptHeadings[0]
        ) {
          throw new Error(`Continuous practice did not append a fresh prompt in ${label}.`);
        }
        await page.getByLabel("Type your answer", { exact: true }).waitFor();
        await page
          .getByRole("button", { name: "End practice and review this session", exact: true })
          .click();
        await page.getByRole("heading", { name: "Practice recap", exact: true }).waitFor();
        await page.getByRole("button", { name: "Browse collections", exact: true }).click();

        const customizeButton = page.getByRole("button", {
          name: "Adjust Restaurant Spanish settings",
          exact: true,
        });
        if (viewport.id === "phone" && theme === "light") {
          await customizeButton.press("Enter");
        } else {
          await customizeButton.click();
        }
        await page.getByRole("dialog", { name: "Practice settings", exact: true }).waitFor();
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

        await page.getByRole("button", { name: "EN → ES", exact: true }).click();
        await page.getByRole("button", { name: /Time phrases/, exact: false }).click();
        await page.getByRole("button", { name: "Start practice", exact: true }).click();
        await page.getByRole("heading", { name: "I just finished. The bill, please.", exact: true }).waitFor();
        await screenshot(page, `focused-session-${label}`);
        screenshotCount += 1;
        await assertAccessible(page, `focused session ${label}`);
        await assertNoHorizontalOverflow(page, `focused session ${label}`);

        await context.close();
      }
    }

    console.log(
      `INTERMEDIATE PILOT SMOKE PASS: varied lesson and collection catalogs; finite lesson arc; continuous collection practice; scoped feedback; optional focus; recap; axe; keyboard; visible focus; reduced motion; 200% text; no horizontal overflow; ${screenshotCount} screenshots.`,
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
