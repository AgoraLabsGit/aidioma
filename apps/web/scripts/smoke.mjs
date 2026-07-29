import { chromium } from "@playwright/test";
import axeCore from "axe-core";
import { spawn } from "node:child_process";
import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const appDirectory = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = path.resolve(appDirectory, "../..");
const nextBuild = path.join(appDirectory, ".next", "BUILD_ID");
const require = createRequire(import.meta.url);
const nextBinary = require.resolve("next/dist/bin/next");
const resultsDirectory = path.join(appDirectory, "artifacts/a1-1r");
const appScreenshotsDirectory = path.join(resultsDirectory, "app");
const prototypeScreenshotsDirectory = path.join(resultsDirectory, "prototype");
const visualContractPath = path.join(resultsDirectory, "visual-contract.json");
const prototypeUrl = pathToFileURL(
  path.join(repositoryRoot, "apps/prototype/index.html"),
).href;
const port = await reserveSmokePort(process.env.AIDIOMA_SMOKE_PORT);
const baseUrl = `http://127.0.0.1:${port}`;

const routes = [
  { id: "home", heading: "Hola.", path: "/", prototypeLabel: "Home" },
  { id: "lessons", heading: "Lessons", path: "/lessons", prototypeLabel: "Lessons" },
  {
    id: "practice",
    heading: "Practice",
    path: "/practice",
    prototypeLabel: "Practice",
  },
  { id: "settings", heading: "Settings", path: "/settings", prototypeLabel: "Settings" },
];

const viewports = [
  { id: "mobile", width: 390, height: 844 },
  { id: "desktop", width: 1440, height: 900 },
];

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

async function newestModificationTime(target) {
  const targetStat = await stat(target);
  if (!targetStat.isDirectory()) return targetStat.mtimeMs;

  const entries = await readdir(target, { withFileTypes: true });
  const times = await Promise.all(
    entries.map((entry) => newestModificationTime(path.join(target, entry.name))),
  );
  return Math.max(targetStat.mtimeMs, ...times);
}

async function requireBuildAndReferences() {
  await access(nextBuild).catch(() => {
    throw new Error("No production build found. Run `npm run build` before `npm run smoke`.");
  });
  const [buildStat, latestSourceTime] = await Promise.all([
    stat(nextBuild),
    Promise.all([
      newestModificationTime(path.join(appDirectory, "src")),
      newestModificationTime(path.join(appDirectory, "next.config.ts")),
      newestModificationTime(path.join(appDirectory, "package.json")),
      newestModificationTime(path.join(repositoryRoot, "package-lock.json")),
    ]).then((times) => Math.max(...times)),
  ]);
  if (latestSourceTime > buildStat.mtimeMs) {
    throw new Error("Production build is stale. Run `npm run build` before `npm run smoke`.");
  }
  await access(path.join(prototypeScreenshotsDirectory, "home-mobile-dark.png")).catch(() => {
    throw new Error(
      "Prototype references are missing. Run `node scripts/capture-prototype-references.mjs` first.",
    );
  });
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
        .map(
          (item) =>
            `${item.id} (${item.impact ?? "unknown"}) at ${item.nodes
              .map((node) => node.target.join(" "))
              .join(" | ")}`,
        )
        .join(", ")}.`,
    );
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const pageOverflows = document.documentElement.scrollWidth > viewportWidth + 1;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const bounds = element.getBoundingClientRect();
        return bounds.left < -1 || bounds.right > viewportWidth + 1;
      })
      .slice(0, 5)
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`);
    return { offenders, pageOverflows };
  });

  if (result.pageOverflows || result.offenders.length > 0) {
    throw new Error(`${label} overflows horizontally: ${result.offenders.join(", ")}.`);
  }
}

async function assertAuthProviderFits(page, label) {
  const result = await page.evaluate(() => {
    const panel = document.querySelector(".auth-panel");
    if (!(panel instanceof HTMLElement)) return null;

    const providerFixture = document.createElement("div");
    providerFixture.style.width = "400px";
    providerFixture.dataset.authProviderFixture = "true";
    panel.append(providerFixture);

    const panelBounds = panel.getBoundingClientRect();
    const fixtureBounds = providerFixture.getBoundingClientRect();
    const columns = getComputedStyle(document.querySelector(".auth-page")).gridTemplateColumns;
    providerFixture.remove();

    return {
      columns,
      fixtureWidth: Math.round(fixtureBounds.width),
      panelWidth: Math.round(panelBounds.width),
      clipped:
        fixtureBounds.left < panelBounds.left - 1 || fixtureBounds.right > panelBounds.right + 1,
    };
  });

  if (!result || result.clipped) {
    throw new Error(`${label} clips a 400px auth provider inside its panel.`);
  }
  return result;
}

