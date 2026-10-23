import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systemDir = path.join(process.cwd(), "system");
const htmlPages = readdirSync(systemDir, { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".html"))
  .map((file) => `/${file.replaceAll(path.sep, "/")}`)
  .sort();
const readPage = (page: string) => readFileSync(path.join(systemDir, page), "utf8");

// Fixed-mode product mockups (native/TV surfaces) pin one mode via <html
// data-theme-lock>; everything else is checked in both light and dark.
const isThemeLocked = (page: string) => /^<html[^>]*data-theme-lock=/m.test(readPage(page));

// Axe the guide plus one representative per preview family (platform + kind
// prefix, e.g. "web-c", "tv-p"): previews within a family share chrome and
// patterns, and axing all of them tripled the suite's runtime.
const familyOf = (page: string) => page.replace("/preview/", "").match(/^[a-z0-9]+-[a-z]/)?.[0] ?? page;
const firstPreviewByFamily = new Map<string, string>();
for (const page of htmlPages) {
  if (!page.startsWith("/preview/")) continue;
  const family = familyOf(page);
  if (!firstPreviewByFamily.has(family)) firstPreviewByFamily.set(family, page);
}
const axePages = ["/design-system.html", ...firstPreviewByFamily.values()]
  .flatMap((page) => (isThemeLocked(page) ? [page] : [page, `${page}?theme=light`]));

// Radix/APCA palette: secondary text on raised surfaces lands just under WCAG-2.x
// AA by design, so hold the 3:1 (AA-large) floor; non-contrast violations always block.
const contrastFloor = 3;

const tvFramePages = htmlPages.filter((page) => page.startsWith("/preview/") && readPage(page).includes('class="tvbox"'));

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

// Every auth card draws the card-less page recipe from components.css.
const authPreviews = [
  {
    credentialErrorSelector: "#signin-error-err",
    hasFields: true,
    pagePath: "/preview/web-p00c-auth-signin.html",
    requiredActions: [
      { count: 2, name: "Forgot password?", role: "link" },
      { count: 2, name: "Show password", role: "button" },
      { count: 2, name: "Sign in", role: "button" },
      { count: 2, name: "Sign up", role: "link" },
      { count: 1, name: "Open mail", role: "button" },
      { count: 1, name: "Resend link", role: "button" },
      { count: 1, name: "Go back", role: "link" },
    ],
  },
  {
    credentialErrorSelector: null,
    hasFields: true,
    pagePath: "/preview/web-p00d-auth-signup.html",
    requiredActions: [
      { count: 1, name: "Sign up", role: "button" },
      { count: 1, name: "Terms", role: "link" },
      { count: 5, name: "Privacy Policy", role: "link" },
      { count: 1, name: "Sign in", role: "link" },
      { count: 1, name: "Send password reset email", role: "button" },
      { count: 2, name: "Back to sign in", role: "link" },
      { count: 2, name: "Show password", role: "button" },
      { count: 1, name: "Change Password", role: "button" },
      { count: 1, name: "Verifying…", role: "button" },
      { count: 1, name: "Sign out", role: "link" },
    ],
  },
  {
    credentialErrorSelector: null,
    hasFields: false,
    pagePath: "/preview/web-p00e-auth-2fa.html",
    requiredActions: [
      { count: 2, name: "Verify", role: "button" },
      { count: 3, name: "Use a recovery code", role: "link" },
      { count: 3, name: "Sign out", role: "link" },
    ],
  },
  {
    credentialErrorSelector: "#b-err",
    hasFields: true,
    pagePath: "/preview/web-s06-auth.html",
    requiredActions: [
      { count: 2, name: "Forgot password?", role: "link" },
      { count: 2, name: "Show password", role: "button" },
      { count: 2, name: "Sign in", role: "button" },
      { count: 2, name: "Sign up", role: "link" },
    ],
  },
] as const;
const authFooterLinks = ["Terms of Service", "Privacy Policy", "Help"];

const authThemes = ["light", "dark"] as const;
const authThemePreviews = authPreviews.flatMap((preview) => authThemes.map((theme) => ({ preview, theme })));
const passwordTogglePreviewPaths = [
  "/preview/web-p00c-auth-signin.html",
  "/preview/web-p00d-auth-signup.html",
  "/preview/web-s06-auth.html",
] as const;
// The Roku channel ships "use this activation code to log in", and its card documents that.
const authCopyThemePreviews = htmlPages
  .filter(
    (pagePath) =>
      pagePath.startsWith("/preview/")
      && path.posix.basename(pagePath).includes("auth")
      && !path.posix.basename(pagePath).startsWith("roku-"),
  )
  .flatMap<{
  pagePath: string;
  theme: "dark" | "light" | "locked";
}>((pagePath) =>
  isThemeLocked(pagePath) ? [{ pagePath, theme: "locked" }] : authThemes.map((theme) => ({ pagePath, theme })),
);
const credentialErrorCopy = "That username or password doesn't look right.";
const forbiddenAuthCopy = /\b(?:login|log\s+in|register|create\s+(?:an\s+|your\s+)?account)\b/i;
const narrowAuthViewportWidths = [320, 375] as const;
const otpPreviewPaths = ["/preview/web-p00d-auth-signup.html", "/preview/web-p00e-auth-2fa.html"] as const;

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

