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
/*
  `instead` maps a generic token to the family token that supersedes it. The
  mapping has to be per family, not one global ban list: `--text-secondary` is
  wrong for a menu label because `--menu-label` owns it, but right for
  `.field:disabled`, because the field family has `--field-bg-disabled` and no
  text counterpart. A blanket ban would fail correct code.

  Scope covers the selector and every continuation of it — descendants, states,
  attribute and class compounds — because `.menu-pop` reading `--menu-bg` while
  `.menu-pop .menu-label` read `--text-secondary` looked correct from the parent
  rule alone, and `.field` alone has fourteen compound selectors.

  This cannot prove a family is fully consumed: `--menu-item-*` is used by the
  specimen cards rather than here, so requiring every family token to appear would
  fail on correct code. It catches the commoner mistake in the other direction.
*/
const ALIAS_CONTRACTS = [
  {
    selector: ".field",
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

/* A selector continues the base when what follows it starts a state, attribute,
   class or descendant — never another identifier character, so `.fieldset` is not
   a continuation of `.field`. */
const CONTINUATION = /^[\s:.[#>+~]/;

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

/* Every top-level rule, as selector plus body, so a contract can be applied to a
   selector and everything scoped under it.

   Walked with a brace counter rather than one global regex: `@keyframes` nests a
   block inside a block, and a sequential regex scan silently loses the rules that
   follow it. */
function topLevelRules(css: string) {
  const found: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let start = 0;
  let selectorStart = 0;

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    if (char === "{") {
      if (depth === 0) {
        start = i;
        selectorStart = css.lastIndexOf("}", i - 1) + 1;
      }
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const prelude = css.slice(selectorStart, start).trim();
        const body = css.slice(start + 1, i);
        if (!prelude.startsWith("@")) {
          for (const selector of prelude.split(",")) {
            const normalised = selector.trim().replace(/\s+/g, " ");
            if (normalised) found.push({ selector: normalised, body });
          }
        }
      }
    }
  }
  return found;
}

const rules = topLevelRules(code);

for (const { selector, family, instead } of ALIAS_CONTRACTS) {
  const own = rules.find((rule) => rule.selector === selector);
  if (own === undefined) {
    aliasFailures.push(`\`${selector}\` has no rule block, so its ${family}* contract cannot be checked`);
    continue;
  }
  if (!own.body.includes(`var(${family}`)) {
    aliasFailures.push(`\`${selector}\` reads no ${family}* token — its alias family exists and must be used`);
  }

  /* Keeps the map honest: a substitution pointing at a token the build no longer
     emits would silently stop protecting anything. */
  for (const replacement of Object.values(instead)) {
    if (!defined.has(replacement)) {
      aliasFailures.push(`the ${family}* contract names \`${replacement}\`, which ${TOKENS_CSS} does not emit`);
    }
  }

  const scoped = rules.filter(
    (rule) => rule.selector === selector || (rule.selector.startsWith(selector) && CONTINUATION.test(rule.selector.slice(selector.length))),
  );
  for (const rule of scoped) {
    for (const [generic, replacement] of Object.entries(instead)) {
      if (new RegExp(`var\\(\\s*${generic}\\s*[,)]`).test(rule.body)) {
        aliasFailures.push(`\`${rule.selector}\` reads \`${generic}\` where \`${replacement}\` owns it`);
      }
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