async function captureVisualMetrics(page, kind, routeId) {
  return page.evaluate(({ targetKind, targetRoute }) => {
    const root = getComputedStyle(document.documentElement);
    const canvasSelector = targetKind === "app" ? ".app-canvas" : "#app";
    const railSelector =
      targetKind === "app"
        ? window.innerWidth >= 880
          ? ".desktop-sidebar"
          : ".mobile-tab-bar"
        : "#tabbar";
    const cardSelectors = {
      app: {
        home: ".continue-card",
        lessons: ".current-level > summary",
        practice: ".practice-source-button",
        settings: ".settings-card",
      },
      prototype: {
        home: ".continue",
        lessons: ".lvl.current > summary",
        practice: ".learncard",
        settings: "#settings .card",
      },
    };
    const cardSelector = cardSelectors[targetKind][targetRoute];
    const canvas = document.querySelector(canvasSelector)?.getBoundingClientRect();
    const rail = document.querySelector(railSelector)?.getBoundingClientRect();
    const card = document.querySelector(cardSelector)?.getBoundingClientRect();

    const token = (appName, prototypeName) =>
      root.getPropertyValue(targetKind === "app" ? appName : prototypeName).trim();

    return {
      geometry: {
        canvasWidth: Math.round(canvas?.width ?? 0),
        cardWidth: Math.round(card?.width ?? 0),
        railWidth: Math.round(rail?.width ?? 0),
      },
      tokens: {
        accent: token("--accent", "--accent"),
        background: token("--bg", "--bg"),
        border: token("--border", "--line"),
        card: token("--card", "--card"),
        panel: token("--panel", "--panel"),
      },
    };
  }, { targetKind: kind, targetRoute: routeId });
}

function assertVisualContract(appMetrics, prototypeMetrics, label) {
  const normalizeColor = (value) =>
    /^#[0-9a-f]{3}$/i.test(value)
      ? `#${value
          .slice(1)
          .split("")
          .map((character) => `${character}${character}`)
          .join("")}`.toLowerCase()
      : value.toLowerCase();

  for (const [name, value] of Object.entries(prototypeMetrics.tokens)) {
    if (normalizeColor(appMetrics.tokens[name]) !== normalizeColor(value)) {
      throw new Error(
        `${label} token ${name} differs: app ${appMetrics.tokens[name]}, prototype ${value}.`,
      );
    }
  }

  for (const name of ["canvasWidth", "cardWidth", "railWidth"]) {
    if (Math.abs(appMetrics.geometry[name] - prototypeMetrics.geometry[name]) > 1) {
      throw new Error(
        `${label} ${name} differs: app ${appMetrics.geometry[name]}, prototype ${prototypeMetrics.geometry[name]}.`,
      );
    }
  }
}

async function assertKeyboardFocus(page) {
  await page.keyboard.press("Tab");
  const focusedClass = await page.locator(":focus").getAttribute("class");
  if (focusedClass !== "skip-link") {
    throw new Error("Skip link is not the first keyboard focus target.");
  }
  const focusOutline = await page.locator(":focus").evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  if (focusOutline.style === "none" || focusOutline.width === "0px") {
    throw new Error("Keyboard focus indicator is not visible.");
  }

  await page.keyboard.press("Enter");
  if ((await page.locator(":focus").getAttribute("id")) !== "main-content") {
    throw new Error("Skip link did not move focus to main content.");
  }
}

