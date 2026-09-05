import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parse } from "yaml";

type TokenRecord = {
  cssName: string;
  type: string;
  mode: string;
  value: string | number;
  originalValue: string | number;
  description?: string;
  basis?: "viewport-width" | "viewport-height";
  deprecated?: boolean;
};

type DesignColors = {
  brand?: string;
  dark?: Record<string, string>;
  light?: Record<string, string>;
};

type TokenMode = "light" | "dark" | "global" | "tv";
type TokenAliasContract = { name: string; source: string; cssName: string; mode: TokenMode };
type TokenValueContract = { name: string; cssName: string; value: string; mode: TokenMode };

const root = process.cwd();
const brandYellowCss = "hsl(44.7, 97.9%, 63.1%)";
const tokenAliasContracts: TokenAliasContract[] = [
  { name: "component.button.primary.background", source: "color.brand.yellow", cssName: "--button-primary-bg", mode: "global" },
  { name: "component.button.success.background", source: "color.green.light.solid", cssName: "--button-success-bg", mode: "light" },
  { name: "component.button.success.backgroundDark", source: "color.green.dark.solid", cssName: "--button-success-bg", mode: "dark" },
  { name: "component.button.danger.background", source: "color.red.light.solid", cssName: "--button-danger-bg", mode: "light" },
  { name: "component.button.danger.backgroundDark", source: "color.red.dark.solid", cssName: "--button-danger-bg", mode: "dark" },
  { name: "component.button.primary.backgroundHover", source: "color.yellow.light.solidHover", cssName: "--button-primary-bg-hover", mode: "light" },
  { name: "component.button.primary.backgroundHoverDark", source: "color.yellow.dark.solidHover", cssName: "--button-primary-bg-hover", mode: "dark" },
  { name: "component.button.success.backgroundHover", source: "color.green.light.solidHover", cssName: "--button-success-bg-hover", mode: "light" },
  { name: "component.button.success.backgroundHoverDark", source: "color.green.dark.solidHover", cssName: "--button-success-bg-hover", mode: "dark" },
  { name: "component.button.danger.backgroundHover", source: "color.red.light.solidHover", cssName: "--button-danger-bg-hover", mode: "light" },
  { name: "component.button.danger.backgroundHoverDark", source: "color.red.dark.solidHover", cssName: "--button-danger-bg-hover", mode: "dark" },
  { name: "component.button.info.backgroundHover", source: "color.neutral.light.solidHover", cssName: "--button-info-bg-hover", mode: "light" },
  { name: "component.button.info.backgroundHoverDark", source: "color.neutral.dark.solidHover", cssName: "--button-info-bg-hover", mode: "dark" },
  { name: "component.button.primary.foreground", source: "component.alias.primaryForeground", cssName: "--button-primary-fg", mode: "global" },
  { name: "component.button.success.foreground", source: "component.alias.successForeground", cssName: "--button-success-fg", mode: "global" },
  { name: "component.button.danger.foreground", source: "component.alias.destructiveForeground", cssName: "--button-danger-fg", mode: "global" },
  { name: "component.alias.primary", source: "color.brand.yellow", cssName: "--primary", mode: "global" },
  { name: "component.alias.success", source: "color.green.light.solid", cssName: "--success", mode: "light" },
  { name: "component.alias.successDark", source: "color.green.dark.solid", cssName: "--success", mode: "dark" },
  { name: "component.alias.destructive", source: "color.red.light.solid", cssName: "--destructive", mode: "light" },
  { name: "component.alias.destructiveDark", source: "color.red.dark.solid", cssName: "--destructive", mode: "dark" },
  { name: "component.alias.invertForeground", source: "surface.light.appBg", cssName: "--invert-foreground", mode: "light" },
  { name: "component.alias.invertForegroundDark", source: "surface.dark.appBg", cssName: "--invert-foreground", mode: "dark" },
  { name: "component.field.radius", source: "radius.default", cssName: "--field-radius", mode: "global" },
  { name: "component.input.background", source: "component.field.background", cssName: "--input-bg", mode: "light" },
  { name: "component.input.backgroundDark", source: "component.field.backgroundDark", cssName: "--input-bg", mode: "dark" },
  { name: "component.input.border", source: "component.field.border", cssName: "--input-border", mode: "light" },
  { name: "component.input.borderDark", source: "component.field.borderDark", cssName: "--input-border", mode: "dark" },
  { name: "component.input.borderHover", source: "component.field.borderHover", cssName: "--input-border-hover", mode: "light" },
  { name: "component.input.borderHoverDark", source: "component.field.borderHoverDark", cssName: "--input-border-hover", mode: "dark" },
  { name: "component.input.borderFocus", source: "component.field.borderFocus", cssName: "--input-border-focus", mode: "light" },
  { name: "component.input.borderFocusDark", source: "component.field.borderFocusDark", cssName: "--input-border-focus", mode: "dark" },
  { name: "component.input.ring", source: "component.field.ring", cssName: "--input-ring", mode: "light" },
  { name: "component.input.ringDark", source: "component.field.ringDark", cssName: "--input-ring", mode: "dark" },
  { name: "component.input.text", source: "component.field.text", cssName: "--input-text", mode: "light" },
  { name: "component.input.textDark", source: "component.field.textDark", cssName: "--input-text", mode: "dark" },
  { name: "component.input.placeholder", source: "component.field.placeholder", cssName: "--input-placeholder", mode: "light" },
  { name: "component.input.placeholderDark", source: "component.field.placeholderDark", cssName: "--input-placeholder", mode: "dark" },
  { name: "component.input.radius", source: "component.field.radius", cssName: "--input-radius", mode: "global" },
  { name: "context.tv.text.tertiary", source: "context.tv.text.secondary", cssName: "--text-3", mode: "tv" },
];
const tokenValueContracts: TokenValueContract[] = [
  { name: "component.alias.primaryForeground", cssName: "--primary-foreground", value: "hsl(38, 65%, 10%)", mode: "global" },
  { name: "component.alias.successForeground", cssName: "--success-foreground", value: "hsl(0, 0%, 100%)", mode: "global" },
  { name: "component.alias.destructiveForeground", cssName: "--destructive-foreground", value: "hsl(0, 0%, 100%)", mode: "global" },
];

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (entry.isFile()) return [full];
      return [];
    }),
  );
  return files.flat();
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function assertExists(file: string) {
  await access(path.join(root, file));
}