async function expectAuthFitsViewport(
  page: Page,
  preview: (typeof authPreviews)[number],
  context: string,
): Promise<void> {
  const documentWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(documentWidth.scrollWidth, `${preview.pagePath} document width in ${context}`).toBeLessThanOrEqual(documentWidth.clientWidth);

  const bounds = await page.locator(".auth-column").evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  expect(bounds.length, `${preview.pagePath} should render Auth content in ${context}`).toBeGreaterThan(0);
  for (const bound of bounds) {
    expect(bound.left, `${preview.pagePath} left edge in ${context}`).toBeGreaterThanOrEqual(-0.5);
    expect(bound.right, `${preview.pagePath} right edge in ${context}`).toBeLessThanOrEqual(documentWidth.clientWidth + 0.5);
  }

  const otpBounds = await page.locator(".auth-column .otp").evaluateAll((elements) =>
    elements.map((element) => {
      const parent = element.parentElement;
      if (!parent) throw new Error("OTP control requires a containing form group");
      const box = element.getBoundingClientRect();
      const parentBox = parent.getBoundingClientRect();
      return {
        clientWidth: element.clientWidth,
        left: box.left,
        parentLeft: parentBox.left,
        parentRight: parentBox.right,
        right: box.right,
        scrollWidth: element.scrollWidth,
      };
    }),
  );
  for (const otp of otpBounds) {
    expect(otp.scrollWidth, `${preview.pagePath} OTP content width in ${context}`).toBeLessThanOrEqual(otp.clientWidth);
    expect(otp.left, `${preview.pagePath} OTP left edge in ${context}`).toBeGreaterThanOrEqual(otp.parentLeft - 0.5);
    expect(otp.right, `${preview.pagePath} OTP right edge in ${context}`).toBeLessThanOrEqual(otp.parentRight + 0.5);
  }
}