async function assertThemeControl(page) {
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.locator('html[data-theme="dark"]').waitFor();
  await page.getByRole("button", { name: "Auto", exact: true }).click();
  await page.locator('html[data-theme="light"]').waitFor();
  const storedTheme = await page.evaluate(() => localStorage.getItem("aidioma-theme"));
  if (storedTheme !== "system") {
    throw new Error(`Theme control stored ${storedTheme}; expected system for Auto.`);
  }
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
  await requireBuildAndReferences();
  await mkdir(appScreenshotsDirectory, { recursive: true });

  const environment = {
    ...process.env,
    CLERK_SECRET_KEY: "",
    DATABASE_URL: "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
    PORT: String(port),
  };

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
  const visualEvidence = [];
  try {
    await waitForServer(server, () => serverError.trim());
    browser = await chromium.launch({ headless: true });

    for (const viewport of viewports) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          colorScheme: theme,
          deviceScaleFactor: 1,
          reducedMotion: "reduce",
          viewport,
        });
        await context.addInitScript((selectedTheme) => {
          localStorage.setItem("aidioma-theme", selectedTheme);
        }, theme);
        const page = await context.newPage();

        for (const route of routes) {
          await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
          await page.getByRole("heading", { name: route.heading, exact: true }).waitFor();
          await page.locator(`html[data-theme="${theme}"]`).waitFor();
          if (route.id === "settings") {
            const selectedThemeButton = page.locator(
              '.segmented-control button[aria-pressed="true"]',
            ).filter({ hasText: theme === "dark" ? "Dark" : "Light" });
            await selectedThemeButton.waitFor();
            const selectedThemeLabel = (await selectedThemeButton.innerText()).toLowerCase();
            if (selectedThemeLabel !== theme) {
              throw new Error(
                `Settings shows ${selectedThemeLabel} selected while ${theme} is active.`,
              );
            }
          }
          await assertAccessible(page, `${route.id} ${viewport.id} ${theme}`);
          await assertNoHorizontalOverflow(page, `${route.id} ${viewport.id} ${theme}`);

          const currentVisibleLink = page.locator('.nav-link:visible[aria-current="page"]');
          if ((await currentVisibleLink.count()) !== 1) {
            throw new Error(`${route.id} does not expose exactly one visible current-page link.`);
          }

          await page.screenshot({
            path: path.join(
              appScreenshotsDirectory,
              `${route.id}-${viewport.id}-${theme}.png`,
            ),
          });
        }

        await page.goto(baseUrl, { waitUntil: "networkidle" });
        await assertKeyboardFocus(page);

        for (const route of routes) {
          await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
          await page.evaluate(() => {
            document.documentElement.style.fontSize = "200%";
          });
          await assertNoHorizontalOverflow(page, `${route.id} ${viewport.id} ${theme} at 200% text`);
        }

        if (viewport.id === "mobile" && theme === "light") {
          await page.goto(`${baseUrl}/settings`, { waitUntil: "networkidle" });
          await assertThemeControl(page);
        }

        const referencePage = await context.newPage();
        await referencePage.goto(prototypeUrl, { waitUntil: "load" });
        await referencePage.evaluate((selectedTheme) => {
          document.documentElement.dataset.theme = selectedTheme;
        }, theme);
        const appPage = await context.newPage();

        for (const route of routes) {
          if (route.id !== "home") {
            await referencePage
              .getByRole("button", { name: route.prototypeLabel, exact: true })
              .click();
          }
          await appPage.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
          const [prototypeMetrics, appMetrics] = await Promise.all([
            captureVisualMetrics(referencePage, "prototype", route.id),
            captureVisualMetrics(appPage, "app", route.id),
          ]);
          const visualLabel = `${route.id}-${viewport.id}-${theme}`;
          assertVisualContract(appMetrics, prototypeMetrics, visualLabel);
          visualEvidence.push({
            app: appMetrics,
            prototype: prototypeMetrics,
            route: route.id,
            viewport: `${viewport.id}-${theme}`,
          });
        }

        await referencePage.close();
        await appPage.close();
        await context.close();
      }
    }

    for (const viewport of [
      { id: "phone", width: 390, height: 844 },
      { id: "narrow-desktop", width: 900, height: 900 },
      { id: "desktop", width: 1200, height: 900 },
    ]) {
      const authPage = await browser.newPage({ viewport });
      await authPage.goto(`${baseUrl}/sign-in`, { waitUntil: "networkidle" });
      await authPage
        .getByRole("heading", { name: "Authentication is ready to connect" })
        .waitFor();
      await assertAccessible(authPage, `Keyless sign-in page (${viewport.id})`);
      await assertNoHorizontalOverflow(authPage, `Sign-in page (${viewport.id})`);
      const authLayout =
        viewport.width >= 680
          ? await assertAuthProviderFits(authPage, `Sign-in page (${viewport.id})`)
          : null;
      const usesTwoColumns = authLayout?.columns.split(" ").length === 2;
      if (viewport.width < 1000 && usesTwoColumns) {
        throw new Error(`Sign-in page (${viewport.id}) enters two columns too early.`);
      }
      if (viewport.width >= 1000 && !usesTwoColumns) {
        throw new Error(`Sign-in page (${viewport.id}) does not use two columns.`);
      }
      await authPage.close();
    }

    await writeFile(visualContractPath, `${JSON.stringify(visualEvidence, null, 2)}\n`);
    console.log(
      "SMOKE PASS: 16 screen states; prototype token/geometry parity; route-aware navigation; theme control; axe; keyboard focus; reduced motion; 200% text; no horizontal overflow; responsive auth.",
    );
    console.log(`Screenshots: ${appScreenshotsDirectory}`);
    console.log(`Visual contract: ${visualContractPath}`);
  } finally {
    await browser?.close();
    await stopServer(server);
  }
}

run().catch((error) => {
  console.error(`SMOKE FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
