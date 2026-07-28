import { readFile } from "node:fs/promises";
import process from "node:process";

/*
  Guards the published component layer against dangling custom properties.

  `system/components.css` ships as `@putdotio/design/components` and is meant to
  be imported after `@putdotio/design/css`. Every `var(--x)` it reads must
  therefore be emitted by the token build — a typo or a token rename would
  otherwise ship a stylesheet that silently drops a colour or collapses a box,
  and nothing else in the verify chain would notice.

  The one exception is a consumer hook: a variable the page sets, not the
  system. Those must declare an in-CSS fallback so the stylesheet is correct
  when the consumer sets nothing, and must be listed here.
*/

const COMPONENT_CSS = "system/components.css";
const TOKENS_CSS = "dist/css/tokens.css";

/*
  Rules the component layer must actually declare. A stylesheet can load, report
  a plausible rule count, and still have lost whole blocks: a stray `*​/` inside a
  comment — `tokens/**​/*.json` contains one — closes the comment early and the
  browser silently discards everything up to the next terminator. That failure
  cost the base `button` reset once; nothing else in the verify chain noticed,
  because every custom property still resolved.
*/
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
  ".menu-pop",
  ".checkbox",
  ".switch",
];

/* --tw-fs is a breakpoint multiplier owned by the page: a token would imply the
   system picks one scale for every viewport. It is always read with a `, 1`
   fallback. */
const CONSUMER_HOOKS = new Set(["--tw-fs"]);

/*
  Chrome that has its own alias family must read that family, not the generic
  surface scale. Existence checks alone cannot see this: `.panel` reading
  `--bg-secondary` resolves perfectly and still breaks every consumer trying to
  retheme panels through `--panel-*`. All three of these regressed exactly that
  way before the layer became public API.
*/
const ALIAS_CONTRACTS = [
  { selector: ".field", family: "--field-" },
  { selector: ".panel", family: "--panel-" },
  { selector: ".menu-pop", family: "--menu-" },
];

/* Reaching for one of these inside an aliased block is the tell that the family
   was bypassed. Scale tokens that no family supersedes are fine. */
const GENERIC_SURFACE = ["--component-bg", "--bg-secondary", "--line"];

const [componentCss, tokensCss] = await Promise.all([
  readFile(COMPONENT_CSS, "utf8"),
  readFile(TOKENS_CSS, "utf8"),
]);

/* Comment markers must pair up exactly. An imbalance means a block terminated
   somewhere unintended, so every rule after it is at the mercy of the parser. */
const opens = componentCss.match(/\/\*/g)?.length ?? 0;
const closes = componentCss.match(/\*\//g)?.length ?? 0;

/* Blank out comments the way the parser would, but keep the file's length and
   line breaks so reported line numbers still point at the real source. Prose
   inside a comment is not a runtime reference: a comment that documents
   `var(--tv-z-overlay)` must not be mistaken for a live one. */
const code = componentCss.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));

/* The selectors that survive parsing. Anything the parser dropped is absent.
   Whitespace is collapsed but never split away: `button i` must not be able to
   satisfy a requirement for the bare `button` reset, which is the exact rule
   that went missing and started this check. */
const declaredSelectors = new Set(
  [...code.matchAll(/(?:^|[}])\s*([^{}@]+?)\s*\{/g)]
    .flatMap((match) => match[1].split(","))
    .map((selector) => selector.trim().replace(/\s+/g, " "))
    .filter(Boolean),
);
const missingSelectors = REQUIRED_SELECTORS.filter((selector) => !declaredSelectors.has(selector));

const referenced = new Map<string, number>();
for (const match of code.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
  const name = match[1];
  if (!referenced.has(name)) {
    referenced.set(name, code.slice(0, match.index).split("\n").length);
  }
}

const defined = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((match) => match[1]));

const missing = [...referenced].filter(([name]) => !defined.has(name) && !CONSUMER_HOOKS.has(name));

/* Read each aliased selector's own declaration block out of the comment-blanked
   source, so a family bypass is caught where it happens. */
const aliasFailures: string[] = [];
for (const { selector, family } of ALIAS_CONTRACTS) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = code.match(new RegExp(`(?:^|[}])\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1];

  if (block === undefined) {
    aliasFailures.push(`\`${selector}\` has no rule block, so its ${family}* contract cannot be checked`);
    continue;
  }
  if (!block.includes(`var(${family}`)) {
    aliasFailures.push(`\`${selector}\` reads no ${family}* token — its alias family exists and must be used`);
  }
  for (const generic of GENERIC_SURFACE) {
    if (new RegExp(`var\\(\\s*${generic}\\s*[,)]`).test(block)) {
      aliasFailures.push(`\`${selector}\` reads the generic \`${generic}\` instead of its ${family}* equivalent`);
    }
  }
}

/* A hook that loses its fallback is the same bug in reverse: the value would
   resolve to nothing whenever the consumer does not set it. */
const hooksWithoutFallback = [...CONSUMER_HOOKS].filter((hook) => {
  const withFallback = new RegExp(`var\\(\\s*${hook}\\s*,`, "g");
  const anyUse = new RegExp(`var\\(\\s*${hook}\\s*[,)]`, "g");
  return (code.match(anyUse)?.length ?? 0) !== (code.match(withFallback)?.length ?? 0);
});

const failed =
  missing.length > 0 ||
  hooksWithoutFallback.length > 0 ||
  missingSelectors.length > 0 ||
  aliasFailures.length > 0 ||
  opens !== closes;

if (failed) {
  if (opens !== closes) {
    console.error(
      `- comment markers do not pair: ${opens} "/*" vs ${closes} "*/". ` +
        `A stray "*/" (e.g. inside a glob like tokens/**​/*.json) closes a block early.`,
    );
  }
  for (const selector of missingSelectors) {
    console.error(`- required selector \`${selector}\` is not declared — the parser never saw its rule`);
  }
  for (const failure of aliasFailures) {
    console.error(`- ${failure}`);
  }
  for (const [name, line] of missing) {
    console.error(`- ${name} (${COMPONENT_CSS}:${line}) is not emitted by ${TOKENS_CSS}`);
  }
  for (const hook of hooksWithoutFallback) {
    console.error(`- ${hook} is a consumer hook and must always be read with a fallback`);
  }
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
