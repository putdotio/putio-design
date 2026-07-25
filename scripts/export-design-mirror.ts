import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/*
  Emits the Claude Design project's token mirror from this repo's build:
    tokens.json      — the project's 2-level graph shape, values from dist/tokens.flat.json
    tokens.base.css  — tokens/foundation.css with a mirror header
    tokens.css       — the project's annotated CSS flavor (hex comments + @kind hints)

  Template-driven: the project's current tokens.json provides structure,
  prefixes, descriptions, and alias refs; this repo provides every value.
  Push the output to the design project with DesignSync (see the
  putio-design-handoff skill); nothing here is a package artifact.

  Usage: node scripts/export-design-mirror.ts [templateTokensJson] [outDir]
*/

type JsonObject = Record<string, unknown>;

type MirrorToken = {
  $type?: string;
  $value: string | number;
  $description?: string;
  $extensions?: { "putio.mode"?: { dark?: string | number } };
};

type FlatToken = { cssName: string; mode: "light" | "dark" | "global" | "tv"; value: string | number };

const root = process.cwd();
const templatePath = process.argv[2] ?? "tmp/design-handoff/project/system/tokens.json";
const outDir = process.argv[3] ?? "tmp/design-mirror";

const mirrorNote =
  "GENERATED MIRROR of putdotio/putio-design's token build — do not edit values here. Propose changes in a dated handoffs/ note; they land in the repo's tokens/ and this mirror is refreshed.";

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isToken(value: unknown): value is MirrorToken {
  return isObject(value) && "$value" in value;
}

