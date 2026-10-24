import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

import { compile } from "tailwindcss";

// dist/css/tailwind.css ships as @putdotio/design/tailwind. Compile it as a
// consumer does, without tokens.css, so every custom property in the output is
// Tailwind's. A Tailwind key equal to its token's name (--radius-sm) must never
// be declared there: `--radius-sm: var(--radius-sm)` is a cycle that empties
// the token whenever it wins the cascade.

const THEME_CSS = "dist/css/tailwind.css";
const TOKENS_CSS = "dist/css/tokens.css";
const FLAT_TOKENS = "dist/tokens.flat.json";

// theme(static) emits every Tailwind default, so a default that shares a put.io
// name surfaces too, not only the keys this theme sets.
const FIXTURE_CSS = `@import "tailwindcss" theme(static);\n@import "@putdotio/design/tailwind";\n`;

// The utility each theme namespace drives, and the declaration that carries the value.
const UTILITIES: Array<{ key: RegExp; utility: string; property: string; reads?: (token: string) => string }> = [
  // Spacing utilities multiply the one unit: p-4 is calc(var(--space-1) * 4), the value of --space-4.
  { key: /^--spacing$/, utility: "p-4", property: "padding", reads: (token) => `calc(var(${token}) * 4)` },
  { key: /^--color-(.+)$/, utility: "bg-", property: "background-color" },
  { key: /^--font-weight-(.+)$/, utility: "font-", property: "font-weight" },
  { key: /^--font-(.+)$/, utility: "font-", property: "font-family" },
  { key: /^--text-(.+)$/, utility: "text-", property: "font-size" },
  { key: /^--leading-(.+)$/, utility: "leading-", property: "line-height" },
  { key: /^--tracking-(.+)$/, utility: "tracking-", property: "letter-spacing" },
  { key: /^--radius(?:-(.+))?$/, utility: "rounded-", property: "border-radius" },
  { key: /^--shadow-(.+)$/, utility: "shadow-", property: "--tw-shadow" },
  { key: /^--ease-(.+)$/, utility: "ease-", property: "transition-timing-function" },
  { key: /^--transition-duration-(.+)$/, utility: "duration-", property: "transition-duration" },
];

// Utilities against the token they must resolve to (dark when it differs).
const FIXTURE = [
  { utility: "bg-yellow-solid", property: "background-color", light: "color.brand.yellow" },
  { utility: "text-text-secondary", property: "color", light: "color.neutral.light.textSecondary", dark: "color.neutral.dark.textSecondary" },
  { utility: "rounded-sm", property: "border-radius", light: "radius.sm" },
  { utility: "rounded", property: "border-radius", light: "radius.default" },
  { utility: "rounded-button", property: "border-radius", light: "component.button.primary.radius" },
  { utility: "font-sans", property: "font-family", light: "typography.fontFamily.sans" },
  { utility: "font-bold", property: "font-weight", light: "typography.fontWeight.bold" },
  { utility: "text-lg", property: "font-size", light: "typography.fontSize.lg" },
  { utility: "text-ui", property: "font-size", light: "typography.role.ui" },
  { utility: "leading-tight", property: "line-height", light: "typography.lineHeight.tight" },
  { utility: "tracking-tight", property: "letter-spacing", light: "typography.letterSpacing.tight" },
  { utility: "shadow-sm", property: "--tw-shadow", light: "elevation.sm", dark: "surface.dark.shadowSm" },
  { utility: "shadow-panel", property: "--tw-shadow", light: "component.panel.shadow", dark: "component.panel.shadowDark" },
  { utility: "ease-out", property: "transition-timing-function", light: "motion.easing.out" },
  { utility: "duration-base", property: "transition-duration", light: "motion.duration.base" },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function declarations(body: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const declaration of body.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator < 0) continue;
    result.set(declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim());
  }
  return result;
}

// Custom properties declared by innermost rules whose selector list includes `selector`.
function customProperties(css: string, selector: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const [, selectors, body] of stripComments(css).matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(",").some((value) => value.trim() === selector)) continue;
    for (const [name, value] of declarations(body)) if (name.startsWith("--")) result.set(name, value);
  }
  return result;
}

function utilityRule(css: string, utility: string): Map<string, string> | undefined {
  const escaped = utility.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const body = new RegExp(`\\.${escaped}\\s*\\{([^{}]*)\\}`).exec(css)?.[1];
  return body === undefined ? undefined : declarations(body);
}

