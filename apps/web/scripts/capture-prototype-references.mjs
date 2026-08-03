import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const appDirectory = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = path.resolve(appDirectory, "../..");
const prototypeUrl = pathToFileURL(
  path.join(repositoryRoot, "apps/prototype/index.html"),
).href;
const outputDirectory = path.join(
  appDirectory,
  "artifacts/prototype-references",
);

const screens = [
  { id: "home", label: "Home" },
  { id: "lessons", label: "Lessons" },
  { id: "practice", label: "Practice" },
  { id: "settings", label: "Settings" },
];

const viewports = [
  { id: "mobile", width: 390, height: 844 },
  { id: "desktop", width: 1440, height: 900 },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        colorScheme: theme,
        deviceScaleFactor: 1,
        viewport,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        Math.random = () => 0.5;
      });
      await page.goto(prototypeUrl, { waitUntil: "load" });
      await page.evaluate((selectedTheme) => {
        document.documentElement.dataset.theme = selectedTheme;
      }, theme);

      for (const screen of screens) {
        if (screen.id !== "home") {
          await page.getByRole("button", { name: screen.label, exact: true }).click();
        }
        const destination = path.join(
          outputDirectory,
          `${screen.id}-${viewport.id}-${theme}.png`,
        );
        await page.screenshot({ path: destination });
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(`REFERENCE PASS: 16 prototype screenshots saved to ${outputDirectory}.`);