async function main() {
  const template = JSON.parse(await readFile(path.join(root, templatePath), "utf8")) as JsonObject;
  const flatRaw = JSON.parse(await readFile(path.join(root, "dist/tokens.flat.json"), "utf8")) as Record<string, FlatToken>;
  const foundation = await readFile(path.join(root, "tokens/foundation.css"), "utf8");

  const byCss = new Map<string, Partial<Record<FlatToken["mode"], string | number>>>();
  for (const token of Object.values(flatRaw)) {
    const cssName = token.cssName.replace(/^--/, "");
    const modes = byCss.get(cssName) ?? {};
    modes[token.mode] = token.value;
    byCss.set(cssName, modes);
  }

  const groups = Object.keys(template).filter((key) => !key.startsWith("$"));
  const prefixOf = (group: string): string => {
    const ext = (template[group] as JsonObject).$extensions as JsonObject | undefined;
    return ext && "putio.prefix" in ext ? String(ext["putio.prefix"]) : group;
  };
  const cssNameOf = (group: string, key: string): string => {
    const prefix = prefixOf(group);
    return prefix ? `${prefix}-${key}` : key;
  };

  const warnings: string[] = [];
  const seenCss = new Set<string>();

  for (const group of groups) {
    const groupNode = template[group] as JsonObject;
    for (const key of Object.keys(groupNode).filter((k) => !k.startsWith("$"))) {
      const token = groupNode[key];
      if (!isToken(token)) continue;
      const cssName = cssNameOf(group, key);
      seenCss.add(cssName);
      const ours = byCss.get(cssName);
      if (!ours) {
        warnings.push(`template-only token kept as-is: ${group}.${key} (--${cssName})`);
        continue;
      }
      // mode "tv" tokens have a single value with no light/dark split, so they
      // fill from ours.tv. Without this they pass through with whatever value
      // the template already carried — which silently preserved five wrong
      // tv-channel-art-* values the first time the graph included them.
      const light = ours.light ?? ours.global ?? ours.tv;
      if (light !== undefined && !String(token.$value).includes("{")) {
        token.$value = light;
      }
      const modeExt = token.$extensions?.["putio.mode"];
      if (modeExt && modeExt.dark !== undefined && !String(modeExt.dark).includes("{")) {
        modeExt.dark = ours.dark ?? ours.global ?? modeExt.dark;
      }
    }
  }

  for (const [cssName, modes] of byCss) {
    if (!seenCss.has(cssName) && modes.tv === undefined) {
      warnings.push(`repo token missing from mirror template: --${cssName}`);
    }
  }

  // Resolve {group.key} refs against the merged graph and cross-check every
  // token against the repo's built values — a mismatch means the template's
  // alias structure no longer encodes the repo's truth. Mismatched refs are
  // replaced with the repo literal so the mirror always carries repo values;
  // the warning is the signal to fix the alias upstream.
  // Dark-context refs resolve through the target's dark value when it has one,
  // so a dark alias is never checked against the target's light literal.
  const resolveRef = (value: string, mode: "light" | "dark", depth = 0): string => {
    if (depth > 8) throw new Error(`circular ref chain at ${value}`);
    return value.replace(/\{([^}]+)\}/g, (_match, refPath: string) => {
      const [group, key] = refPath.split(".", 2) as [string, string];
      const node = (template[group] as JsonObject | undefined)?.[key];
      if (!isToken(node)) throw new Error(`unknown ref {${refPath}}`);
      const raw = mode === "dark" ? node.$extensions?.["putio.mode"]?.dark ?? node.$value : node.$value;
      return resolveRef(String(raw), mode, depth + 1);
    });
  };
  for (const group of groups) {
    const groupNode = template[group] as JsonObject;
    for (const key of Object.keys(groupNode).filter((k) => !k.startsWith("$"))) {
      const token = groupNode[key];
      if (!isToken(token)) continue;
      const ours = byCss.get(cssNameOf(group, key));
      const light = ours?.light ?? ours?.global ?? ours?.tv;
      if (light !== undefined && String(token.$value).includes("{") && resolveRef(String(token.$value), "light") !== String(light)) {
        warnings.push(`ref mismatch (replaced with repo literal): ${group}.${key} resolved to ${resolveRef(String(token.$value), "light")}, repo builds ${light}`);
        token.$value = light;
      }
      const modeExt = token.$extensions?.["putio.mode"];
      const dark = ours?.dark ?? ours?.global;
      if (modeExt?.dark !== undefined && dark !== undefined && String(modeExt.dark).includes("{") && resolveRef(String(modeExt.dark), "dark") !== String(dark)) {
        warnings.push(`dark ref mismatch (replaced with repo literal): ${group}.${key} resolved to ${resolveRef(String(modeExt.dark), "dark")}, repo builds ${dark}`);
        modeExt.dark = dark;
      }
    }
  }

  template.$description = mirrorNote;

  // tokens.css in the project's flavor (port of its tools/build-tokens.cjs emit)
  const hslToHex = (value: string): string | null => {
    const match = value.match(/hsla?\(([^)]+)\)/i);
    if (!match) return null;
    const parts = match[1].split(/[,/]/).map((s) => s.trim());
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return `#${rgb.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
  };
  const commentFor = (raw: string): string => (/^hsl\(/i.test(raw) ? ` /* ${hslToHex(raw) ?? ""} */` : "");
  const kindFor = (name: string): string =>
    /^(lh|fw)-/.test(name) ? " /* @kind font */" : /^(ease|dur|z|bp)-/.test(name) ? " /* @kind other */" : "";
  const asVars = (value: string): string => value.replace(/\{([^}]+)\}/g, (_m, refPath: string) => {
    const [group, key] = refPath.split(".", 2) as [string, string];
    return `var(--${cssNameOf(group, key)})`;
  });

  let css = `/* ============================================================\n   put.io — tokens.css  (${mirrorNote.split(" — ")[0]})\n   ${mirrorNote.split(" — ")[1]}\n   Brand constant: yellow #FDCE45 in both modes.\n   ============================================================ */\n\n:root {\n`;
  for (const group of groups) {
    const groupNode = template[group] as JsonObject;
    const desc = typeof groupNode.$description === "string" ? ` — ${groupNode.$description}` : "";
    css += `  /* === ${group}${desc} === */\n`;
    for (const key of Object.keys(groupNode).filter((k) => !k.startsWith("$"))) {
      const token = groupNode[key];
      if (!isToken(token)) continue;
      const name = cssNameOf(group, key);
      const raw = String(token.$value);
      css += `  --${name}: ${asVars(raw)};${commentFor(raw)}${kindFor(name)}\n`;
    }
    css += "\n";
  }
  css += "}\n\n.dark {\n";
  for (const group of groups) {
    const groupNode = template[group] as JsonObject;
    const darkKeys = Object.keys(groupNode).filter((k) => {
      const token = !k.startsWith("$") ? groupNode[k] : undefined;
      return isToken(token) && token.$extensions?.["putio.mode"]?.dark !== undefined;
    });
    if (darkKeys.length === 0) continue;
    css += `  /* ${group} */\n`;
    for (const key of darkKeys) {
      const token = groupNode[key] as MirrorToken;
      const dark = String(token.$extensions?.["putio.mode"]?.dark);
      css += `  --${cssNameOf(group, key)}: ${asVars(dark)};${commentFor(dark)}\n`;
    }
    css += "\n";
  }
  css += "}\n";

  const baseHeader = `/* ============================================================\n   put.io — tokens.base.css\n   Static (non-token) layer, mirrored from putdotio/putio-design's\n   tokens/foundation.css. ${mirrorNote.split(" — ")[1]}\n   ============================================================ */\n\n`;
  const base = baseHeader + foundation;

  await mkdir(path.join(root, outDir), { recursive: true });
  await writeFile(path.join(root, outDir, "tokens.json"), `${JSON.stringify(template, null, 2)}\n`);
  await writeFile(path.join(root, outDir, "tokens.base.css"), base);
  await writeFile(path.join(root, outDir, "tokens.css"), `${css}\n${base}`);

  const yellow = ((template.yellow as JsonObject)?.solid as MirrorToken | undefined)?.$value;
  if (yellow !== "hsl(44.7, 97.9%, 63.1%)") throw new Error(`brand yellow mismatch in mirror: ${String(yellow)}`);

  for (const warning of warnings) console.warn(`warn: ${warning}`);
  console.log(`Wrote ${outDir}/tokens.json, tokens.css, tokens.base.css (${warnings.length} warnings)`);
}

await main();
