import { readFile } from "node:fs/promises";
import process from "node:process";

// system/components.css ships as @putdotio/design/components on top of
// @putdotio/design/css, so every var(--x) it reads must be emitted by the
// token build, its published selectors must survive parsing, and chrome with
// its own alias family (--field-*, --panel-*, --menu-*) must read that family
// rather than the generic surface tokens.

const COMPONENT_CSS = "system/components.css";
const TOKENS_CSS = "dist/css/tokens.css";

// Published selector API. A stray "*/" can close a comment early and silently
// drop whole rule blocks while every remaining custom property still resolves.
const REQUIRED_SELECTORS = [
  "button",
  ".btn-primary",
  ".btn-default",
  ".btn-ghost",
  ".btn-quiet",
  ".btn-md",
  ".btn-icon",
  ".card",
  ".panel",
  ".field",
  ".form-group",
  ".form-callout",
  '.form-callout[data-state="info"]',
  '.form-callout[data-state="success"]',
  '.form-callout[data-state="error"]',
  ".form-callout[hidden]",
  ".form-callout.inline",
  ".form-reveal",
  '.form-reveal[data-state="open"]',
  ".otp",
  ".otp-input",
  ".otp-group",
  ".otp-slot",
  '.otp:focus-within .otp-slot[data-state="active"]',
  ".otp-separator",
  '.otp:has(.otp-input[aria-invalid="true"]) .otp-slot',
  '.otp[data-state="verifying"] .otp-slot',
  '.otp:has(.otp-input:disabled) .otp-slot',
  '.otp[data-state="success"] .otp-slot',
  ".auth-page",
  ".auth-header",
  ".auth-logo",
  ".auth-main",
  ".auth-column",
  ".auth-title",
  ".auth-links",
  ".auth-footer",
  ".menu-pop",
  ".checkbox",
  ".switch",
];

// Variables the consuming page sets, not the system. Always read with a fallback.
const CONSUMER_HOOKS = new Set(["--tw-fs"]);

// Per-family substitutions, not a global ban list: --text-secondary is wrong in
// a menu label (--menu-label owns it) but fine in .field:disabled.
const ALIAS_CONTRACTS = [
  {
    selector: ".field",
    family: "--field-",
    instead: { "--component-bg": "--field-bg", "--bg-secondary": "--field-bg", "--line": "--field-border" },
  },
  {
    selector: ".form-callout",
    family: "--alert-",
    instead: {
      "--bg-secondary": "--alert-info-bg",
      "--line": "--alert-info-border",
      "--text-secondary": "--alert-info-body",
    },
  },
  {
    selector: ".otp-slot",
    family: "--field-",
    instead: { "--component-bg": "--field-bg", "--bg-secondary": "--field-bg", "--line": "--field-border" },
  },
  {
    selector: ".panel",
    family: "--panel-",
    instead: { "--component-bg": "--panel-bg", "--bg-secondary": "--panel-bg", "--line": "--panel-border" },
  },
  {
    selector: ".menu-pop",
    family: "--menu-",
    instead: {
      "--component-bg": "--menu-bg",
      "--bg-secondary": "--menu-bg",
      "--line": "--menu-border",
      "--text-secondary": "--menu-label",
    },
  },
];

// A continuation starts a state, attribute, class, or descendant — never an
// identifier character, so .fieldset does not continue .field.
const CONTINUATION = /^[\s:.[#>+~]/;

const [componentCss, tokensCss] = await Promise.all([
  readFile(COMPONENT_CSS, "utf8"),
  readFile(TOKENS_CSS, "utf8"),
]);

// Brace-counted because @keyframes nests a block inside a block, which a flat
// regex scan desyncs on. At-rule contents are skipped.
function topLevelRules(css: string) {
  const found: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (css[i] === "}") {
      depth -= 1;
      if (depth > 0) continue;
      const prelude = css.slice(css.lastIndexOf("}", start - 1) + 1, start).trim();
      if (prelude.startsWith("@")) continue;
      const body = css.slice(start + 1, i);
      for (const selector of prelude.split(",")) {
        const normalised = selector.trim().replace(/\s+/g, " ");
        if (normalised) found.push({ selector: normalised, body });
      }
    }
  }
  return found;
}

const failures: string[] = [];

const opens = componentCss.match(/\/\*/g)?.length ?? 0;
const closes = componentCss.match(/\*\//g)?.length ?? 0;
if (opens !== closes) {
  failures.push(
    `comment markers do not pair: ${opens} "/*" vs ${closes} "*/". ` +
      `A stray "*/" (e.g. inside a glob in a comment) closes a block early.`,
  );
}

// Blank comments but keep line breaks so reported line numbers stay accurate,
// and so prose mentioning var(--x) is not mistaken for a live reference.
const code = componentCss.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));
const rules = topLevelRules(code);

const declaredSelectors = new Set(rules.map((rule) => rule.selector));
for (const selector of REQUIRED_SELECTORS) {
  if (!declaredSelectors.has(selector)) {
    failures.push(`required selector \`${selector}\` is not declared — the parser never saw its rule`);
  }
}

const defined = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((match) => match[1]));

for (const { selector, family, instead } of ALIAS_CONTRACTS) {
  const own = rules.find((rule) => rule.selector === selector);
  if (own === undefined) {
    failures.push(`\`${selector}\` has no rule block, so its ${family}* contract cannot be checked`);
    continue;
  }
  if (!own.body.includes(`var(${family}`)) {
    failures.push(`\`${selector}\` reads no ${family}* token — its alias family exists and must be used`);
  }
  for (const replacement of Object.values(instead)) {
    if (!defined.has(replacement)) {
      failures.push(`the ${family}* contract names \`${replacement}\`, which ${TOKENS_CSS} does not emit`);
    }
  }

  const scoped = rules.filter(
    (rule) => rule.selector === selector || (rule.selector.startsWith(selector) && CONTINUATION.test(rule.selector.slice(selector.length))),
  );
  for (const rule of scoped) {
    for (const [generic, replacement] of Object.entries(instead)) {
      if (new RegExp(`var\\(\\s*${generic}\\s*[,)]`).test(rule.body)) {
        failures.push(`\`${rule.selector}\` reads \`${generic}\` where \`${replacement}\` owns it`);
      }
    }
  }
}

const referenced = new Map<string, number>();
for (const match of code.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
  if (!referenced.has(match[1])) referenced.set(match[1], code.slice(0, match.index).split("\n").length);
}
for (const [name, line] of referenced) {
  if (!defined.has(name) && !CONSUMER_HOOKS.has(name)) {
    failures.push(`${name} (${COMPONENT_CSS}:${line}) is not emitted by ${TOKENS_CSS}`);
  }
}

for (const hook of CONSUMER_HOOKS) {
  const uses = code.match(new RegExp(`var\\(\\s*${hook}\\s*[,)]`, "g"))?.length ?? 0;
  const withFallback = code.match(new RegExp(`var\\(\\s*${hook}\\s*,`, "g"))?.length ?? 0;
  if (uses !== withFallback) failures.push(`${hook} is a consumer hook and must always be read with a fallback`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`\n${COMPONENT_CSS} would not ship correctly. Fix the above, then re-run pnpm tokens:check.`);
  process.exitCode = 1;
} else {
  console.log(
    `Component CSS resolves: ${referenced.size} custom properties, ` +
      `${REQUIRED_SELECTORS.length} required selectors, ` +
      `${ALIAS_CONTRACTS.length} alias contracts, ` +
      `${CONSUMER_HOOKS.size} consumer hook(s) with fallbacks`,
  );
}
