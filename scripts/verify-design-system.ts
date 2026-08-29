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
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert(match, `Missing ${selector} CSS rule`);
  return match[1];
}

function assertIncludes(source: string, value: string, label: string) {
  assert(source.includes(value), `${label} must include ${value}`);
}

function assertExcludes(source: string, value: string, label: string) {
  assert(!source.includes(value), `${label} must not include ${value}`);
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
  } as const;
  const contents = Object.fromEntries(
    await Promise.all(Object.entries(files).map(async ([name, file]) => [name, await readFile(path.join(root, file), "utf8")])),
  ) as Record<keyof typeof files, string>;
  const metadata = parse(extractFrontmatter(contents.contract)) as {
    version?: string;
    reviewed?: { date?: string };
  };

  assert(metadata.version === "0.2.0", "Apple contract version must be 0.2.0");
  assert(metadata.reviewed?.date === "2026-08-29", "Apple contract review date must be 2026-08-29");

  const stateFragments = contents.gauge.split('<div class="el-state" data-download-state="').slice(1);
  const states = stateFragments.map((fragment) => fragment.slice(0, fragment.indexOf('"')));
  assert(
    states.join(",") === "idle,queued,downloading,downloaded,failed",
    "Gauge card must bind the five download states in order",
  );
  const idleState = stateFragments[0];
  const failedState = stateFragments[4];
  const idleGlyph = idleState.match(/<i class="([^"]+)"/);
  const failedGlyph = failedState.match(/<i class="([^"]+)"/);
  assert(idleGlyph && failedGlyph, "Idle and Failed states must include glyphs");
  assert(failedGlyph[1] === idleGlyph[1], "Failed must reuse the Idle glyph");
  assertIncludes(failedState, 'data-reason-owner="row-subtitle"', "Failed-state reason ownership");
  assertIncludes(contents.gauge, "ios-gauge-preview", "Gauge card");
  assertIncludes(cssRule(contents.css, ".ios-gauge-preview"), "width: 47px", "Gauge preview");
  assertIncludes(cssRule(contents.css, ".ios-gauge-preview"), "height: 47px", "Gauge preview");
  const gaugeTrackRule = cssRule(contents.css, ".ios-gauge-preview::before");
  assertIncludes(gaugeTrackRule, "currentColor", "Gauge track preview");
  assertIncludes(gaugeTrackRule, "transparent 16.5px, #000 17px", "Gauge approximately 7pt stroke");
  assertExcludes(gaugeTrackRule, "var(--line)", "Gauge track preview");

  assertIncludes(contents.progress, "ios-progress-preview", "ProgressView card");
  assertExcludes(contents.progress, "--component-bg-active", "ProgressView card");
  assertExcludes(contents.gauge, "--line", "Gauge card");
  const transferProgress = [...contents.transfers.matchAll(/class="lprog ([^"]+)"/g)].map(([, classes]) => classes);
  assert(transferProgress.length === 4, "Transfers card must show four row progress examples");
  assert(
    transferProgress.every((classes) => classes.split(/\s+/).includes("ios-progress-preview")),
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
  assertExcludes(contents.empty, "class=\"gbtn", "Empty-state content action");
  const previewDirectory = path.join(root, "system/preview");
  const screenFiles = (await readdir(previewDirectory)).filter((file) => /^ios-s\d+.*\.html$/.test(file));
  for (const file of screenFiles) {
    const source = await readFile(path.join(previewDirectory, file), "utf8");
    const screens = [...source.matchAll(/<div class="(?:iphone|ipad)">/g)];
    for (const [index, screen] of screens.entries()) {
      const start = screen.index ?? 0;
      const end = screens[index + 1]?.index ?? source.length;
      const prominentCount = (source.slice(start, end).match(/class="(?:gbtn|gcap) prominent"/g) ?? []).length;
      assert(prominentCount <= 1, `${file} screen ${index + 1} must have at most one prominent glass capsule`);
    }
  }

  const systemChromeSelectors = [
    ".ios-status",
    ".ios-largetitle",
    ".ios-navbar .back",
    ".ios-navbar .nt",
    ".ios-tabbar",
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
    ".ios-searchfield",
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
  for (const [name, source] of Object.entries({
    folders: contents.folders,
    shell: contents.shell,
    fileScreen: contents.fileScreen,
  })) {
    assertIncludes(source, "system-chevron", `${name} folder disclosure`);
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
