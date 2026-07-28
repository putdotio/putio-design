import { readFile } from "node:fs/promises";
import process from "node:process";

/*
  Keeps DESIGN.md's token citations honest against the build.

  DESIGN.md is the published contract — consumers install it as
  `@putdotio/design/design.md` — so a name written there is a promise. Two ways
  that promise can break, and the file must not make either:

    1. Citing `--foo` when the token build emits no such custom property. A
       reader writes `var(--foo)` and gets nothing.
    2. Citing a graph path like `tv.z.overlay` that does not exist in the DTCG
       artifacts, which platform adapters read.

  The distinction matters because the two are not interchangeable. The whole `tv`
  group is carried as data for platform adapters and deliberately never emitted
  into web CSS, so those tokens must be cited by graph path. Writing them in
  CSS-variable syntax is what previously made a correct doc read like drift.
*/

const DESIGN_DOC = "DESIGN.md";
const TOKENS_CSS = "dist/css/tokens.css";
const TOKENS_FLAT = "dist/tokens.flat.json";

const [doc, tokensCss, flatRaw] = await Promise.all([
  readFile(DESIGN_DOC, "utf8"),
  readFile(TOKENS_CSS, "utf8"),
  readFile(TOKENS_FLAT, "utf8"),
]);

const flat = JSON.parse(flatRaw) as Record<string, { cssName?: string }>;

const emitted = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
const graphPaths = new Set(Object.keys(flat));
const namespaces = new Set([...graphPaths].map((path) => path.split(".")[0]));

const lineOf = (index: number) => doc.slice(0, index).split("\n").length;

/* Only inline-code spans count as citations. Prose that merely mentions a name,
   and fenced examples, are not contracts. */
const codeSpans = [...doc.matchAll(/`([^`\n]+)`/g)].map((m) => ({ text: m[1], line: lineOf(m.index) }));

const failures: string[] = [];

for (const { text, line } of codeSpans) {
  /* A bare custom property. Patterns like `--z-*` or `--button-height(-md)` are
     shorthand for a family, not a single name, so they are skipped. */
  if (/^--[a-z0-9-]+$/.test(text)) {
    if (!emitted.has(text)) {
      const asPath = [...graphPaths].find((path) => flat[path].cssName === text);
      const hint = asPath
        ? `exists in the graph as \`${asPath}\` but is not emitted to CSS — cite the graph path instead`
        : `is not emitted as a custom property by the token build`;
      failures.push(`${DESIGN_DOC}:${line} cites \`${text}\`, which ${hint}`);
    }
    continue;
  }

  /* A graph path, recognised only when its first segment is a real namespace, so
     prose like `app.put.io` or `tokens.json` is left alone. Trailing `.*` marks a
     family rather than one token. */
  if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9*]+)+$/.test(text) && namespaces.has(text.split(".")[0])) {
    if (text.endsWith(".*") || text.endsWith("*")) continue;
    if (!graphPaths.has(text)) {
      failures.push(`${DESIGN_DOC}:${line} cites graph path \`${text}\` but ${TOKENS_FLAT} has no such token`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(
    `\n${DESIGN_DOC} promises token names the build does not provide. ` +
      `Emit them, or correct the citation. The \`tv\` group is data-only: cite it as tv.x.y, never --tv-x-y.`,
  );
  process.exitCode = 1;
} else {
  const cssCites = codeSpans.filter((s) => /^--[a-z0-9-]+$/.test(s.text)).length;
  const pathCites = codeSpans.filter(
    (s) => /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9*]+)+$/.test(s.text) && namespaces.has(s.text.split(".")[0]),
  ).length;
  console.log(`${DESIGN_DOC} token citations resolve: ${cssCites} custom properties, ${pathCites} graph paths`);
}
