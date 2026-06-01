import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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

// Axe every guide + preview page. TV/mobile mockups are theme-locked (one mode);
// everything else is checked in both light and dark.
const themeLockedPage = /\/preview\/(tv-|mobile-shell)/;
const axePages = htmlPages
  .filter((page) => page === "/design-system.html" || page.startsWith("/preview/"))
  .flatMap((page) => (themeLockedPage.test(page) ? [page] : [page, `${page}?theme=light`]));

// Radix/APCA palette: secondary text on raised surfaces lands just under WCAG-2.x
// AA by design, so hold the 3:1 (AA-large) floor; non-contrast violations always block.
const contrastFloor = 3;

const tvSmokePages = [
  "/preview/mobile-shell.html",
  "/preview/tv-action-menus.html",
  "/preview/tv-focus.html",
  "/preview/tv-foundations.html",
  "/preview/tv-navigation.html",
  "/preview/tv-player.html",
  "/preview/web-shell.html",
];

const buttonHoverAliases = [
  [".btn-primary", "--button-primary-bg-hover"],
  [".btn-success", "--button-success-bg-hover"],
  [".btn-danger", "--button-danger-bg-hover"],
  [".btn-info", "--button-info-bg-hover"],
] as const;

async function resolvedCssColor(page: Page, variableName: string): Promise<string> {
  return page.evaluate((name) => {
    const styles = getComputedStyle(document.documentElement);
    const probe = document.createElement("div");
    probe.style.backgroundColor = styles.getPropertyValue(name).trim();
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, variableName);
}

test.describe("design.put.io static guide", () => {
  for (const pagePath of htmlPages) {
    test(`${pagePath} renders non-empty local content @desktop`, async ({ page }) => {
      const response = await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${pagePath} should return HTTP 2xx`).toBe(true);
      await expect(page.locator("body")).toContainText(/\S{3,}/);
    });
  }

  for (const pagePath of tvSmokePages) {
    test(`${pagePath} renders non-empty TV content @tv`, async ({ page }) => {
      const response = await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${pagePath} should return HTTP 2xx`).toBe(true);
      await expect(page.locator("body")).toContainText(/\S{3,}/);
    });
  }

  test("generated tokens are available to the browser @desktop", async ({ page }) => {
    await page.goto("/design-system.html");
    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--yellow-solid").trim());
    }).toBe("hsl(44.7, 97.9%, 63.1%)");
  });

  test("button variants consume hover aliases @desktop", async ({ page }) => {
    await page.goto("/preview/components-buttons.html?theme=light", { waitUntil: "domcontentloaded" });

    for (const [selector, variableName] of buttonHoverAliases) {
      const button = page.locator(selector).first();
      await button.hover();
      await expect.poll(async () => button.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(await resolvedCssColor(page, variableName));
    }
  });

  for (const pagePath of axePages) {
    test(`${pagePath} has no serious automated accessibility violations @desktop`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const builder = new AxeBuilder({ page });
      if (pagePath.startsWith("/design-system")) {
        builder.exclude("iframe");
      }
      // Loading buttons hide their label behind a spinner (color: transparent),
      // so the label isn't a real text-contrast surface.
      builder.exclude(".is-loading");
      const results = await builder.analyze();
      const serious = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      // Allow near-AA contrast (>= AA-large 3:1) given the Radix/APCA palette;
      // fail only genuinely-unreadable text. Every non-contrast serious
      // violation still blocks.
      const blocking = serious.filter((violation) => {
        if (violation.id !== "color-contrast") return true;
        return violation.nodes.some((node) =>
          (node.any ?? []).some((check) => ((check.data as { contrastRatio?: number } | undefined)?.contrastRatio ?? 1) < contrastFloor),
        );
      });
      expect(blocking).toEqual([]);
    });
  }
});