test.describe("design.put.io static guide", () => {
  for (const { pagePath, theme } of authCopyThemePreviews) {
    test(`${pagePath} uses approved Auth copy in ${theme} mode @desktop`, async ({ page }) => {
      const url = theme === "locked" ? pagePath : `${pagePath}?theme=${theme}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const body = page.locator("body");
      const [visibleCopy, ariaSnapshot, attributeCopy] = await Promise.all([
        body.evaluate((element) => (element instanceof HTMLElement ? element.innerText : "")),
        body.ariaSnapshot(),
        page
          .locator('[aria-label], [aria-description], [title], [placeholder], [alt], input:is([type="button"], [type="submit"], [type="reset"])[value]')
          .evaluateAll((elements) =>
            elements.flatMap((element) => {
              const values = ["aria-label", "aria-description", "title", "placeholder", "alt"]
                .map((attribute) => element.getAttribute(attribute))
                .filter((value): value is string => value !== null);
              if (element instanceof HTMLInputElement && ["button", "submit", "reset"].includes(element.type)) {
                values.push(element.value);
              }
              return values;
            }),
          ),
      ]);
      const authCopy = [visibleCopy, ariaSnapshot, ...attributeCopy].join("\n");
      expect(authCopy, `${pagePath} contains forbidden auth wording in ${theme} mode`).not.toMatch(forbiddenAuthCopy);
    });
  }

  for (const { preview, theme } of authThemePreviews) {
    test(`${preview.pagePath} exposes every authored Auth action in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`${preview.pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });
      for (const action of preview.requiredActions) {
        const matches = page.getByRole(action.role, { name: action.name, exact: true });
        await expect(matches).toHaveCount(action.count);
        for (let index = 0; index < action.count; index += 1) {
          await expect(matches.nth(index)).toBeVisible();
        }
      }
      if (preview.credentialErrorSelector) {
        const error = page.locator(preview.credentialErrorSelector);
        await expect(error).toHaveText(credentialErrorCopy);
        await expect(error).toHaveAttribute("role", "alert");
        await expect(error.locator("xpath=ancestor::*[contains(@class, 'form-reveal')][1]")).toHaveAttribute("data-state", "open");
        const form = page.locator("form").filter({ has: error });
        const invalidFields = form.locator('.field[aria-invalid="true"]');
        await expect(invalidFields).toHaveCount(await form.locator(".field").count());
        for (const describedBy of await invalidFields.evaluateAll((fields) => fields.map((field) => field.getAttribute("aria-describedby")))) {
          expect(describedBy?.split(/\s+/), `${preview.pagePath} invalid field should describe its credential error`).toContain(
            preview.credentialErrorSelector.slice(1),
          );
        }
      }
    });

    test(`${preview.pagePath} follows the Auth geometry contract in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`${preview.pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });

      const pages = await page.locator(".auth-page").evaluateAll(
        (elements, footerLinks) =>
          elements.map((element) => {
            const box = (node: Element | null) => node?.getBoundingClientRect() ?? null;
            const header = element.querySelector(":scope > .auth-header");
            const logos = Array.from(header?.querySelectorAll(".auth-logo") ?? []).filter((logo) => getComputedStyle(logo).display !== "none");
            const main = element.querySelector(":scope > .auth-main");
            const column = main?.querySelector(":scope > .auth-column") ?? null;
            const titles = Array.from(column?.querySelectorAll(".auth-title") ?? []);
            const footer = element.querySelector(":scope > .auth-footer");
            const columnBox = box(column);
            const mainBox = box(main);
            const mainStyles = main ? getComputedStyle(main) : null;
            const mainContentTop = (mainBox?.top ?? 0) + Number.parseFloat(mainStyles?.paddingTop ?? "0");
            const mainContentBottom = (mainBox?.bottom ?? 0) - Number.parseFloat(mainStyles?.paddingBottom ?? "0");
            const title = titles[0];
            const titleStyles = title ? getComputedStyle(title) : null;
            return {
              background: getComputedStyle(element).backgroundColor,
              cardSurfaces: element.querySelectorAll(".card, .panel").length,
              columnCenterDelta: columnBox && mainBox ? Math.abs(columnBox.left + columnBox.width / 2 - (mainBox.left + mainBox.width / 2)) : Number.POSITIVE_INFINITY,
              columnMiddleDelta: columnBox ? Math.abs(columnBox.top + columnBox.height / 2 - (mainContentTop + mainContentBottom) / 2) : Number.POSITIVE_INFINITY,
              columnWidth: columnBox?.width ?? 0,
              footerJustify: footer ? getComputedStyle(footer).justifyContent : "",
              footerLinks: Array.from(footer?.querySelectorAll("a") ?? []).map((link) => link.textContent?.trim()),
              logoCount: logos.length,
              logoHeight: logos[0]?.getBoundingClientRect().height ?? 0,
              logoLeftOfColumn: (box(logos[0] ?? null)?.left ?? Number.POSITIVE_INFINITY) < (columnBox?.left ?? 0),
              logoAboveColumn: (box(logos[0] ?? null)?.bottom ?? Number.POSITIVE_INFINITY) <= (columnBox?.top ?? 0),
              title: titleStyles
                ? { fontSize: titleStyles.fontSize, fontWeight: titleStyles.fontWeight, textAlign: titleStyles.textAlign }
                : null,
              titleCount: titles.length,
              footerLinksExpected: footerLinks,
            };
          }),
        authFooterLinks,
      );
      const background = await resolvedCssColor(page, "--bg");
      expect(pages.length, `${preview.pagePath} should render Auth pages`).toBeGreaterThan(0);
      for (const authPage of pages) {
        expect(authPage.background, `${preview.pagePath} page background`).toBe(background);
        expect(authPage.cardSurfaces, `${preview.pagePath} card-less page`).toBe(0);
        expect(Math.abs(authPage.columnWidth - 340), `${preview.pagePath} column width`).toBeLessThanOrEqual(0.1);
        expect(authPage.columnCenterDelta, `${preview.pagePath} column centred horizontally`).toBeLessThanOrEqual(1);
        expect(authPage.columnMiddleDelta, `${preview.pagePath} column centred vertically`).toBeLessThanOrEqual(1);
        expect(authPage.logoCount, `${preview.pagePath} visible header wordmarks`).toBe(1);
        expect(Math.abs(authPage.logoHeight - 30.33), `${preview.pagePath} wordmark height`).toBeLessThanOrEqual(0.05);
        expect(authPage.logoLeftOfColumn && authPage.logoAboveColumn, `${preview.pagePath} wordmark sits top-left`).toBe(true);
        expect(authPage.titleCount, `${preview.pagePath} one title per screen`).toBe(1);
        expect(authPage.title, `${preview.pagePath} title typography`).toEqual({ fontSize: "22px", fontWeight: "500", textAlign: "start" });
        expect(authPage.footerJustify, `${preview.pagePath} footer alignment`).toBe("center");
        expect(authPage.footerLinks, `${preview.pagePath} footer links`).toEqual(authPage.footerLinksExpected);
      }

      const controls = await page
        .locator(preview.hasFields ? ".auth-column :is(.field, .btn-block)" : ".auth-column .btn-block")
        .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).height));
      expect(controls.length, `${preview.pagePath} should render Auth controls`).toBeGreaterThan(0);
      for (const height of controls) expect(height, `${preview.pagePath} control height`).toBe("44px");

      if (preview.hasFields) {
        const [filledBackground, filledBorder] = await Promise.all([resolvedCssColor(page, "--bg-secondary"), resolvedCssColor(page, "--line")]);
        const fields = await page.locator('.auth-column .field:not([aria-invalid="true"])').evaluateAll((elements) =>
          elements.map((element) => {
            const styles = getComputedStyle(element);
            return { background: styles.backgroundColor, border: styles.borderTopColor };
          }),
        );
        expect(fields.length, `${preview.pagePath} should render resting fields`).toBeGreaterThan(0);
        for (const field of fields) expect(field, `${preview.pagePath} filled field`).toEqual({ background: filledBackground, border: filledBorder });
      }

      await expectAuthFitsViewport(page, preview, `${theme} desktop mode`);
    });

    test(`${preview.pagePath} reveals form errors above the submit button in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`${preview.pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });
      const rows = await page.locator(".auth-column form").evaluateAll((forms) =>
        forms.map((form) => {
          const reveal = form.querySelector(":scope > .form-reveal");
          const message = reveal?.querySelector('[role="alert"]');
          return {
            hasMessage: message instanceof HTMLElement,
            nextIsSubmit: reveal?.nextElementSibling?.classList.contains("btn-primary") ?? false,
            revealCount: form.querySelectorAll(".form-reveal").length,
            transition: reveal ? getComputedStyle(reveal).transitionDuration : "",
          };
        }),
      );
      expect(rows.length, `${preview.pagePath} should render Auth forms`).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row, `${preview.pagePath} form error row`).toEqual({ hasMessage: true, nextIsSubmit: true, revealCount: 1, transition: "0.18s, 0.18s" });
      }
      await expect(page.locator(".auth-column .form-callout:not(.inline)")).toHaveCount(0);
    });
  }

  for (const preview of authPreviews) {
    for (const viewportWidth of narrowAuthViewportWidths) {
      test(`${preview.pagePath} has no horizontal overflow at ${viewportWidth}px in either mode @desktop`, async ({ page }) => {
        await page.setViewportSize({ width: viewportWidth, height: 900 });
        for (const theme of authThemes) {
          await test.step(`${theme} mode`, async () => {
            await page.goto(`${preview.pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });
            await expectAuthFitsViewport(page, preview, `${theme} mode at ${viewportWidth}px`);
          });
        }
      });
    }
  }

  test("Auth fields and feedback use the shared form-group rhythm @desktop", async ({ page }) => {
    const fieldCases = [
      ["/preview/web-p00c-auth-signin.html", "#signin-error-password"],
      ["/preview/web-p00d-auth-signup.html", "#signup-username"],
      ["/preview/web-p00d-auth-signup.html", "#new-password"],
      ["/preview/web-p00e-auth-2fa.html", "#otp-code"],
      ["/preview/web-p00e-auth-2fa.html", "#otp-code-error"],
      ["/preview/web-p00e-auth-2fa.html", "#otp-code-success"],
    ] as const;

    for (const [pagePath, fieldSelector] of fieldCases) {
      await page.goto(`${pagePath}?theme=light`, { waitUntil: "domcontentloaded" });
      const spacing = await page.locator(fieldSelector).evaluate((element) => {
        const parent = element.closest(".form-group");
        if (!parent) throw new Error("Auth field requires a form-group parent");
        const children = Array.from(parent.children).filter((child) => getComputedStyle(child).display !== "none");
        return {
          parentUsesFormGroup: parent.classList.contains("form-group"),
          rowGap: getComputedStyle(parent).rowGap,
          renderedGaps: children.slice(1).map((child, index) => {
            const previousBox = children[index].getBoundingClientRect();
            return child.getBoundingClientRect().top - previousBox.bottom;
          }),
        };
      });
      expect(spacing.parentUsesFormGroup, `${pagePath} ${fieldSelector} parent recipe`).toBe(true);
      expect(spacing.rowGap, `${pagePath} ${fieldSelector} parent gap`).toBe("6px");
      expect(spacing.renderedGaps.length, `${pagePath} ${fieldSelector} grouped relationships`).toBeGreaterThan(0);
      for (const gap of spacing.renderedGaps) {
        expect(Math.abs(gap - 6), `${pagePath} ${fieldSelector} rendered separation`).toBeLessThanOrEqual(0.1);
      }
    }
  });
  test("auth tab order runs fields, submit, then secondary links @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00c-auth-signin.html?theme=dark", { waitUntil: "domcontentloaded" });
    const column = page.locator(".auth-column").first();
    await column.locator("#signin-identity").focus();
    const order: string[] = [];
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => {
        const active = document.activeElement;
        return active?.id || active?.textContent?.trim() || "";
      }));
    }
    expect(order).toEqual(["signin-password", "Sign in", "Forgot password?", "Sign up"]);
  });

  test("field errors ease in under their field without leaving space when closed @desktop", async ({ page }) => {
    await page.goto("/preview/web-c02b-field-validation.html?theme=light", { waitUntil: "domcontentloaded" });
    const group = page.locator("[data-demo-field-error]").first();
    const field = group.locator(".field");
    const message = group.locator('[role="alert"]');
    const gaps = () =>
      group.evaluate((element) => {
        const fieldBox = element.querySelector(".field")?.getBoundingClientRect();
        const messageElement = element.querySelector('[role="alert"]');
        const messageBox = messageElement?.getBoundingClientRect();
        const messagePadding = messageElement ? Number.parseFloat(getComputedStyle(messageElement).paddingTop) : 0;
        // Grid cells stretch the group, so measure the reveal row itself.
        const rowBox = element.querySelector(".form-reveal")?.getBoundingClientRect();
        return {
          fieldToRowBottom: (rowBox?.bottom ?? 0) - (fieldBox?.bottom ?? 0),
          fieldToMessage: (messageBox?.top ?? 0) + messagePadding - (fieldBox?.bottom ?? 0),
          transition: getComputedStyle(element.querySelector(".form-reveal") as Element).transitionDuration,
        };
      });

    await expect(message).toBeVisible();
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const open = await gaps();
    expect(open.transition).toBe("0.18s, 0.18s");
    expect(Math.abs(open.fieldToMessage - 6)).toBeLessThanOrEqual(0.5);

    await page.locator("[data-demo-toggle-errors]").click();
    await expect(group.locator(".form-reveal")).toHaveAttribute("data-state", "closed");
    await expect(message).toBeEmpty();
    expect(await message.getAttribute("role")).toBe("alert");
    await expect(field).not.toHaveAttribute("aria-invalid");
    await expect.poll(async () => Math.abs((await gaps()).fieldToRowBottom)).toBeLessThanOrEqual(0.5);
  });

  test("Apple transfer progress keeps its stock preview style @desktop", async ({ page }) => {
    await page.goto("/preview/ios-s02-transfers.html", { waitUntil: "domcontentloaded" });
    const cases = [
      { selector: ".lprog", helper: "ios-progress-preview", pseudo: "", properties: ["background-color", "background-image", "height", "border-radius"] },
    ];
    for (const control of cases) {
      const comparisons = await page.locator(control.selector).evaluateAll((elements, { helper, pseudo, properties }) =>
        elements.map((element) => {
          const reference = document.createElement("div");
          reference.className = helper;
          reference.style.visibility = "hidden";
          reference.style.position = "absolute";
          reference.style.setProperty("--ios-preview-progress", getComputedStyle(element).getPropertyValue("--ios-preview-progress"));
          document.body.append(reference);
          try {
            const actual = getComputedStyle(element, pseudo);
            const expected = getComputedStyle(reference, pseudo);
            return properties.map((property) => ({ property, actual: actual.getPropertyValue(property), expected: expected.getPropertyValue(property) }));
          } finally {
            reference.remove();
          }
        }), control);
      expect(comparisons.length, control.selector).toBeGreaterThan(0);
      for (const properties of comparisons) {
        for (const { property, actual, expected } of properties) {
          expect(actual, `${control.selector}${control.pseudo} ${property}`).toBe(expected);
        }
      }
    }
  });

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

  test("gallery previews load once on scroll, follow theme and resize @desktop", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException("Storage writes denied", "SecurityError"); };
    });
    await page.goto("/design-system.html", { waitUntil: "domcontentloaded" });
    const cards = page.locator(".embed");
    expect(await cards.count()).toBeGreaterThan(0);
    expect(await page.locator(".embed > template").count()).toBeGreaterThan(0);
    const initialPreviews = await cards.evaluateAll(elements => elements.map(card => {
      const bounds = card.getBoundingClientRect();
      return {
        children: card.querySelectorAll(":scope > template, :scope > iframe").length,
        active: card.querySelector(":scope > iframe") !== null,
        nearViewport: bounds.bottom >= -600 && bounds.top <= innerHeight + 600,
        placeholderHeight: getComputedStyle(card, "::after").height,
        expectedHeight: card.querySelector('a[href="./preview/web-s00-shell.html"], a[href="./preview/web-p06-player.html"]') ? "600px"
          : card.classList.contains("featured") ? "660px"
          : card.classList.contains("tall") ? "520px"
            : card.classList.contains("compact") ? "220px" : "360px",
      };
    }));
    for (const preview of initialPreviews) {
      expect(preview.children).toBe(1);
      if (preview.active) expect(preview.nearViewport).toBe(true);
      else expect(preview.placeholderHeight).toBe(preview.expectedHeight);
    }
    const themeToggle = page.locator("#theme-toggle");
    await expect(themeToggle).toHaveAccessibleName("View light");
    await expect(themeToggle).not.toHaveAttribute("aria-pressed");
    await themeToggle.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(themeToggle).toHaveAccessibleName("View dark");
    const card = page.locator('.embed:has(a.open[href="./preview/web-c00-buttons.html"])');
    await expect(card.locator("iframe")).toHaveCount(0);
    await card.scrollIntoViewIfNeeded();
    const iframe = card.locator("iframe");
    await expect(iframe).toHaveCount(1);
    const preview = iframe.contentFrame();
    await expect(preview.locator(".btn-primary").first()).toBeVisible();
    await expect(preview.locator("html")).not.toHaveClass(/dark/);
    await preview.locator("body").evaluate(async () => { await document.fonts.ready; });
    await page.locator("#theme-toggle").click();
    await expect(preview.locator("html")).toHaveClass(/dark/);
    await card.scrollIntoViewIfNeeded();
    await page.setViewportSize({ width: 1000, height: 900 });
    await expect.poll(() => iframe.evaluate((element) => {
      if (!(element instanceof HTMLIFrameElement) || !element.contentDocument?.body) return Infinity;
      const body = element.contentDocument.body;
      return Math.abs(element.clientHeight - Math.max(120, body.scrollHeight, body.offsetHeight));
    })).toBeLessThan(2);
    await expect(iframe).toHaveCount(1);

    const nativeCard = page.locator('.embed:has(a.open[href="./preview/ios-e10-tabbar.html"])');
    await expect(nativeCard.locator("iframe")).toHaveCount(0);
    await page.locator("#theme-toggle").click();
    await nativeCard.scrollIntoViewIfNeeded();
    await expect(nativeCard.locator("iframe").contentFrame().locator("html")).toHaveClass(/dark/);
  });

  test("form callout states consume their semantic token groups in both modes @desktop", async ({ page }) => {
    for (const theme of authThemes) {
      await test.step(`${theme} mode`, async () => {
        await page.goto(`/preview/web-p00-form-layouts.html?theme=${theme}`, { waitUntil: "load" });
        await expect(page.locator("[data-demo-callout-states] [data-demo-callout]")).toHaveCount(6);

        const states = [
          ["info", "--alert-info-bg", "--alert-info-border", "--alert-info-body"],
          ["success", "--alert-success-bg", "--alert-success-border", "--alert-success-body"],
          ["error", "--alert-danger-bg", "--alert-danger-border", "--alert-danger-body"],
        ] as const;
        for (const [state, backgroundToken, borderToken, bodyToken] of states) {
          const [background, border, color] = await Promise.all([
            resolvedCssColor(page, backgroundToken),
            resolvedCssColor(page, borderToken),
            resolvedCssColor(page, bodyToken),
          ]);
          const blockStyles = await page.locator(`[data-demo-callout="block"][data-state="${state}"]`).evaluate((element) => {
            const styles = getComputedStyle(element);
            return { background: styles.backgroundColor, border: styles.borderTopColor, color: styles.color };
          });
          expect(blockStyles, `${theme} ${state} callout token colors`).toEqual({ background, border, color });

          const inlineStyles = await page.locator(`[data-demo-callout="inline"][data-state="${state}"]`).evaluate((element) => {
            const styles = getComputedStyle(element);
            return {
              background: styles.backgroundColor,
              borderWidth: styles.borderTopWidth,
              color: styles.color,
            };
          });
          expect(inlineStyles, `${theme} ${state} inline callout treatment`).toEqual({
            background: "rgba(0, 0, 0, 0)",
            borderWidth: "0px",
            color,
          });
        }
      });
    }
  });

  for (const theme of authThemes) {
    test(`OTP states consume field and semantic status tokens in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`/preview/web-p00e-auth-2fa.html?theme=${theme}`, { waitUntil: "load" });

      const [
        fieldBackground,
        fieldDisabledBackground,
        fieldBorder,
        fieldFilledBorder,
        fieldFocusBorder,
        fieldText,
        redBorder,
        redFocusBorder,
        redText,
        greenBorder,
        greenText,
        secondaryText,
      ] = await Promise.all(
        // Auth pages re-point --field-bg and --field-border to the filled pair.
        [
          "--bg-secondary",
          "--field-bg-disabled",
          "--line",
          "--field-border-hover",
          "--field-border-focus",
          "--field-text",
          "--red-border",
          "--red-border-hover",
          "--red-text-secondary",
          "--green-border",
          "--green-text-secondary",
          "--text-secondary",
        ].map((token) => resolvedCssColor(page, token)),
      );
      const slotStyles = (selector: string) =>
        page.locator(selector).first().evaluate((element) => {
          const styles = getComputedStyle(element);
          return {
            background: styles.backgroundColor,
            border: styles.borderTopColor,
            boxShadow: styles.boxShadow,
            color: styles.color,
          };
        });

      const defaultOtp = page.locator(".otp:has(#otp-code)");
      await defaultOtp.locator(".otp-input").focus();
      expect(await slotStyles(".otp:has(#otp-code) .otp-slot:nth-child(2)"), `${theme} default OTP slot colors`).toEqual({
        background: fieldBackground,
        border: fieldFilledBorder,
        boxShadow: "none",
        color: fieldText,
      });
      const defaultActiveSelector = '.otp:has(#otp-code) .otp-slot[data-state="active"]';
      await expect.poll(async () => (await slotStyles(defaultActiveSelector)).border).toBe(fieldFocusBorder);
      const defaultActive = await slotStyles(defaultActiveSelector);
      expect(defaultActive.background, `${theme} focused OTP background`).toBe(fieldBackground);
      expect(defaultActive.color, `${theme} focused OTP text`).toBe(fieldText);
      expect(defaultActive.boxShadow, `${theme} focused OTP ring`).not.toBe("none");

      const invalidOtp = page.locator(".otp:has(#otp-code-error)");
      await invalidOtp.locator(".otp-input").focus();
      expect(await slotStyles(".otp:has(#otp-code-error) .otp-slot:nth-child(2)"), `${theme} invalid OTP slot colors`).toEqual({
        background: fieldBackground,
        border: redBorder,
        boxShadow: "none",
        color: redText,
      });
      const invalidActiveSelector = '.otp:has(#otp-code-error) .otp-slot[data-state="active"]';
      await expect.poll(async () => (await slotStyles(invalidActiveSelector)).border).toBe(redFocusBorder);
      const invalidActive = await slotStyles(invalidActiveSelector);
      expect(invalidActive.color, `${theme} focused invalid OTP text`).toBe(redText);
      expect(invalidActive.boxShadow, `${theme} focused invalid OTP ring`).not.toBe("none");

      const successOtp = page.locator(".otp:has(#otp-code-success)");
      await expect(successOtp.locator(".otp-input")).toHaveJSProperty("readOnly", true);
      expect(await slotStyles(".otp:has(#otp-code-success) .otp-slot:nth-child(2)"), `${theme} successful OTP slot colors`).toEqual({
        background: fieldBackground,
        border: greenBorder,
        boxShadow: "none",
        color: greenText,
      });
      await expect(successOtp.locator('.otp-slot[data-state="active"]')).toHaveCount(0);

      await page.goto(`/preview/web-p00d-auth-signup.html?theme=${theme}`, { waitUntil: "load" });
      expect(await slotStyles(".otp:has(#otp-code-verifying) .otp-slot"), `${theme} verifying OTP slot colors`).toEqual({
        background: fieldDisabledBackground,
        border: fieldBorder,
        boxShadow: "none",
        color: secondaryText,
      });
    });
  }

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

    const filenameStyles = await page.locator(".files .nm").first().evaluate((element) => {
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

  for (const pagePath of otpPreviewPaths) {
    test(`${pagePath} uses one semantic OTP input @desktop`, async ({ page }) => {
      await page.goto(`${pagePath}?theme=light`, { waitUntil: "domcontentloaded" });
      const contracts = await page.locator(".otp").evaluateAll((roots) =>
        roots.map((root) => {
          const inputs = root.querySelectorAll<HTMLInputElement>("input.otp-input");
          const input = inputs[0];
          const groups = Array.from(root.querySelectorAll(":scope > .otp-group"));
          const slots = Array.from(root.querySelectorAll(".otp-slot"));
          return {
            allInputCount: root.querySelectorAll("input").length,
            autocomplete: input?.autocomplete ?? "",
            groupSlotCounts: groups.map((group) => group.querySelectorAll(":scope > .otp-slot").length),
            hasAssociatedLabel: (input?.labels?.length ?? 0) > 0,
            inputCount: inputs.length,
            inputMode: input?.inputMode ?? "",
            maxLength: input?.maxLength ?? -1,
            separatorCount: root.querySelectorAll(":scope > .otp-separator").length,
            slotCount: slots.length,
            slotsAreHidden: slots.every((slot) => slot.getAttribute("aria-hidden") === "true"),
          };
        }),
      );

      expect(contracts.length, `${pagePath} should render an OTP specimen`).toBeGreaterThan(0);
      for (const contract of contracts) {
        expect(contract, `${pagePath} OTP semantic contract`).toEqual({
          allInputCount: 1,
          autocomplete: "one-time-code",
          groupSlotCounts: [3, 3],
          hasAssociatedLabel: true,
          inputCount: 1,
          inputMode: "numeric",
          maxLength: 6,
          separatorCount: 1,
          slotCount: 6,
          slotsAreHidden: true,
        });
      }
    });
  }

  test("invalid OTP derives its state from the input @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const errorCard = page.locator('[data-demo-otp-verification="error"]');
    const invalidOtp = errorCard.locator(".otp");
    const input = invalidOtp.locator(".otp-input");
    await expect(invalidOtp).toBeVisible();
    await expect(invalidOtp).not.toHaveAttribute("data-state", "error");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-describedby", /\S+/);
    expect(
      await input.evaluate((element) => {
        const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
        return (
          ids.length > 0 &&
          ids.every((id) => {
            const description = document.getElementById(id);
            if (!description?.textContent?.trim()) return false;
            return getComputedStyle(description).display !== "none";
          })
        );
      }),
      "aria-describedby should resolve to visible error copy",
    ).toBe(true);

    const submit = errorCard.locator("[data-otp-submit]");
    const feedback = errorCard.locator("#otp-error");
    await input.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) throw new Error("OTP control is not an input");
      element.setSelectionRange(element.value.length, element.value.length);
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", "7");
      element.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }));
    });
    await expect(input).toHaveValue("810506");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-describedby", "otp-error");
    await expect(feedback).toBeVisible();

    await input.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) throw new Error("OTP control is not an input");
      element.setRangeText("6", 5, 6, "end");
      element.dispatchEvent(new InputEvent("input", { bubbles: true, data: "6", inputType: "insertText" }));
    });
    await expect(input).toHaveValue("810506");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute("aria-describedby", "otp-error");
    await expect(feedback).toBeVisible();

    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).not.toHaveAttribute("aria-describedby");
    // A closed reveal row keeps its alert rendered but empty.
    await expect(errorCard.locator(".form-reveal")).toHaveAttribute("data-state", "closed");
    await expect(feedback).toBeEmpty();
    await expect(invalidOtp).toHaveAttribute("data-state", "verifying");

    await page.reload({ waitUntil: "domcontentloaded" });
    await input.fill("81050");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).not.toHaveAttribute("aria-describedby");
    await expect(feedback).toBeEmpty();
    await expect(submit).toBeDisabled();

    await input.fill("810507");
    await expect(submit).toBeEnabled();
  });

  test("OTP edits sanitize digits and synchronize slots with the caret @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator(".otp").first();
    const input = otp.locator(".otp-input");
    const slots = otp.locator(".otp-slot");
    await input.fill("12a34");

    await expect(input).toHaveValue("1234");
    await expect(slots).toHaveText(["1", "2", "3", "4", "", ""]);
    await expect(otp.locator('.otp-slot[data-state="active"]')).toHaveCount(1);

    await input.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) throw new Error("OTP control is not an input");
      element.setSelectionRange(2, 2);
    });
    await input.press("a");
    await expect(input).toHaveValue("1234");
    await expect(slots.nth(2)).toHaveAttribute("data-state", "active");
    await input.press("9");
    await expect(input).toHaveValue("12934");
    await expect(slots.nth(3)).toHaveAttribute("data-state", "active");

    await input.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) throw new Error("OTP control is not an input");
      element.setSelectionRange(2, 2);
    });
    await input.press("ArrowRight");
    await expect(slots.nth(3)).toHaveAttribute("data-state", "active");

    await input.fill("1234567");
    await expect(input).toHaveValue("123456");
    await expect(slots).toHaveText(["1", "2", "3", "4", "5", "6"]);
  });

  for (const pagePath of passwordTogglePreviewPaths) {
    test(`${pagePath} password reveal controls toggle both ways @desktop`, async ({ page }) => {
      await page.goto(`${pagePath}?theme=light`, { waitUntil: "domcontentloaded" });
      const toggles = page.locator("[data-password-toggle]");
      const count = await toggles.count();
      expect(count, `${pagePath} should expose a password reveal control`).toBeGreaterThan(0);

      for (let index = 0; index < count; index += 1) {
        const toggle = toggles.nth(index);
        const input = toggle.locator("xpath=..//input");
        const icon = toggle.locator("i");
        await expect(toggle).toHaveAccessibleName("Show password");
        await expect(input).toHaveAttribute("type", "password");
        await expect(toggle).not.toHaveAttribute("aria-pressed");
        await expect(icon).toHaveClass(/(?:^|\s)ph-eye(?:\s|$)/);
        await toggle.click();
        await expect(input).toHaveAttribute("type", "text");
        await expect(toggle).toHaveAttribute("aria-label", "Hide password");
        await expect(toggle).not.toHaveAttribute("aria-pressed");
        await expect(icon).toHaveClass(/(?:^|\s)ph-eye-slash(?:\s|$)/);
        await input.fill("correct-horse-battery-staple-correct-horse-battery-staple");
        const reservedSpace = await input.evaluate((element) => {
          const control = element.parentElement?.querySelector("[data-password-toggle]");
          if (!(control instanceof HTMLElement)) throw new Error("Password toggle is missing");
          return {
            paddingRight: Number.parseFloat(getComputedStyle(element).paddingRight),
            required: control.offsetWidth + Number.parseFloat(getComputedStyle(control).right),
          };
        });
        expect(reservedSpace.paddingRight).toBeGreaterThanOrEqual(reservedSpace.required);
        await toggle.click();
        await expect(input).toHaveAttribute("type", "password");
        await expect(toggle).toHaveAttribute("aria-label", "Show password");
        await expect(toggle).not.toHaveAttribute("aria-pressed");
        await expect(icon).toHaveClass(/(?:^|\s)ph-eye(?:\s|$)/);
      }
    });
  }

  test("OTP paste preserves all six digits from a formatted code @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator(".otp").first();
    const input = otp.locator(".otp-input");
    const submit = page.locator('[data-demo-otp-verification="default"] [data-otp-submit]');

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => navigator.clipboard.writeText("123-456"));
    await input.fill("");
    await input.focus();
    await input.press(process.platform === "darwin" ? "Meta+V" : "Control+V");

    await expect(input).toHaveValue("123456");
    await expect(otp.locator(".otp-slot")).toHaveText(["1", "2", "3", "4", "5", "6"]);
    await expect(submit).toBeEnabled();
  });

  test("OTP pointer interaction moves the backing caret to the clicked slot @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator('[data-demo-otp-verification="default"] .otp');
    const input = otp.locator(".otp-input");
    const slots = otp.locator(".otp-slot");
    await input.fill("123456");

    // The transparent input overlays the slots, so force a click at each slot's center.
    for (const index of [0, 2, 3, 5]) {
      await slots.nth(index).click({ force: true });
      await expect
        .poll(() =>
          input.evaluate((element) =>
            element instanceof HTMLInputElement ? { end: element.selectionEnd, start: element.selectionStart } : null,
          ),
        )
        .toEqual({ end: index + 1, start: index });
      await expect(slots.nth(index)).toHaveAttribute("data-state", "active");
      await expect(otp.locator('.otp-slot[data-state="active"]')).toHaveCount(1);
    }

    await slots.nth(2).click({ force: true });
    await input.press("9");
    await expect(input).toHaveValue("129456");
    await expect(slots).toHaveText(["1", "2", "9", "4", "5", "6"]);
  });

  test("OTP submission enters the locked verifying state @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const card = page.locator('[data-demo-otp-verification="default"]');
    const otp = card.locator(".otp");
    const input = otp.locator(".otp-input");
    const submit = card.locator("[data-otp-submit]");

    await expect(submit).toBeDisabled();
    await input.fill("392471");
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(input).toHaveValue("392471");
    await expect(input).toBeDisabled();
    await expect(otp).toHaveAttribute("data-state", "verifying");
    await expect(otp).toHaveAttribute("aria-busy", "true");
    await expect(otp).toHaveAttribute("aria-disabled", "true");
    await expect(otp.locator(".otp-slot")).toHaveText(["3", "9", "2", "4", "7", "1"]);
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText("Verifying…");
    await expect(submit).toHaveAttribute("aria-live", "polite");
    await expect(submit).toHaveAttribute("aria-atomic", "true");
  });

  test("successful OTP preserves its code and announces continuation @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator('.otp[data-state="success"]');
    await expect(otp).toHaveCount(1);
    const input = otp.locator(".otp-input");
    const code = await input.inputValue();
    expect(code).toMatch(/^\d{6}$/);
    await expect(input).toHaveJSProperty("readOnly", true);
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(otp.locator(".otp-slot")).toHaveText(code.split(""));

    // auth.put.io swaps the submit to a disabled "Verified".
    const card = page.locator(".auth-column").filter({ has: otp });
    const submit = card.locator("button.btn-primary");
    await expect(submit).toHaveText("Verified");
    await expect(submit).toBeDisabled();
    await expect(card.getByRole("status")).toHaveText("Verified");

    await otp.click({ position: { x: 12, y: 12 } });
    await expect(input).not.toBeFocused();
    await expect(otp.locator('.otp-slot[data-state="active"]')).toHaveCount(0);

    await page.locator('label[for="otp-code-success"]').click();
    await expect(input).not.toBeFocused();
    await expect(otp.locator('.otp-slot[data-state="active"]')).toHaveCount(0);
  });

  test("verifying OTP preserves its code and locks submission @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00d-auth-signup.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator('.otp[data-state="verifying"]');
    await expect(otp).toHaveCount(1);
    const input = otp.locator(".otp-input");
    const code = await input.inputValue();
    expect(code).toMatch(/^\d{6}$/);
    await expect(input).toBeDisabled();
    await expect(otp).toHaveAttribute("aria-busy", "true");
    await expect(otp).toHaveAttribute("aria-disabled", "true");
    await expect(otp.locator(".otp-slot")).toHaveText(code.split(""));

    const card = page.locator(".auth-column").filter({ has: otp });
    const submit = card.locator("button.btn-primary");
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute("aria-live", "polite");
    await expect(submit).toHaveAttribute("aria-atomic", "true");
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
      return { background: styles.backgroundColor, border: styles.borderTopColor, borderWidth: styles.borderTopWidth };
    });
    const restingButtonWidth = await page.locator(".btn:not(.focused)").first().evaluate((element) => getComputedStyle(element).borderTopWidth);

    expect(rowStyles).toEqual({ background: active, borderWidth: "0px" });
    // apps/tv draws the edge at --border-width, identical at rest and in focus.
    expect(buttonStyles).toEqual({ background: active, border: hoverBorder, borderWidth: "1px" });
    expect(restingButtonWidth).toBe("1px");
  });

  test("TV search field shares the button focus recipe @tv", async ({ page }) => {
    await page.goto("/preview/tv-s03-search.html", { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: "* { transition: none !important; }" });
    const recipe = (selector: string) =>
      page.locator(selector).first().evaluate((element) => {
        const styles = getComputedStyle(element);
        return { background: styles.backgroundColor, border: styles.borderTopColor, borderWidth: styles.borderTopWidth };
      });
    const resting = { field: await recipe(".sfield"), button: await recipe(".btn") };
    for (const selector of [".sfield", ".btn"]) {
      await page.locator(selector).first().evaluate((element) => element.classList.add("focused"));
    }
    const focused = { field: await recipe(".sfield"), button: await recipe(".btn") };

    expect(resting.field).toEqual(resting.button);
    expect(focused.field).toEqual(focused.button);
    expect(focused.field.borderWidth).toBe("1px");
  });

  for (const pagePath of axePages) {
    test(`${pagePath} has no serious automated accessibility violations @desktop`, async ({ page }) => {
      test.slow();
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const builder = new AxeBuilder({ page });
      if (pagePath.startsWith("/design-system")) {
        await expect.poll(() => page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue("--yellow-solid").trim(),
        )).toBe("hsl(44.7, 97.9%, 63.1%)");
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
