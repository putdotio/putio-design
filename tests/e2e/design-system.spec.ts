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

// Axe the guide plus one representative per preview family (platform + kind
// prefix, e.g. "web-c", "tv-p"): previews within a family share chrome and
// patterns, and axing all of them tripled the suite's runtime. Fixed-mode
// product mockups (native/TV surfaces) pin one mode via <html
// data-theme-lock>; everything else is checked in both light and dark. Read
// the attribute from the file itself so the list can never drift from the cards.
function isThemeLocked(page: string): boolean {
  const file = path.join(systemDir, page.replace(/^\//, ""));
  return /^<html[^>]*data-theme-lock=/m.test(readFileSync(file, "utf8"));
}
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

const authPreviews = [
  {
    cardSelector: ".auth",
    columnSelector: ".auth",
    credentialErrorSelector: "#signin-err",
    fieldSelector: ".auth .field",
    footerSelector: ".auth-foot",
    headingSelector: ".auth .a-hd h3",
    logoSelector: ".auth-logo",
    pagePath: "/preview/web-p00c-auth-signin.html",
    requiredActions: [
      { count: 2, name: "Forgot your password?", role: "link" },
      { count: 1, name: "Show password", role: "button" },
      { count: 2, name: "Sign in", role: "button" },
      { count: 2, name: "Sign up", role: "link" },
      { count: 1, name: "Resend sign-in link", role: "button" },
      { count: 1, name: "Go back", role: "link" },
    ],
  },
  {
    cardSelector: ".auth",
    columnSelector: ".auth",
    credentialErrorSelector: null,
    fieldSelector: ".auth .field",
    footerSelector: ".auth-foot",
    headingSelector: ".auth .a-hd h3",
    logoSelector: ".auth-logo",
    pagePath: "/preview/web-p00d-auth-signup.html",
    requiredActions: [
      { count: 1, name: "Sign up", role: "button" },
      { count: 1, name: "Terms", role: "link" },
      { count: 1, name: "Privacy Policy", role: "link" },
      { count: 1, name: "Sign in", role: "link" },
      { count: 1, name: "Send reset link", role: "button" },
      { count: 1, name: "Back to sign in", role: "link" },
      { count: 1, name: "Show password", role: "button" },
      { count: 1, name: "Save and continue", role: "button" },
      { count: 1, name: "Verifying…", role: "button" },
      { count: 1, name: "Sign out", role: "link" },
    ],
  },
  {
    cardSelector: ".auth",
    columnSelector: ".auth",
    credentialErrorSelector: null,
    fieldSelector: null,
    footerSelector: ".auth-foot",
    headingSelector: ".auth .a-hd h3",
    logoSelector: ".auth-logo",
    pagePath: "/preview/web-p00e-auth-2fa.html",
    requiredActions: [
      { count: 2, name: "Verify", role: "button" },
      { count: 2, name: "Sign out", role: "link" },
    ],
  },
  {
    cardSelector: ".col > .card",
    columnSelector: ".col",
    credentialErrorSelector: ".err",
    fieldSelector: ".col .field",
    footerSelector: ".foot",
    headingSelector: ".card h1",
    logoSelector: ".col > :is(.brand-light, .brand-dark)",
    pagePath: "/preview/web-s06-auth.html",
    requiredActions: [
      { count: 2, name: "Forgot your password?", role: "link" },
      { count: 2, name: "Show password", role: "button" },
      { count: 2, name: "Sign in", role: "button" },
      { count: 2, name: "Sign up", role: "link" },
    ],
  },
] as const;

const authThemes = ["light", "dark"] as const;
const authThemePreviews = authPreviews.flatMap((preview) => authThemes.map((theme) => ({ preview, theme })));
const authCopyThemePreviews = [
  ...authPreviews.map(({ pagePath }) => pagePath),
  "/preview/web-c00-buttons.html",
].flatMap((pagePath) => authThemes.map((theme) => ({ pagePath, theme })));
const credentialErrorCopy = "That username or password doesn't look right";
const forbiddenAuthCopy = /\b(?:login|log\s+in|register|create\s+(?:an\s+|your\s+)?account)\b/i;
const narrowAuthViewportWidths = [320, 375] as const;
const otpPreviewPaths = ["/preview/web-p00d-auth-signup.html", "/preview/web-p00e-auth-2fa.html"] as const;

const exportedAuthRecipeSelectors = [
  ".form-group",
  ".form-callout",
  '.form-callout[data-state="info"]',
  '.form-callout[data-state="success"]',
  '.form-callout[data-state="error"]',
  ".form-callout[hidden]",
  ".form-callout.inline",
  ".otp",
  ".otp-input",
  ".otp-group",
  ".otp-slot",
  '.otp:focus-within .otp-slot[data-state="active"]',
  ".otp-separator",
  '.otp:has(.otp-input[aria-invalid="true"]) .otp-slot',
  '.otp[data-state="verifying"] .otp-slot',
  '.otp[data-state="success"] .otp-slot',
  ".password-strength",
  ".password-strength-meter",
  ".password-strength-segment",
  '.password-strength[data-strength="weak"] .password-strength-segment:nth-child(-n+1)',
  '.password-strength[data-strength="fair"] .password-strength-segment:nth-child(-n+2)',
  '.password-strength[data-strength="good"] .password-strength-segment:nth-child(-n+3)',
  '.password-strength[data-strength="strong"] .password-strength-segment',
  ".password-strength-label",
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

async function componentCssSelectors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const sheet = Array.from(document.styleSheets).find((candidate) => candidate.href?.endsWith("/components.css"));
    if (!sheet) throw new Error("components.css is not loaded");

    const selectors: string[] = [];
    const splitSelectorList = (selectorText: string): string[] => {
      const parts: string[] = [];
      let current = "";
      let depth = 0;
      let quote = "";

      for (let index = 0; index < selectorText.length; index += 1) {
        const character = selectorText[index];
        if (quote) {
          current += character;
          if (character === "\\") {
            current += selectorText[index + 1] ?? "";
            index += 1;
          } else if (character === quote) {
            quote = "";
          }
          continue;
        }
        if (character === '"' || character === "'") {
          quote = character;
          current += character;
          continue;
        }
        if (character === "(" || character === "[") depth += 1;
        if (character === ")" || character === "]") depth -= 1;
        if (character === "," && depth === 0) {
          parts.push(current.trim());
          current = "";
          continue;
        }
        current += character;
      }
      if (current.trim()) parts.push(current.trim());
      return parts;
    };
    const visit = (rules: CSSRuleList): void => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          selectors.push(...splitSelectorList(rule.selectorText));
          continue;
        }
      }
    };

    visit(sheet.cssRules);
    return [...new Set(selectors)];
  });
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

  const selectors = preview.cardSelector === preview.columnSelector ? preview.cardSelector : `${preview.columnSelector}, ${preview.cardSelector}`;
  const bounds = await page.locator(selectors).evaluateAll((elements) =>
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

  const otpBounds = await page.locator(`${preview.cardSelector} .otp`).evaluateAll((elements) =>
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
      await page.goto(`${pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });
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
        await expect(page.locator(preview.credentialErrorSelector)).toHaveText(credentialErrorCopy);
      }
    });

    test(`${preview.pagePath} follows the Auth geometry contract in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`${preview.pagePath}?theme=${theme}`, { waitUntil: "domcontentloaded" });

      for (const [name, selector] of [
        ["column", preview.columnSelector],
        ["card", preview.cardSelector],
      ] as const) {
        const widths = await page.locator(selector).evaluateAll((elements) =>
          elements
            .filter((element) => getComputedStyle(element).display !== "none")
            .map((element) => element.getBoundingClientRect().width),
        );
        expect(widths.length, `${preview.pagePath} should render at least one Auth ${name}`).toBeGreaterThan(0);
        for (const width of widths) {
          expect(Math.abs(width - 340), `${preview.pagePath} ${name} width`).toBeLessThanOrEqual(0.1);
        }
      }

      if (preview.fieldSelector) {
        const fieldHeights = await page.locator(preview.fieldSelector).evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).height),
        );
        expect(fieldHeights.length, `${preview.pagePath} should render Auth fields`).toBeGreaterThan(0);
        for (const height of fieldHeights) expect(height, `${preview.pagePath} field height`).toBe("36px");
      }

      const logoHeights = await page.locator(preview.logoSelector).evaluateAll((elements) =>
        elements
          .filter((element) => getComputedStyle(element).display !== "none")
          .map((element) => element.getBoundingClientRect().height),
      );
      expect(logoHeights.length, `${preview.pagePath} should render a visible wordmark`).toBeGreaterThan(0);
      for (const height of logoHeights) {
        expect(Math.abs(height - 30.33), `${preview.pagePath} visible wordmark height`).toBeLessThanOrEqual(0.05);
      }

      const headings = await page.locator(preview.headingSelector).evaluateAll((elements) =>
        elements.map((element) => {
          const styles = getComputedStyle(element);
          return { fontSize: styles.fontSize, fontWeight: styles.fontWeight, textAlign: styles.textAlign };
        }),
      );
      expect(headings.length, `${preview.pagePath} should render Auth headings`).toBeGreaterThan(0);
      for (const heading of headings) {
        expect(heading, `${preview.pagePath} heading typography`).toEqual({ fontSize: "19px", fontWeight: "500", textAlign: "left" });
      }

      const footers = await page.locator(preview.footerSelector).evaluateAll((elements) =>
        elements.map((element) => {
          const styles = getComputedStyle(element);
          const footer = element.getBoundingClientRect();
          const items = Array.from(element.childNodes).filter((node) => node.textContent?.trim());
          const rect = (node: ChildNode | undefined): DOMRect | null => {
            if (!node) return null;
            const range = document.createRange();
            range.selectNodeContents(node);
            return range.getBoundingClientRect();
          };
          const prompt = rect(items[0]);
          const action = rect(items[1]);
          return {
            actionIsLink: items[1] instanceof HTMLAnchorElement,
            actionTop: action?.top ?? 0,
            actionCenterDelta: action ? Math.abs(action.left + action.width / 2 - (footer.left + footer.width / 2)) : Number.POSITIVE_INFINITY,
            alignItems: styles.alignItems,
            display: styles.display,
            flexDirection: styles.flexDirection,
            itemCount: items.length,
            promptBottom: prompt?.bottom ?? Number.POSITIVE_INFINITY,
            promptCenterDelta: prompt ? Math.abs(prompt.left + prompt.width / 2 - (footer.left + footer.width / 2)) : Number.POSITIVE_INFINITY,
            textAlign: styles.textAlign,
          };
        }),
      );
      expect(footers.length, `${preview.pagePath} should render Auth footers`).toBeGreaterThan(0);
      for (const footer of footers) {
        expect(footer.display, `${preview.pagePath} footer display`).toBe("flex");
        expect(footer.flexDirection, `${preview.pagePath} footer direction`).toBe("column");
        expect(footer.alignItems, `${preview.pagePath} footer alignment`).toBe("center");
        expect(footer.textAlign, `${preview.pagePath} footer text alignment`).toBe("center");
        expect(footer.itemCount, `${preview.pagePath} footer prompt/action items`).toBe(2);
        expect(footer.actionIsLink, `${preview.pagePath} footer action`).toBe(true);
        expect(footer.promptBottom, `${preview.pagePath} footer prompt line`).toBeLessThanOrEqual(footer.actionTop + 0.5);
        expect(footer.promptCenterDelta, `${preview.pagePath} centered footer prompt`).toBeLessThanOrEqual(1);
        expect(footer.actionCenterDelta, `${preview.pagePath} centered footer action`).toBeLessThanOrEqual(1);
      }

      await expectAuthFitsViewport(page, preview, `${theme} desktop mode`);
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

  test("Auth recipes are exported from components.css @desktop", async ({ page }) => {
    await page.goto("/preview/web-c00-buttons.html?theme=light", { waitUntil: "load" });
    const selectors = await componentCssSelectors(page);
    for (const selector of exportedAuthRecipeSelectors) {
      expect(selectors, `components.css should export ${selector}`).toContain(selector);
    }
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
        [
          "--field-bg",
          "--field-bg-disabled",
          "--field-border",
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

  for (const theme of authThemes) {
    test(`password strength states consume their meter tokens in ${theme} mode @desktop`, async ({ page }) => {
      await page.goto(`/preview/web-p00d-auth-signup.html?theme=${theme}`, { waitUntil: "load" });

      const [inactive, weak, fair, strong, label] = await Promise.all(
        ["--component-bg-active", "--red-solid", "--yellow-solid", "--green-solid", "--text-secondary"].map((token) =>
          resolvedCssColor(page, token),
        ),
      );
      const expectedStates = [
        ["empty", "0", "Empty", [inactive, inactive, inactive, inactive]],
        ["weak", "1", "Weak", [weak, inactive, inactive, inactive]],
        ["fair", "2", "Fair", [fair, fair, inactive, inactive]],
        ["good", "3", "Good", [fair, fair, fair, inactive]],
        ["strong", "4", "Strong", [strong, strong, strong, strong]],
      ] as const;

      for (const [state, value, valueText, expectedSegments] of expectedStates) {
        const strength = page.locator(`[data-password-strength-sample="${state}"]`);
        await expect(strength).toHaveAttribute("data-strength", state);
        const colors = await strength.locator(".password-strength-segment").evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).backgroundColor),
        );
        expect(colors, `${theme} ${state} password-strength segments`).toEqual(expectedSegments);
        const meter = strength.locator(".password-strength-meter");
        await expect(meter).toHaveAttribute("aria-valuemin", "0");
        await expect(meter).toHaveAttribute("aria-valuemax", "4");
        await expect(meter).toHaveAttribute("aria-valuenow", value);
        await expect(meter).toHaveAttribute("aria-valuetext", valueText);
        await expect(strength.locator(".password-strength-label")).toHaveCSS("color", label);
        await expect(strength.locator(".password-strength-label b")).toHaveText(valueText);
      }
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

  test("invalid OTP derives its state from the input and keeps visible focus @desktop", async ({ page }) => {
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

    await input.focus();
    const activeSlot = invalidOtp.locator('.otp-slot[data-state="active"]');
    await expect(activeSlot).toHaveCount(1);
    const [focusBorder, textColor] = await Promise.all([
      resolvedCssColor(page, "--red-border-hover"),
      resolvedCssColor(page, "--red-text-secondary"),
    ]);
    await expect.poll(async () => activeSlot.evaluate((element) => getComputedStyle(element).borderTopColor)).toBe(focusBorder);
    const activeStyles = await activeSlot.evaluate((element) => {
      const styles = getComputedStyle(element);
      return { boxShadow: styles.boxShadow, color: styles.color };
    });
    expect(activeStyles.color, "focused invalid OTP text").toBe(textColor);
    expect(activeStyles.boxShadow, "focused invalid OTP ring").not.toBe("none");

    const submit = errorCard.locator("[data-otp-submit]");
    const feedback = errorCard.locator("#otp-error");
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).not.toHaveAttribute("aria-describedby");
    await expect(feedback).toBeHidden();
    await expect(invalidOtp).toHaveAttribute("data-state", "verifying");
    await expect(invalidOtp).toHaveAttribute("aria-busy", "true");
    await expect(input).toBeDisabled();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveText("Verifying…");

    await page.reload({ waitUntil: "domcontentloaded" });
    await input.fill("81050");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).not.toHaveAttribute("aria-describedby");
    await expect(feedback).toBeHidden();
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
    await input.press("ArrowRight");
    await expect(slots.nth(3)).toHaveAttribute("data-state", "active");

    await input.fill("1234567");
    await expect(input).toHaveValue("123456");
    await expect(slots).toHaveText(["1", "2", "3", "4", "5", "6"]);
  });

  test("OTP pointer interaction moves the backing caret to the clicked slot @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00e-auth-2fa.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator('[data-demo-otp-verification="default"] .otp');
    const input = otp.locator(".otp-input");
    const slots = otp.locator(".otp-slot");
    await input.fill("123456");

    for (const index of [0, 2, 3, 5]) {
      const box = await slots.nth(index).boundingBox();
      expect(box, `OTP slot ${index + 1} should have pointer geometry`).not.toBeNull();
      await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2);
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

    const replacementIndex = 2;
    const replacementBox = await slots.nth(replacementIndex).boundingBox();
    expect(replacementBox, "filled OTP slot should have pointer geometry").not.toBeNull();
    await page.mouse.click(
      (replacementBox?.x ?? 0) + (replacementBox?.width ?? 0) / 2,
      (replacementBox?.y ?? 0) + (replacementBox?.height ?? 0) / 2,
    );
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

    const statusId = await input.getAttribute("aria-describedby");
    expect(statusId, "successful OTP should describe automatic continuation").toBeTruthy();
    const status = page.locator(`#${statusId}`);
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toHaveText("Code verified. Continuing…");
    await expect(status).toBeVisible();

    const card = page.locator(".auth").filter({ has: otp });
    await expect(card.locator("button.btn-primary")).toHaveCount(0);
  });

  test("verifying OTP preserves its code and locks submission @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00d-auth-signup.html?theme=light", { waitUntil: "domcontentloaded" });
    const otp = page.locator('.otp[data-state="verifying"]');
    await expect(otp).toHaveCount(1);
    const input = otp.locator(".otp-input");
    const code = await input.inputValue();
    expect(code).toMatch(/^\d{6}$/);
    await expect(input).toBeDisabled();
    await expect(otp.locator(".otp-slot")).toHaveText(code.split(""));

    const card = page.locator(".auth").filter({ has: otp });
    await expect(card.locator("button.btn-primary")).toBeDisabled();
  });

  test("sign-up password feedback uses the exported strength recipe @desktop", async ({ page }) => {
    await page.goto("/preview/web-p00d-auth-signup.html?theme=light", { waitUntil: "domcontentloaded" });
    const contracts = await page.locator("[data-password-strength-initial]").evaluateAll((roots) =>
      roots.map((root) => {
        const meter = root.querySelector('.password-strength-meter[role="meter"]');
        const password = root.closest(".form-group")?.querySelector<HTMLInputElement>('input[type="password"]');
        return {
          inputValue: password?.value,
          labelCount: root.querySelectorAll(".password-strength-label").length,
          maximum: meter?.getAttribute("aria-valuemax"),
          minimum: meter?.getAttribute("aria-valuemin"),
          segmentCount: meter?.querySelectorAll(":scope > .password-strength-segment").length ?? 0,
          state: root.getAttribute("data-strength"),
          value: meter?.getAttribute("aria-valuenow"),
          valueText: meter?.getAttribute("aria-valuetext"),
          visibleValue: root.querySelector(".password-strength-label b")?.textContent?.trim(),
        };
      }),
    );
    expect(contracts.length, "sign-up preview should render password strength").toBeGreaterThan(0);
    for (const contract of contracts) {
      expect(["empty", "weak", "fair", "good", "strong"]).toContain(contract.state);
      expect(contract.minimum).toBe("0");
      expect(contract.maximum).toBe("4");
      expect(Number(contract.value)).toBeGreaterThanOrEqual(0);
      expect(Number(contract.value)).toBeLessThanOrEqual(4);
      expect(contract.segmentCount).toBe(4);
      expect(contract.labelCount).toBe(1);
      expect(contract.inputValue, "password input should match the rendered strength state").toBe("");
      expect([contract.state, contract.value, contract.valueText, contract.visibleValue]).toEqual(["empty", "0", "Empty", "Empty"]);
      expect(contract.valueText?.toLowerCase(), "meter value text should match data-strength").toBe(contract.state);
      expect(contract.visibleValue, "visible strength should match the meter value text").toBe(contract.valueText);
    }
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
      if (pagePath.startsWith("/design-system")) test.slow();
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
