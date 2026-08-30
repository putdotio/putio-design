import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { convertTokenData } from "style-dictionary/utils";

type JsonObject = Record<string, unknown>;

type TokenNode = {
  $value: string | number;
  $type?: string;
  $description?: string;
  $extensions?: {
    putio?: {
      cssName?: string;
      mode?: "light" | "dark" | "global" | "tv";
      category?: string;
      figma?: boolean;
      basis?: "viewport-width" | "viewport-height";
      deprecated?: boolean;
    };
  };
};

type FlatToken = {
  name: string;
  path: string[];
  value: string | number;
  resolvedValue: string | number;
  type: string;
  description?: string;
  cssName: string;
  mode: "light" | "dark" | "global" | "tv";
  category?: string;
  figma: boolean;
  basis?: "viewport-width" | "viewport-height";
  deprecated?: boolean;
};

const root = process.cwd();
const allowedTokenTypes = new Set(["color", "cubicBezier", "dimension", "fontFamily", "fontWeight", "number", "duration", "string"]);
const allowedModes = new Set(["light", "dark", "global", "tv"]);
const generatedHeader = `/* ============================================================
   put.io design tokens
   Do not edit directly. Generated from DTCG token JSON in tokens/.

   Brand constant: Yellow #FDCE45 in both light and dark modes.
   Canonical source: DTCG-compatible JSON in tokens/
   ============================================================ */`;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function mergeJson(target: JsonObject, source: JsonObject, file: string): JsonObject {
  for (const [key, value] of Object.entries(source)) {
    if (key in target && isObject(target[key]) && isObject(value) && !("$value" in target[key]) && !("$value" in value)) {
      mergeJson(target[key] as JsonObject, value, file);
      continue;
    }
    if (key in target && key !== "$description") {
      throw new Error(`Duplicate top-level token key "${key}" while merging ${file}`);
    }
    target[key] = value;
  }
  return target;
}

function asToken(value: unknown): TokenNode | null {
  if (!isObject(value) || !("$value" in value)) return null;
  const token = value as TokenNode;
  if (typeof token.$value !== "string" && typeof token.$value !== "number") return null;
  return token;
}

function toCssName(parts: string[]): string {
  return parts
    .map((part) =>
      part
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase(),
    )
    .filter(Boolean)
    .join("-");
}

function flattenTokens(node: unknown, parts: string[] = []): FlatToken[] {
  const token = asToken(node);
  if (token) {
    const putio = token.$extensions?.putio;
    if (!token.$type) {
      throw new Error(`Token ${parts.join(".")} is missing $type`);
    }
    if (!allowedTokenTypes.has(token.$type)) {
      throw new Error(`Token ${parts.join(".")} uses unsupported $type "${token.$type}"`);
    }
    const cssName = putio?.cssName ?? toCssName(parts);
    const mode = putio?.mode ?? "global";
    if (!allowedModes.has(mode)) {
      throw new Error(`Token ${parts.join(".")} uses unsupported putio mode "${mode}"`);
    }
    return [
      {
        name: parts.join("."),
        path: parts,
        value: token.$value,
        resolvedValue: token.$value,
        type: token.$type,
        description: token.$description,
        cssName,
        mode,
        category: putio?.category,
        figma: putio?.figma ?? (mode !== "dark" && mode !== "tv"),
        basis: putio?.basis,
        deprecated: putio?.deprecated,
      },
    ];
  }

  if (!isObject(node)) return [];
  return Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith("$")) return [];
    return flattenTokens(value, [...parts, key]);
  });
}

function resolveReferences(tokens: FlatToken[]): FlatToken[] {
  const byName = new Map(tokens.map((token) => [token.name, token]));
  const referencePattern = /\{([^}]+)\}/g;

  function resolveValue(value: string | number, stack: string[]): string | number {
    if (typeof value !== "string") return value;
    return value.replace(referencePattern, (_match, referenceName: string) => {
      if (stack.includes(referenceName)) {
        throw new Error(`Circular token reference: ${[...stack, referenceName].join(" -> ")}`);
      }
      const ref = byName.get(referenceName);
      if (!ref) {
        throw new Error(`Unknown token reference {${referenceName}}`);
      }
      return String(resolveValue(ref.value, [...stack, referenceName]));
    });
  }

  return tokens.map((token) => ({
    ...token,
    resolvedValue: resolveValue(token.value, [token.name]),
  }));
}

function formatCssValue(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}

