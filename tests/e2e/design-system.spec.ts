import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function walkHtml(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(full);
    if (entry.isFile() && full.endsWith(".html")) return [full];
    return [];
  });
}

const systemDir = path.join(process.cwd(), "system");
const htmlPages = walkHtml(systemDir)
  .filter((file) => statSync(file).isFile())
  .map((file) => `/${path.relative(systemDir, file).replaceAll(path.sep, "/")}`)
  .sort();

const axePages = [
  "/design-system.html",
  "/design-system.html?theme=light",
  "/preview/brand-logo.html",
  "/preview/components-buttons.html",
  "/preview/components-form-fields.html",
  "/preview/mobile-shell.html",
  "/preview/tv-foundations.html",
  "/preview/web-shell.html",
];

test.describe("design.put.io static guide", () => {
  for (const pagePath of htmlPages) {
    test(`${pagePath} renders non-empty local content`, async ({ page }) => {
      const response = await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${pagePath} should return HTTP 2xx`).toBe(true);
      await expect(page.locator("body")).toContainText(/\S{3,}/);
    });
  }

  test("generated tokens are available to the browser", async ({ page }) => {
    await page.goto("/design-system.html");
    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--yellow-solid").trim());
    }).toBe("hsl(44.7, 97.9%, 63.1%)");
  });

  for (const pagePath of axePages) {
    test(`${pagePath} has no serious automated accessibility violations`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium-desktop", "Axe coverage runs once; render smoke covers TV framing.");
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const builder = new AxeBuilder({ page });
      if (pagePath.startsWith("/design-system")) {
        builder.exclude("iframe");
      }
      const results = await builder.analyze();
      const seriousViolations = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      expect(seriousViolations).toEqual([]);
    });
  }
});