// Substitutes var() references, failing on an undeclared name or a cycle.
function resolve(value: string, vars: ReadonlyMap<string, string>, stack: string[] = []): string {
  const start = value.indexOf("var(");
  if (start < 0) return value;
  let depth = 0;
  let end = start + 3;
  for (; end < value.length; end += 1) {
    if (value[end] === "(") depth += 1;
    if (value[end] === ")" && --depth === 0) break;
  }
  const inner = value.slice(start + 4, end);
  const comma = inner.indexOf(",");
  const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma < 0 ? undefined : inner.slice(comma + 1).trim();
  assert(!stack.includes(name), `var() cycle: ${[...stack, name].join(" -> ")}`);
  const declared = vars.get(name);
  assert(declared !== undefined || fallback !== undefined, `${name} is not declared`);
  const replacement = declared !== undefined ? resolve(declared, vars, [...stack, name]) : resolve(fallback ?? "", vars, stack);
  return resolve(`${value.slice(0, start)}${replacement}${value.slice(end + 1)}`, vars, stack);
}

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));

async function loadStylesheet(id: string, base: string) {
  const file = id.startsWith(".") ? path.resolve(base, id) : require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id);
  return { path: file, base: path.dirname(file), content: await readFile(file, "utf8") };
}

const [themeCss, tokensCss, flat] = await Promise.all([
  readFile(path.join(root, THEME_CSS), "utf8"),
  readFile(path.join(root, TOKENS_CSS), "utf8"),
  readFile(path.join(root, FLAT_TOKENS), "utf8").then((json) => JSON.parse(json) as Record<string, { cssName: string; value: string | number }>),
]);

const entries = [...stripComments(themeCss).matchAll(/^\s*(--[\w-]+):\s*var\((--[\w-]+)\);$/gm)].map(([, key, token]) => ({ key, token }));
assert(entries.length > 0, `${THEME_CSS} must map tokens`);

const candidates = entries.map(({ key, token }) => {
  const match = UTILITIES.map((entry) => ({ entry, suffix: entry.key.exec(key) })).find(({ suffix }) => suffix);
  assert(match?.suffix, `${THEME_CSS} ${key} is not in a checked Tailwind namespace`);
  const suffix = match.suffix[1];
  const utility = suffix ? `${match.entry.utility}${suffix}` : match.entry.reads ? match.entry.utility : match.entry.utility.replace(/-$/, "");
  return { key, token, property: match.entry.property, utility, reads: match.entry.reads?.(token) ?? `var(${token})` };
});

const compiler = await compile(FIXTURE_CSS, { base: root, loadStylesheet });
const output = stripComments(compiler.build([...candidates.map(({ utility }) => utility), ...FIXTURE.map(({ utility }) => utility)]));

const putioNames = new Set(Object.values(flat).map((token) => token.cssName));
for (const [, name, value] of output.matchAll(/(--[\w-]+)\s*:\s*([^;{}]*)/g)) {
  assert(!putioNames.has(name), `Tailwind declares put.io custom property ${name}: ${value.trim()}`);
  assert(!value.includes(`var(${name})`) && !value.includes(`var(${name},`), `Tailwind declares self-referencing ${name}: ${value.trim()}`);
}

for (const { key, property, utility, reads } of candidates) {
  const rule = utilityRule(output, utility);
  assert(rule, `${key} must generate .${utility}`);
  assert(rule.get(property) === reads, `.${utility} ${property} must read ${reads}, got ${rule.get(property)}`);
}

// Without the mapping, Tailwind's own 0.25rem unit would follow the root instead of the 4px unit.
const spacing = compiler.build(["p-4"]);
assert(utilityRule(stripComments(spacing), "p-4")?.get("padding") === "calc(var(--space-1) * 4)", ".p-4 must multiply --space-1, the put.io 4px unit");

const tailwindVars = customProperties(output, ":root");
const lightVars = new Map([...tailwindVars, ...customProperties(tokensCss, ":root")]);
const darkVars = new Map([...lightVars, ...customProperties(tokensCss, ".dark")]);
for (const { utility, property, light, dark = light } of FIXTURE) {
  const declared = utilityRule(output, utility)?.get(property);
  assert(declared, `.${utility} must declare ${property}`);
  for (const [mode, vars, tokenName] of [["light", lightVars, light], ["dark", darkVars, dark]] as const) {
    const token = flat[tokenName];
    assert(token, `Missing ${tokenName} token`);
    const actual = resolve(declared, vars);
    assert(actual === String(token.value), `.${utility} ${property} must resolve to ${tokenName} (${token.value}) in ${mode}, got ${actual}`);
  }
}
assert(!utilityRule(output, "text-lg")?.has("line-height"), ".text-lg must leave line height to --lh-* (no Tailwind per-size default)");

console.log("Tailwind theme checks passed");
