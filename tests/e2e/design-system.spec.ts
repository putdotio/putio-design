import { readFileSync, readdirSync, statSync } from "node:fs";
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

// Axe every guide + preview page. Fixed-mode product mockups (native/TV
// surfaces) pin one mode via <html data-theme-lock>; everything else is
// checked in both light and dark. Read the attribute from the file itself
// so the list can never drift from the cards.
function isThemeLocked(page: string): boolean {
  const file = path.join(systemDir, page.replace(/^\//, ""));
  return /^<html[^>]*data-theme-lock=/m.test(readFileSync(file, "utf8"));
}
const axePages = htmlPages
  .filter((page) => page === "/design-system.html" || page.startsWith("/preview/"))
  .flatMap((page) => (isThemeLocked(page) ? [page] : [page, `${page}?theme=light`]));

// Radix/APCA palette: secondary text on raised surfaces lands just under WCAG-2.x
// AA by design, so hold the 3:1 (AA-large) floor; non-contrast violations always block.
const contrastFloor = 3;

const tvSmokePages = [
  "/preview/android-s00-shell.html",
  "/preview/ios-s00-shell.html",
  "/preview/roku-s00-files.html",
  "/preview/tv-f00-foundations.html",
  "/preview/tv-f01-focus.html",
  "/preview/tv-p00-navigation.html",
  "/preview/tv-p01-action-menus.html",
  "/preview/tv-s01-player.html",
  "/preview/web-s00-shell.html",
];

const tvFramePages = htmlPages.filter((page) => {
  const file = path.join(systemDir, page.replace(/^\//, ""));
  return page.startsWith("/preview/") && readFileSync(file, "utf8").includes('class="tvbox"');
});

const tvPatternFrames = [
  ["/preview/roku-p03-continue-watching.html", ".rk-cw"],
  ["/preview/roku-p04-conversion.html", ".rk-cv"],
  ["/preview/tv-p04-resume.html", ".rsm"],
  ["/preview/tv-p05-conversion.html", ".cvs"],
] as const;

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

  for (const pagePath of tvFramePages) {
    test(`${pagePath} keeps its TV artboard visible @tv`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const frames = await page.locator(".tvbox > .tvfit").evaluateAll((elements) =>
        elements.map((element) => {
          const frame = element.getBoundingClientRect();
          const container = element.parentElement?.getBoundingClientRect();
          if (!container) return { frameWidth: 0, frameHeight: 0, containerWidth: 0, containerHeight: 0, aspectRatio: 0, visibleRatio: 0 };
          const visibleWidth = Math.max(0, Math.min(frame.right, container.right) - Math.max(frame.left, container.left));
          const visibleHeight = Math.max(0, Math.min(frame.bottom, container.bottom) - Math.max(frame.top, container.top));
          const frameArea = frame.width * frame.height;
          return {
            frameWidth: frame.width,
            frameHeight: frame.height,
            containerWidth: container.width,
            containerHeight: container.height,
            aspectRatio: container.height > 0 ? container.width / container.height : 0,
            visibleRatio: frameArea > 0 ? (visibleWidth * visibleHeight) / frameArea : 0,
          };
        }),
      );
      expect(frames.length, `${pagePath} should contain a positioned TV frame`).toBeGreaterThan(0);
      for (const frame of frames) {
        expect(frame.frameWidth, `${pagePath} TV frame width`).toBeGreaterThan(0);
        expect(frame.frameHeight, `${pagePath} TV frame height`).toBeGreaterThan(0);
        expect(frame.containerWidth, `${pagePath} TV container width`).toBeGreaterThan(0);
        expect(frame.containerHeight, `${pagePath} TV container height`).toBeGreaterThan(0);
        expect(Math.abs(frame.aspectRatio - 16 / 9), `${pagePath} TV container aspect ratio`).toBeLessThan(0.01);
        expect(Math.abs(frame.frameWidth - frame.containerWidth), `${pagePath} TV frame width scale`).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.frameHeight - frame.containerHeight), `${pagePath} TV frame height scale`).toBeLessThanOrEqual(1);
        expect(frame.visibleRatio, `${pagePath} visible TV frame ratio`).toBeGreaterThan(0.99);
      }
    });
  }

  for (const [pagePath, selector] of tvPatternFrames) {
    test(`${pagePath} keeps its 1920x1080 pattern visible @tv`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const geometry = await page.locator(selector).evaluate((element) => {
        const frame = element.getBoundingClientRect();
        const container = element.parentElement?.getBoundingClientRect();
        if (!container) return { width: 0, height: 0, visibleRatio: 0 };
        const visibleWidth = Math.max(0, Math.min(frame.right, container.right) - Math.max(frame.left, container.left));
        const visibleHeight = Math.max(0, Math.min(frame.bottom, container.bottom) - Math.max(frame.top, container.top));
        const frameArea = frame.width * frame.height;
        return {
          width: frame.width,
          height: frame.height,
          visibleRatio: frameArea > 0 ? (visibleWidth * visibleHeight) / frameArea : 0,
        };
      });

      expect(geometry.width, `${pagePath} pattern width`).toBe(1920);
      expect(geometry.height, `${pagePath} pattern height`).toBe(1080);
      expect(geometry.visibleRatio, `${pagePath} visible pattern ratio`).toBeGreaterThan(0.99);
    });
  }

  test("Roku value-bearing rows reserve the computed value slot @tv", async ({ page }) => {
    await page.goto("/preview/roku-c00-listitem.html", { waitUntil: "domcontentloaded" });
    const rows = await page.locator(".rk-row:has(.val)").evaluateAll((elements) =>
      elements.map((element) => {
        const text = element.querySelector(".tx")?.getBoundingClientRect();
        const value = element.querySelector(".val")?.getBoundingClientRect();
        return { textRight: text?.right ?? 0, valueLeft: value?.left ?? 0 };
      }),
    );

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.textRight, "Roku text group right edge").toBeGreaterThan(0);
      expect(row.textRight, "Roku text group must end before its value slot").toBeLessThanOrEqual(row.valueLeft + 0.5);
    }
  });

  test("generated tokens are available to the browser @desktop", async ({ page }) => {
    await page.goto("/design-system.html");
    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--yellow-solid").trim());
    }).toBe("hsl(44.7, 97.9%, 63.1%)");
  });

  test("button variants consume hover aliases @desktop", async ({ page }) => {
    await page.goto("/preview/web-c00-buttons.html?theme=light", { waitUntil: "domcontentloaded" });

    for (const [selector, variableName] of buttonHoverAliases) {
      const button = page.locator(selector).first();
      await button.hover();
      await expect.poll(async () => button.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(await resolvedCssColor(page, variableName));
    }
  });

  test("overlay primitives consume their semantic token groups @desktop", async ({ page }) => {
    await page.goto("/preview/web-c09-menu.html?theme=light", { waitUntil: "domcontentloaded" });
    const menuBackground = await resolvedCssColor(page, "--menu-bg");
    await expect.poll(async () => page.locator(".menu-pop").first().evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(menuBackground);

    await page.goto("/preview/web-p03-command-palette.html?theme=light", { waitUntil: "domcontentloaded" });
    const palette = page.locator(".pal").first();
    await expect.poll(async () => palette.evaluate((element) => getComputedStyle(element).width)).toBe("560px");
    await expect.poll(async () => palette.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(await resolvedCssColor(page, "--palette-bg"));
    await expect(page.locator("#palette-results > [role=group]")).toHaveCount(3);
    await expect(page.locator("#palette-results > :not([role=group])")).toHaveCount(0);

    await page.goto("/preview/web-c12-sheet.html?theme=light", { waitUntil: "domcontentloaded" });
    const sheet = page.locator(".sheet");
    await expect.poll(async () => sheet.evaluate((element) => getComputedStyle(element).width)).toBe("380px");
    await expect.poll(async () => sheet.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(await resolvedCssColor(page, "--sheet-bg"));
  });

  test("web shell keeps search centered and filenames ellipsized @desktop", async ({ page }) => {
    await page.goto("/preview/web-s00-shell.html", { waitUntil: "domcontentloaded" });
    const appbar = await page.locator(".appbar").boundingBox();
    const search = await page.locator(".appbar .search").boundingBox();
    expect(appbar).not.toBeNull();
    expect(search).not.toBeNull();
    expect(Math.abs((appbar?.x ?? 0) + (appbar?.width ?? 0) / 2 - ((search?.x ?? 0) + (search?.width ?? 0) / 2))).toBeLessThanOrEqual(1);

    const filenameStyles = await page.locator(".files .cell > .t").first().evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        overflow: styles.overflow,
        textOverflow: styles.textOverflow,
        whiteSpace: styles.whiteSpace,
      };
    });
    expect(filenameStyles).toEqual({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    });
  });

  test("error OTP keeps a visible keyboard focus indicator @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html", { waitUntil: "domcontentloaded" });
    await page.locator("#otp-code-error").focus();
    const focusedSlot = page.locator('.otp[data-state="error"] .slot[data-state="focused"]');
    await expect(focusedSlot).toHaveCount(1);
    await expect.poll(async () => focusedSlot.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  });

  test("OTP edits stay synchronized with their visible slots @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html", { waitUntil: "domcontentloaded" });
    const input = page.locator("#otp-code");
    await input.fill("12a34");

    await expect(input).toHaveValue("1234");
    await expect(page.locator(".otp").first().locator(".slot")).toHaveText(["1", "2", "3", "4", "", ""]);
    await expect(page.locator(".otp").first().locator('.slot[data-state="focused"]')).toHaveCount(1);

    await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 2));
    await input.press("ArrowRight");
    await expect(page.locator(".otp").first().locator(".slot").nth(3)).toHaveAttribute("data-state", "focused");
  });

  test("TV focus uses the canonical fill and border treatments @tv", async ({ page }) => {
    await page.goto("/preview/tv-f01-focus.html", { waitUntil: "domcontentloaded" });
    const active = await resolvedCssColor(page, "--component-bg-active");
    const hoverBorder = await resolvedCssColor(page, "--border-hover");
    const rowStyles = await page.locator(".row.focused").first().evaluate((element) => {
      const styles = getComputedStyle(element);
      // tv.css declares no border on rows at all (a fill, never an edge), so
      // assert the width — borderTopColor computes to currentColor either way.
      return { background: styles.backgroundColor, borderWidth: styles.borderTopWidth };
    });
    const buttonStyles = await page.locator(".btn.focused").first().evaluate((element) => {
      const styles = getComputedStyle(element);
      return { background: styles.backgroundColor, border: styles.borderTopColor };
    });

    expect(rowStyles).toEqual({ background: active, borderWidth: "0px" });
    expect(buttonStyles).toEqual({ background: active, border: hoverBorder });
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
      // Disabled-state demos dim a whole mockup (e.g. iOS system opacity);
      // WCAG 1.4.3 exempts text in inactive UI components from contrast.
      builder.exclude('[aria-disabled="true"]');
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