function cssBlock(selector: string, tokens: FlatToken[]): string {
  const lines = tokens.map((token) => `  --${token.cssName}: ${formatCssValue(token.resolvedValue)};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function cssForTokens(tokens: FlatToken[], foundationCss: string): string {
  const global = tokens.filter((token) => token.mode === "global");
  const light = tokens.filter((token) => token.mode === "light");
  const dark = tokens.filter((token) => token.mode === "dark");

  const rootTokens = [...light, ...global];
  const parts = [
    generatedHeader,
    "",
    "/* -- Light (default) ------------------------------------------------ */",
    cssBlock(":root", rootTokens),
    "",
    "/* -- Dark (.dark) --------------------------------------------------- */",
    cssBlock(".dark", dark),
    "",
    foundationCss.trim(),
    "",
  ];

  return parts.join("\n");
}

function nestedFlatJson(tokens: FlatToken[]): JsonObject {
  return Object.fromEntries(
    tokens.map((token) => [
      token.name,
      {
        cssName: `--${token.cssName}`,
        type: token.type,
        mode: token.mode,
        value: token.resolvedValue,
        originalValue: token.value,
        description: token.description,
        ...(token.basis ? { basis: token.basis } : {}),
        ...(token.deprecated ? { deprecated: true } : {}),
      },
    ]),
  );
}

function javascriptForTokens(tokens: FlatToken[]): string {
  return `// Do not edit directly. Generated from tokens/**/*.tokens.json.\n\nexport const tokens = ${JSON.stringify(nestedFlatJson(tokens), null, 2)};\n`;
}

function declarationForTokens(tokens: FlatToken[]): string {
  const names = tokens.map((token) => JSON.stringify(token.name)).join(" | ");
  return `// Do not edit directly. Generated from tokens/**/*.tokens.json.\n\nexport type PutioTokenName = ${names};\n\nexport type PutioToken = {\n  readonly cssName: string;\n  readonly type: string;\n  readonly mode: \"light\" | \"dark\" | \"global\" | \"tv\";\n  readonly value: string | number;\n  readonly originalValue: string | number;\n  readonly description?: string;\n  readonly basis?: \"viewport-width\" | \"viewport-height\";\n  readonly deprecated?: boolean;\n};\n\nexport declare const tokens: Readonly<Record<PutioTokenName, PutioToken>>;\n`;
}

function figmaTokens(tokens: FlatToken[]): JsonObject {
  const figmaSafe = tokens.filter((token) => token.figma && ["color", "dimension", "fontFamily", "fontWeight", "number", "duration"].includes(token.type));

  const rootObject: JsonObject = {};
  for (const token of figmaSafe) {
    let cursor = rootObject;
    for (const part of token.path.slice(0, -1)) {
      const next = cursor[part];
      if (!isObject(next)) {
        cursor[part] = {};
      }
      cursor = cursor[part] as JsonObject;
    }
    cursor[token.path.at(-1) ?? token.name] = {
      $type: token.type,
      $value: token.resolvedValue,
      ...(token.description ? { $description: token.description } : {}),
    };
  }
  return rootObject;
}

async function loadDictionary(): Promise<{ source: JsonObject; tokens: FlatToken[] }> {
  const tokenFiles = (await walk(path.join(root, "tokens")))
    .filter((file) => file.endsWith(".tokens.json"))
    .sort();
  const merged = {};
  for (const file of tokenFiles) {
    const json = JSON.parse(await readFile(file, "utf8")) as JsonObject;
    mergeJson(merged, json, path.relative(root, file));
  }

  const source = convertTokenData(merged, { output: "object", usesDtcg: true }) as JsonObject;
  const tokens = resolveReferences(flattenTokens(source));
  return { source, tokens };
}

async function main() {
  const { source, tokens } = await loadDictionary();
  const foundationCss = await readFile(path.join(root, "tokens/foundation.css"), "utf8");
  const css = cssForTokens(tokens, foundationCss);

  await mkdir(path.join(root, "dist/css"), { recursive: true });
  await mkdir(path.join(root, "dist/figma"), { recursive: true });
  await mkdir(path.join(root, "system"), { recursive: true });

  await writeFile(path.join(root, "dist/css/tokens.css"), css);
  await writeFile(path.join(root, "system/tokens.css"), css);
  await writeFile(path.join(root, "dist/tokens.dtcg.json"), `${JSON.stringify(source, null, 2)}\n`);
  await writeFile(path.join(root, "dist/tokens.flat.json"), `${JSON.stringify(nestedFlatJson(tokens), null, 2)}\n`);
  await writeFile(path.join(root, "dist/tokens.js"), javascriptForTokens(tokens));
  await writeFile(path.join(root, "dist/tokens.d.ts"), declarationForTokens(tokens));
  await writeFile(path.join(root, "dist/figma/putio.tokens.json"), `${JSON.stringify(figmaTokens(tokens), null, 2)}\n`);

  console.log(`Built ${tokens.length} tokens into dist/ and system/tokens.css`);
}

await main();