function assertTokenAlias(flat: Record<string, TokenRecord>, contract: TokenAliasContract) {
  const token = flat[contract.name];
  const source = flat[contract.source];
  assert(token, `Missing ${contract.name} token`);
  assert(source, `Missing ${contract.source} source token`);
  assert(token.cssName === contract.cssName, `${contract.name} must export ${contract.cssName}`);
  assert(token.mode === contract.mode, `${contract.name} must be ${contract.mode} mode`);
  assert(token.originalValue === `{${contract.source}}`, `${contract.name} must alias {${contract.source}}`);
  assert(token.value === source.value, `${contract.name} must resolve to ${contract.source}`);
}

function extractFrontmatter(markdown: string): string {
  assert(markdown.startsWith("---\n"), "DESIGN.md must start with YAML frontmatter");
  const end = markdown.indexOf("\n---\n", 4);
  assert(end > 0, "DESIGN.md frontmatter must close with ---");
  return markdown.slice(4, end);
}

function cssRule(css: string, selector: string): string {
  const declarations = new Map<string, string>();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selectors, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(",").some((value) => value.trim() === selector)) continue;
    for (const declaration of body.split(";")) {
      const separator = declaration.indexOf(":");
      if (separator < 0) continue;
      declarations.set(declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim());
    }
  }
  assert(declarations.size > 0, `Missing ${selector} CSS rule`);
  return [...declarations].map(([property, value]) => `${property}: ${value};`).join("\n");
}

function assertIncludes(source: string, value: string, label: string) {
  assert(source.includes(value), `${label} must include ${value}`);
}

function assertExcludes(source: string, value: string, label: string) {
  assert(!source.includes(value), `${label} must not include ${value}`);
}

function isSemVer(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.test(
    value,
  );
}

function isIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

function htmlElementsMatchingOpeningTag(source: string, matchesOpeningTag: (openingTag: string) => boolean): string[] {
  const renderedSource = source.replace(/<!--[\s\S]*?-->/g, "");
  const elements: string[] = [];
  const openingTags = /<([a-z][\w:-]*)\b[^>]*>/gi;
  for (const opening of renderedSource.matchAll(openingTags)) {
    const openingTag = opening[0];
    if (!matchesOpeningTag(openingTag) || /\/\s*>$/.test(openingTag)) continue;

    const tagName = opening[1];
    const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matchingTags = new RegExp(`<\\/?${escapedTag}\\b[^>]*>`, "gi");
    matchingTags.lastIndex = (opening.index ?? 0) + openingTag.length;
    let depth = 1;
    let closingIndex: number | undefined;
    let match: RegExpExecArray | null;
    while ((match = matchingTags.exec(renderedSource)) !== null) {
      if (match[0].startsWith("</")) {
        depth -= 1;
      } else if (!/\/\s*>$/.test(match[0])) {
        depth += 1;
      }
      if (depth === 0) {
        closingIndex = matchingTags.lastIndex;
        break;
      }
    }

    assert(closingIndex !== undefined, `Missing closing tag for ${openingTag}`);
    elements.push(renderedSource.slice(opening.index, closingIndex));
  }
  return elements;
}

function htmlOpeningClasses(source: string): string[] {
  const openingTag = source.slice(0, source.indexOf(">") + 1);
  return /\sclass\s*=\s*(["'])(.*?)\1/i.exec(openingTag)?.[2].split(/\s+/) ?? [];
}

function htmlElementsWithClass(source: string, className: string, ...additionalClasses: string[]): string[] {
  return htmlElementsMatchingOpeningTag(source, (openingTag) => {
    const classes = htmlOpeningClasses(openingTag);
    return [className, ...additionalClasses].every((value) => classes.includes(value));
  });
}

function htmlElementsWithAttribute(source: string, attributeName: string): string[] {
  const escapedAttribute = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attribute = new RegExp(`\\s${escapedAttribute}(?:\\s*=|\\s|/?>)`, "i");
  return htmlElementsMatchingOpeningTag(source, (openingTag) => attribute.test(openingTag));
}

async function checkTokens() {
  const flat = JSON.parse(await readFile(path.join(root, "dist/tokens.flat.json"), "utf8")) as Record<string, TokenRecord>;
  const yellow = flat["color.brand.yellow"];
  assert(yellow, "Missing color.brand.yellow token");
  assert(yellow.value === brandYellowCss, "color.brand.yellow must stay hsl(44.7, 97.9%, 63.1%), the CSS form of #FDCE45");
  for (const contract of tokenAliasContracts) {
    assertTokenAlias(flat, contract);
  }
  for (const contract of tokenValueContracts) {
    const token = flat[contract.name];
    assert(token, `Missing ${contract.name} token`);
    assert(token.cssName === contract.cssName, `${contract.name} must export ${contract.cssName}`);
    assert(token.mode === contract.mode, `${contract.name} must be ${contract.mode} mode`);
    assert(token.value === contract.value, `${contract.name} must resolve to ${contract.value}`);
  }
  assert(
    flat["component.button.success.backgroundHover"]?.value !== flat["component.alias.success"]?.value,
    "button success light hover must differ from the resting success background",
  );
  assert(
    flat["component.button.success.backgroundHoverDark"]?.value !== flat["component.alias.successDark"]?.value,
    "button success dark hover must differ from the resting success background",
  );
  assert(
    flat["component.button.danger.backgroundHover"]?.value !== flat["component.alias.destructive"]?.value,
    "button danger light hover must differ from the resting destructive background",
  );
  assert(
    flat["component.button.danger.backgroundHoverDark"]?.value !== flat["component.alias.destructiveDark"]?.value,
    "button danger dark hover must differ from the resting destructive background",
  );
  assert(flat["context.tv.text.tertiary"]?.deprecated === true, "context.tv.text.tertiary must remain marked deprecated");
  assert(flat["tv.overscan.x"]?.type === "number", "tv.overscan.x must be a portable number ratio");
  assert(flat["tv.overscan.x"]?.value === 0.04, "tv.overscan.x must equal 0.04");
  assert(flat["tv.overscan.x"]?.basis === "viewport-width", "tv.overscan.x must declare viewport-width basis");
  assert(flat["tv.overscan.y"]?.type === "number", "tv.overscan.y must be a portable number ratio");
  assert(flat["tv.overscan.y"]?.value === 0.02, "tv.overscan.y must equal 0.02");
  assert(flat["tv.overscan.y"]?.basis === "viewport-height", "tv.overscan.y must declare viewport-height basis");

  for (const [name, token] of Object.entries(flat)) {
    assert(token.cssName.startsWith("--"), `${name} cssName must be a CSS custom property`);
    assert(token.type.length > 0 && token.type !== "unknown", `${name} must include a supported type`);
    assert(token.mode.length > 0, `${name} must include a mode`);
    assert(!String(token.value).includes("var(--"), `${name} public token value must not depend on CSS custom properties`);
    assert(!String(token.originalValue).includes("var(--"), `${name} public token source must not depend on CSS custom properties`);
    if (token.type === "color") {
      assert(/^(?:hsl|hsla)\(/.test(String(token.value)), `${name} color token must resolve to hsl() or hsla()`);
    }
    if (token.mode === "tv" && token.type === "dimension") {
      assert(!/calc\(|%/.test(String(token.value)), `${name} TV dimension must be portable and must not contain CSS-only calc() or percentages`);
    }
  }
}

async function checkDesignMd() {
  const designMd = await readFile(path.join(root, "DESIGN.md"), "utf8");
  const data = parse(extractFrontmatter(designMd)) as {
    colors?: DesignColors;
    typography?: Record<string, { family?: string; weight?: number; size?: string; lineHeight?: number }>;
    rounded?: Record<string, string>;
    spacing?: Record<string, string | number>;
    components?: Record<string, Record<string, string>>;
  };
  const flat = JSON.parse(await readFile(path.join(root, "dist/tokens.flat.json"), "utf8")) as Record<string, TokenRecord>;

  const expectations: Array<[unknown, string, string]> = [
    [data.colors?.brand, "color.brand.yellow", "DESIGN.md colors.brand"],
    [data.colors?.dark?.["app-bg"], "surface.dark.appBg", "DESIGN.md colors.dark.app-bg"],
    [data.colors?.dark?.["page-bg"], "surface.dark.htmlBg", "DESIGN.md colors.dark.page-bg"],
    [data.colors?.dark?.text, "color.neutral.dark.text", "DESIGN.md colors.dark.text"],
    [data.colors?.dark?.["text-muted"], "color.neutral.dark.textSecondary", "DESIGN.md colors.dark.text-muted"],
    [data.colors?.dark?.border, "color.neutral.dark.border", "DESIGN.md colors.dark.border"],
    [data.colors?.dark?.success, "color.green.dark.solid", "DESIGN.md colors.dark.success"],
    [data.colors?.dark?.danger, "color.red.dark.solid", "DESIGN.md colors.dark.danger"],
    [data.colors?.light?.["app-bg"], "surface.light.appBg", "DESIGN.md colors.light.app-bg"],
    [data.colors?.light?.["page-bg"], "surface.light.htmlBg", "DESIGN.md colors.light.page-bg"],
    [data.colors?.light?.text, "color.neutral.light.text", "DESIGN.md colors.light.text"],
    [data.colors?.light?.["text-muted"], "color.neutral.light.textSecondary", "DESIGN.md colors.light.text-muted"],
    [data.colors?.light?.border, "color.neutral.light.border", "DESIGN.md colors.light.border"],
    [data.colors?.light?.success, "color.green.light.solid", "DESIGN.md colors.light.success"],
    [data.colors?.light?.danger, "color.red.light.solid", "DESIGN.md colors.light.danger"],
    [data.typography?.ui?.family, "typography.fontFamily.sans", "DESIGN.md typography.ui.family"],
    [data.typography?.ui?.weight, "typography.fontWeight.regular", "DESIGN.md typography.ui.weight"],
    [data.typography?.ui?.size, "typography.fontSize.base", "DESIGN.md typography.ui.size"],
    [data.typography?.ui?.lineHeight, "typography.lineHeight.normal", "DESIGN.md typography.ui.lineHeight"],
    [data.typography?.display?.family, "typography.fontFamily.display", "DESIGN.md typography.display.family"],
    [data.typography?.display?.weight, "typography.fontWeight.black", "DESIGN.md typography.display.weight"],
    [data.typography?.display?.size, "typography.fontSize.display", "DESIGN.md typography.display.size"],
    [data.typography?.display?.lineHeight, "typography.lineHeight.tight", "DESIGN.md typography.display.lineHeight"],
    [data.typography?.mono?.family, "typography.fontFamily.mono", "DESIGN.md typography.mono.family"],
    [data.typography?.mono?.weight, "typography.fontWeight.regular", "DESIGN.md typography.mono.weight"],
    [data.typography?.mono?.size, "typography.fontSize.sm", "DESIGN.md typography.mono.size"],
    [data.typography?.mono?.lineHeight, "typography.lineHeight.normal", "DESIGN.md typography.mono.lineHeight"],
    [data.rounded?.sm, "radius.sm", "DESIGN.md rounded.sm"],
    [data.rounded?.default, "radius.default", "DESIGN.md rounded.default"],
    [data.rounded?.md, "radius.md", "DESIGN.md rounded.md"],
    [data.rounded?.lg, "radius.lg", "DESIGN.md rounded.lg"],
    [data.rounded?.pill, "radius.pill", "DESIGN.md rounded.pill"],
    [data.spacing?.xs, "spacing.1", "DESIGN.md spacing.xs"],
    [data.spacing?.sm, "spacing.2", "DESIGN.md spacing.sm"],
    [data.spacing?.md, "spacing.3", "DESIGN.md spacing.md"],
    [data.spacing?.lg, "spacing.4", "DESIGN.md spacing.lg"],
    [data.spacing?.xl, "spacing.5", "DESIGN.md spacing.xl"],
  ];

  for (const [actual, tokenName, label] of expectations) {
    assert(flat[tokenName], `${label} references missing canonical token ${tokenName}`);
    assert(String(actual) === String(flat[tokenName].value), `${label} must match ${tokenName}`);
  }

  assert(data.components?.button?.["primary-bg"] === "{colors.brand}", "DESIGN.md button.primary-bg must alias colors.brand");
  assert(data.components?.button?.radius === "{rounded.default}", "DESIGN.md button.radius must alias rounded.default");
  assert(data.components?.input?.radius === "{rounded.default}", "DESIGN.md input.radius must alias rounded.default");
  assert(data.components?.["file-row"]?.icon === "{colors.brand}", "DESIGN.md file-row.icon must alias colors.brand");
}

async function checkAppleContract() {
  const files = {
    contract: "platforms/apple/DESIGN.md",
    css: "system/preview/_apple.css",
    folders: "system/preview/ios-e00-list-row.html",
    searchfield: "system/preview/ios-e08-searchfield.html",
    glass: "system/preview/ios-e05-glass-button.html",
    progress: "system/preview/ios-e09-progress.html",
    tabs: "system/preview/ios-e10-tabbar.html",
    navbar: "system/preview/ios-e11-navbar.html",
    sheet: "system/preview/ios-e12-sheet.html",
    empty: "system/preview/ios-e15-emptystate.html",
    gauge: "system/preview/ios-e16-gauge.html",
    shell: "system/preview/ios-s00-shell.html",
    fileScreen: "system/preview/ios-s01-files.html",
    transfers: "system/preview/ios-s02-transfers.html",
    settings: "system/preview/ios-s04-settings.html",
  } as const;
  const contents = Object.fromEntries(
    await Promise.all(Object.entries(files).map(async ([name, file]) => [name, await readFile(path.join(root, file), "utf8")])),
  ) as Record<keyof typeof files, string>;
  const metadata = parse(extractFrontmatter(contents.contract)) as {
    version?: string;
    reviewed?: { date?: string };
  };

  const semVerCases = {
    valid: ["0.0.0", "1.2.3", "1.0.0-alpha", "1.0.0-alpha.1", "1.0.0+build.01", "1.0.0-beta.2+build.5"],
    invalid: ["01.0.0", "1.01.0", "1.0.01", "1.0.0-01", "1.0", "v1.0.0", "1.0.0+"],
  };
  for (const value of semVerCases.valid) assert(isSemVer(value), `SemVer validator must accept ${value}`);
  for (const value of semVerCases.invalid) assert(!isSemVer(value), `SemVer validator must reject ${value}`);
  const calendarDateCases = {
    valid: ["2000-02-29", "2024-02-29", "2026-04-30"],
    invalid: ["1900-02-29", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00"],
  };
  for (const value of calendarDateCases.valid) assert(isIsoCalendarDate(value), `Date validator must accept ${value}`);
  for (const value of calendarDateCases.invalid) assert(!isIsoCalendarDate(value), `Date validator must reject ${value}`);
  assert(isSemVer(metadata.version), "Apple contract version must use SemVer");
  assert(isIsoCalendarDate(metadata.reviewed?.date), "Apple contract review date must be a valid ISO calendar date");

  const stateFragments = htmlElementsWithClass(contents.gauge, "el-state");
  const states = stateFragments.map((fragment) =>
    /\sdata-download-state\s*=\s*(["'])(.*?)\1/i.exec(fragment.slice(0, fragment.indexOf(">") + 1))?.[2],
  );
  assert(
    states.join(",") === "idle,queued,downloading,downloaded,failed",
    "Gauge card must bind the five download states in order",
  );
  const stateGlyphs = [
    ["ph", "ph-arrow-down"], ["ph", "ph-clock"], ["ph-fill", "ph-stop"],
    ["ph-fill", "ph-check-circle"], ["ph", "ph-arrow-down"],
  ];
  for (const [index, fragment] of stateFragments.entries()) {
    const glyphs = [...htmlElementsWithClass(fragment, "ph"), ...htmlElementsWithClass(fragment, "ph-fill")];
    assert(glyphs.length === 1, `${states[index]} must have one glyph`);
    const classes = htmlOpeningClasses(glyphs[0]);
    assert(stateGlyphs[index].every((value) => classes.includes(value)), `${states[index]} must use its contracted glyph`);
    const ringCount = htmlElementsWithClass(fragment, "ios-gauge-preview").length;
    assert(ringCount === (states[index] === "downloading" ? 1 : 0), `${states[index]} Gauge ring ownership`);
  }
  const failedReasonOwners = htmlElementsWithAttribute(stateFragments[4], "data-reason-owner");
  assert(failedReasonOwners.length === 1, "Failed must have one reason owner");
  assert(htmlOpeningClasses(failedReasonOwners[0]).includes("sd"), "Failed reason must belong to its subtitle");
  assert(failedReasonOwners[0].replace(/<[^>]*>/g, "").trim().length > 0, "Failed subtitle must describe reason ownership");
  assert(
    /\sdata-reason-owner\s*=\s*(["'])row-subtitle\1/.test(failedReasonOwners[0].split(">", 1)[0]),
    "Failed reason owner must identify the row subtitle",
  );
  assertIncludes(cssRule(contents.css, ".ios-gauge-preview"), "width: 47px", "Gauge preview");
  assertIncludes(cssRule(contents.css, ".ios-gauge-preview"), "height: 47px", "Gauge preview");
  const gaugeTrackRule = cssRule(contents.css, ".ios-gauge-preview::before");
  const gaugeTrack = /background: conic-gradient\(currentColor var\(--ios-preview-progress\), color-mix\(in srgb, currentColor (\d+(?:\.\d+)?)%, transparent\) 0\);/.exec(gaugeTrackRule);
  assert(gaugeTrack, "Gauge unfilled track must derive from tint at system opacity");
  const gaugeOpacity = Number(gaugeTrack[1]);
  assert(gaugeOpacity > 0 && gaugeOpacity < 100, "Gauge unfilled track must remain visible and distinct from its fill");
  assertIncludes(gaugeTrackRule, "transparent 16.5px, #000 17px", "Gauge approximately 7pt stroke");
  assertExcludes(gaugeTrackRule, "var(--line)", "Gauge track preview");

  assertIncludes(contents.progress, "ios-progress-preview", "ProgressView card");
  assertExcludes(contents.progress, "--component-bg-active", "ProgressView card");
  const progressTrackRule = cssRule(contents.css, ".ios-progress-preview");
  const progressTrack = /(?:^|;)\s*background\s*:\s*([^;]+)/.exec(progressTrackRule)?.[1];
  assert(
    progressTrack && /^color-mix\(in srgb, var\(--text\) \d+(?:\.\d+)?%, transparent\)$/.test(progressTrack),
    "ProgressView track must use the neutral system-opacity preview",
  );
  assertExcludes(contents.gauge, "--line", "Gauge card");
  const transferProgress = htmlElementsWithClass(contents.transfers, "lprog");
  assert(transferProgress.length === 4, "Transfers card must show four row progress examples");
  assert(
    transferProgress.every((element) => htmlOpeningClasses(element).includes("ios-progress-preview")),
    "Transfers row progress must use the system-track preview helper",
  );

  for (const selector of [".ios-navbar .back", ".ios-navbar .act", ".cuv .cuv-a"]) {
    assertIncludes(cssRule(contents.css, selector), "var(--yellow-solid)", `${selector} tint`);
  }
  for (const [name, source] of Object.entries({
    navbar: contents.navbar,
    sheet: contents.sheet,
    empty: contents.empty,
  })) {
    assertExcludes(source, "--yellow-text-secondary", `${name} system accent contract`);
  }
  assertIncludes(contents.contract, "App-authored text", "App-authored accent exception");
  assertIncludes(contents.contract, "--yellow-text-secondary", "App-authored accent exception");

  assertIncludes(contents.glass, "<code>.borderedProminent</code>", "Glass boundary card");
  assertIncludes(contents.glass, "<code>.bordered</code>", "Glass boundary card");
  assertIncludes(contents.contract, "At most one prominent glass capsule appears on a screen.", "Glass prominence limit");
  assertIncludes(contents.empty, "ios-bordered-action", "Empty-state content action");
  assertIncludes(contents.fileScreen, "ios-bordered-action", "File-screen content action");
  for (const [name, source] of Object.entries({ empty: contents.empty, fileScreen: contents.fileScreen })) {
    for (const action of htmlElementsWithClass(source, "cuv-a")) {
      assert(htmlOpeningClasses(action).includes("ios-bordered-action"), `${name} content action must be bordered`);
      for (const glassClass of ["gbtn", "gcap"]) {
        assert(htmlElementsWithClass(action, glassClass).length === 0, `${name} content action must not use ${glassClass}`);
      }
    }
  }
  const previewDirectory = path.join(root, "system/preview");
  const screenFiles = (await readdir(previewDirectory)).filter((file) => /^ios-s\d+.*\.html$/.test(file));
  const prominentCapsules = (source: string) => [
    ...htmlElementsWithClass(source, "gbtn", "prominent"),
    ...htmlElementsWithClass(source, "gcap", "prominent"),
  ];
  const screenElements = (source: string) => [
    ...htmlElementsWithClass(source, "iphone"),
    ...htmlElementsWithClass(source, "ipad"),
  ];
  const screenFixture = `<div data-class="metadata" class="preview iphone"><div class="glass gbtn prominent"></div>
    <div class='prominent gcap glass'></div></div><div class="ipad preview"><div class="gbtn"></div></div>
    <!-- <div class="iphone"><div class="gbtn prominent"></div></div> -->`;
  const fixtureScreens = screenElements(screenFixture);
  assert(fixtureScreens.length === 2, "Screen parsing must use the real class attribute, accept additional classes and ignore comments");
  assert(prominentCapsules(fixtureScreens[0]).length === 2, "Capsule counting must accept reordered and additional classes");
  assert(prominentCapsules(fixtureScreens[1]).length === 0, "Capsule counting must stay within each screen");
  for (const file of screenFiles) {
    const source = await readFile(path.join(previewDirectory, file), "utf8");
    for (const [index, screen] of screenElements(source).entries()) {
      assert(prominentCapsules(screen).length <= 1, `${file} screen ${index + 1} must have at most one prominent glass capsule`);
    }
  }
  for (const [name, source] of Object.entries(contents)) {
    for (const className of ["system-search", "system-back", "system-clear", "system-check", "system-chevron"]) {
      for (const glyph of htmlElementsWithClass(source, className)) {
        assert(/^<svg\s/i.test(glyph), `${name} ${className} must use an inline SVG`);
        assertIncludes(glyph, 'viewBox="0 0 24 24"', `${name} ${className} view box`);
        const paths = [...glyph.matchAll(/<path\b[^>]*\sd\s*=\s*(["'])(.*?)\1/gi)];
        const circles = [...glyph.matchAll(/<circle\b[^>]*\sr\s*=\s*(["'])(.*?)\1/gi)];
        assert(
          paths.some(([, , data]) => data.trim().length > 0)
            || circles.some(([, , radius]) => Number.isFinite(Number(radius)) && Number(radius) > 0),
          `${name} ${className} must have nonempty vector geometry`,
        );
        assert(glyph.replace(/<[^>]*>/g, "").trim() === "", `${name} ${className} must not depend on font glyphs`);
      }
    }
  }

  const systemChromeSelectors = [
    ".ios-status",
    ".ios-largetitle",
    ".ios-navbar .back",
    ".ios-navbar .nt",
    ".ios-tabbar",
    ".ios-searchfield",
    ".ipad-sidetitle",
    ".wos-time",
    ".wos-title",
    ".tvos-tabbar",
  ];
  for (const selector of systemChromeSelectors) {
    assertIncludes(cssRule(contents.css, selector), "-apple-system", `${selector} system typography`);
  }
  const authoredControlSelectors = [
    ".ios-navbar .act",
    ".ios-segmented",
    ".ipad-toolbar .tt",
    ".ios-swipe .sa",
    ".ios-ctx .ci",
  ];
  for (const selector of authoredControlSelectors) {
    assertExcludes(cssRule(contents.css, selector), "-apple-system", `${selector} app-authored typography`);
  }

  assertIncludes(cssRule(contents.css, ".ios-tabbar .tab i"), "font-size: 24px", "Tab glyph box");
  assertIncludes(contents.tabs, "24pt intrinsic Phosphor box", "Tab glyph contract card");
  const systemCheckRule = cssRule(contents.css, ".ios-row .chev.system-check");
  assertIncludes(systemCheckRule, "font-size: 20px", "System-owned selection checkmark");
  assertIncludes(systemCheckRule, "color: var(--yellow-solid)", "System-owned selection checkmark");
  const systemSearchControls = [
    ["Tab card Search capsule", contents.tabs, "ios-searchcap"],
    ["Search field card", contents.searchfield, "ios-searchfield"],
    ["Shell Search capsule", contents.shell, "ios-searchcap"],
    ["Files Search field", contents.fileScreen, "ios-searchfield"],
    ["Files Search capsule", contents.fileScreen, "ios-searchcap"],
    ["Transfers Search capsule", contents.transfers, "ios-searchcap"],
  ] as const;
  for (const [label, source, className] of systemSearchControls) {
    const controls = htmlElementsWithClass(source, className);
    assert(controls.length > 0, `${label} must exist`);
    for (const control of controls) {
      assert(htmlElementsWithClass(control, "system-search").length === 1, `${label} must have one system-owned Search glyph`);
      assertExcludes(control, "ph-", `${label} system-owned Search glyph`);
    }
  }
  const clearOwners = htmlElementsWithAttribute(contents.searchfield, "data-system-clear-owner");
  assert(clearOwners.length === 1, "Search field card must have one clear-button owner");
  assert(htmlElementsWithClass(clearOwners[0], "system-clear").length === 1, "Search field card must have one system-owned clear glyph");
  assertExcludes(clearOwners[0], "ph-", "Search field card system-owned clear glyph");
  for (const [name, source] of Object.entries({
    navbar: contents.navbar,
    fileScreen: contents.fileScreen,
    transfers: contents.transfers,
  })) {
    const backControls = htmlElementsWithClass(source, "back");
    assert(backControls.length > 0, `${name} system-owned back control must exist`);
    for (const backControl of backControls) {
      assert(htmlElementsWithClass(backControl, "system-back").length === 1, `${name} must have one system-owned back glyph`);
      assertExcludes(backControl, "ph-", `${name} system-owned back glyph`);
    }
  }
  for (const [name, source] of Object.entries({ sheet: contents.sheet, settings: contents.settings })) {
    const selectionOwners = htmlElementsWithAttribute(source, "data-system-selection-owner");
    assert(selectionOwners.length > 0, `${name} system-owned selection control must exist`);
    for (const selectionOwner of selectionOwners) {
      assert(htmlElementsWithClass(selectionOwner, "system-check").length === 1, `${name} must have one system-owned checkmark`);
      assertExcludes(selectionOwner, "ph-", `${name} system-owned checkmark`);
    }
  }
  for (const [name, source] of Object.entries({
    folders: contents.folders,
    shell: contents.shell,
    fileScreen: contents.fileScreen,
  })) {
    const folderRows = htmlElementsWithClass(source, "ios-row").filter(
      (row) => htmlElementsWithClass(row, "ph-folder").length > 0,
    );
    assert(folderRows.length > 0, `${name} must show a folder row`);
    for (const [index, row] of folderRows.entries()) {
      assert(htmlElementsWithClass(row, "system-chevron").length === 1, `${name} folder row ${index + 1} must have one system disclosure`);
    }
    assertExcludes(source, "ph-caret-right", `${name} folder disclosure`);
  }
  assertIncludes(contents.folders, "List + NavigationLink", "Folder row source");
}

async function checkHtmlLinks() {
  const htmlFiles = (await walk(path.join(root, "system"))).filter((file) => file.endsWith(".html"));
  const attrPattern = /\b(?:href|src)=["']([^"']+)["']/g;

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    assert(!/^<!--\s*@dsCard/.test(html), `${path.relative(root, file)} still carries a design-tool @dsCard marker — strip it on import`);
    for (const match of html.matchAll(attrPattern)) {
      const target = match[1];
      if (
        target.startsWith("http://") ||
        target.startsWith("https://") ||
        target.startsWith("mailto:") ||
        target.startsWith("data:") ||
        target.startsWith("#") ||
        target === ""
      ) {
        continue;
      }
      const cleanTarget = target.split(/[?#]/, 1)[0];
      const resolved = path.resolve(path.dirname(file), cleanTarget);
      try {
        const info = await stat(resolved);
        assert(info.isFile() || info.isDirectory(), `${target} from ${path.relative(root, file)} is not a file or directory`);
      } catch {
        throw new Error(`${target} from ${path.relative(root, file)} does not exist`);
      }
    }
  }
}

async function checkCss() {
  const tvCss = await readFile(path.join(root, "system/tv.css"), "utf8");
  assert(!/!important/.test(tvCss), "tv.css 10-foot styles must not use !important");
  assert(!/^:root\s*\{[\s\S]*?--surf-/m.test(tvCss), "TV-specific tokens must be scoped to .tv, not :root");
  assert(!/^\.tv-content\s*\{/m.test(tvCss), "tv.css component selectors must remain scoped under .tv");
}

async function main() {
  await Promise.all([
    assertExists("dist/css/tokens.css"),
    assertExists("dist/tokens.dtcg.json"),
    assertExists("dist/tokens.flat.json"),
    assertExists("dist/tokens.js"),
    assertExists("dist/tokens.d.ts"),
    assertExists("dist/figma/putio.tokens.json"),
    assertExists("DESIGN.md"),
    assertExists("system/assets/app-icon-beta.png"),
  ]);

  await checkTokens();
  await checkDesignMd();
  await checkAppleContract();
  await checkHtmlLinks();
  await checkCss();
  console.log("Design system checks passed");
}

await main();
