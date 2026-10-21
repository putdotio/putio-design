import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

// Builds one claude.ai Design System artifact per device family into
// artifact/out/<family>/project/: tokens.json from dist/tokens.flat.json,
// bundle.css from the guide CSS, and a card per system/preview page of that
// family. artifact/shared/ (cover, asset notes) and artifact/<family>/README.md
// are hand-written; artifact/notes.json maps each system/assets file to its
// upload in each artifact. Each artifact's index (project/design-system.json)
// stays with the artifact.

type FlatToken = {
  cssName: string;
  type: string;
  mode: "light" | "dark" | "global" | "tv";
  value: string | number;
  description?: string;
};
type Entry = { name: string; value: string | Record<string, string>; usage: string };
type Notes = { images: Record<string, Record<string, string>> };
type Page = { path: string; text: string; platform?: string };

const root = process.cwd();
const out = path.join(root, "artifact/out");
const repo = "https://github.com/putdotio/putio-design/blob/main";

/** A card lands in the artifact whose platforms include its filename prefix ("" = foundations). */
const ARTIFACTS: Record<string, { word: string; platforms: ReadonlySet<string> }> = {
  core: { word: "design", platforms: new Set([""]) },
};
const PHOSPHOR = ["regular", "fill", "bold", "duotone", "thin"] as const;

const read = (rel: string): string => readFileSync(path.join(root, rel), "utf8");
const pages: Page[] = [];
const write = (rel: string, text: string, platform?: string): void => {
  pages.push({ path: rel, text, platform });
};

const notes = JSON.parse(read("artifact/notes.json")) as Notes;
const flat = Object.values(JSON.parse(read("dist/tokens.flat.json")) as Record<string, FlatToken>);

rmSync(out, { recursive: true, force: true });

// ---- tokens.json

// The artifact reads plain colour literals only: no var(), color-mix() or names.
const COLOR = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([^()]*\))$/i;
const SHADOW = /^[a-z0-9 .,%#()-]+$/i;
const unmoded = (s = ""): string => s.replace(/ in (light|dark) mode\.$/, ".");

/** First match wins. Motion and anything unlisted stays in bundle.css. */
const FAMILIES: ReadonlyArray<readonly [string, RegExp]> = [
  ["fontSize", /^(fs-|tv-text-)/],
  ["lineHeight", /^lh-/],
  ["fontWeight", /^(fw-|tv-fw-)/],
  ["letterSpacing", /^tracking-/],
  ["spacing", /^(space-|tv-space-)/],
  ["radius", /radius/],
  ["zIndex", /^(z-|tv-z-)/],
  ["breakpoint", /^bp-/],
  ["size", /./],
];

const colors = new Map<string, Entry>();
const shadows = new Map<string, Entry>();
const lists: Record<string, Entry[]> = {};
const families: Record<string, string> = {};
const owned = new Set<string>();
const skipped: string[] = [];

for (const t of flat) {
  const name = t.cssName.replace(/^--/, "");
  const value = String(t.value);
  const usage = unmoded(t.description);
  if (t.type === "fontFamily") {
    families[name.replace(/^font-/, "")] = value;
    owned.add(name);
  } else if (t.type === "color" || t.type === "string") {
    const shadow = t.type === "string";
    if (!(shadow ? SHADOW.test(value) && /\dpx/.test(value) : COLOR.test(value))) {
      skipped.push(`--${name}`);
      continue;
    }
    const map = shadow ? shadows : colors;
    const entry: Entry = map.get(name) ?? { name, value: {}, usage: "" };
    // A global value sits in :root, so beside a dark override it is the light value.
    const modes: Record<string, string> =
      typeof entry.value === "string" ? { light: entry.value } : entry.value;
    if (t.mode === "light" || t.mode === "dark") modes[t.mode] = value;
    else if (modes.dark) modes.light = value;
    entry.value = t.mode !== "light" && t.mode !== "dark" && !modes.dark ? value : modes;
    if (!entry.usage) entry.usage = usage;
    map.set(name, entry);
    if (t.mode !== "tv") owned.add(name);
  } else if (["dimension", "number", "fontWeight"].includes(t.type)) {
    const family = FAMILIES.find(([, pattern]) => pattern.test(name))![0];
    (lists[family] ??= []).push({ name, value, usage });
    if (t.mode !== "tv") owned.add(name);
  }
}

for (const [family, list] of Object.entries(lists)) {
  if (list.length > 60)
    throw new Error(`tokens.json ${family}: ${list.length} tokens, the artifact holds 60`);
}

// A light/dark pair missing one side inherits the first theme's value, which
// would paint a light value in dark mode; keep such a token in bundle.css.
for (const map of [colors, shadows]) {
  for (const [name, entry] of map) {
    if (typeof entry.value === "string") continue;
    if (!entry.value.light || !entry.value.dark) {
      map.delete(name);
      owned.delete(name);
      skipped.push(`--${name}`);
    }
  }
}

const fontStacks: Record<string, string> = {
  sans: '"GT America", "Inter", sans-serif',
  display: '"GT America", "Inter", sans-serif',
  mono: '"Berkeley Mono", "JetBrains Mono", monospace',
};
for (const key of Object.keys(families)) {
  if (!fontStacks[key])
    throw new Error(`--font-${key}: no preview substitute in build-artifact.ts`);
}

// Semantic text styles: the foundation rules in system/tokens.css with their var() resolved.
const tokenValue = new Map(
  flat.filter((t) => t.mode !== "dark").map((t) => [t.cssName.replace(/^--/, ""), String(t.value)]),
);
const resolve = (v: string): string =>
  v.replace(/var\(--([a-z0-9-]+)\)/g, (_, n: string) => tokenValue.get(n) ?? `var(--${n})`).trim();
const siteCss = read("system/tokens.css");
const STYLES: ReadonlyArray<readonly [string, string, string]> = [
  ["Headings", "display", ".h-display, h1.display"],
  ["Headings", "h1", "h1, .h1"],
  ["Headings", "h2", "h2, .h2"],
  ["Headings", "h3", "h3, .h3"],
  ["Headings", "h4", "h4, .h4"],
  ["Text", "subheading", ".subheading"],
  ["Text", "lead", ".lead"],
  ["Text", "body", "p, .body"],
  ["Text", "label", ".label"],
  ["Text", "button-text", ".button-text"],
  ["Text", "caption", "small, .caption"],
];
const groups: Array<{
  name: string;
  family: string;
  styles: Array<Record<string, string | number>>;
}> = [];
for (const [group, name, selector] of STYLES) {
  const body = new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`, "m")
    .exec(siteCss)?.[1]
    ?.replace(/\/\*[\s\S]*?\*\//g, "");
  if (!body) throw new Error(`system/tokens.css: no "${selector}" rule`);
  const raw = (prop: string): string | undefined =>
    new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+);`).exec(body)?.[1].trim();
  const decl = (prop: string): string | undefined => {
    const value = raw(prop);
    return value === undefined ? undefined : resolve(value);
  };
  const style: Record<string, string | number> = {
    name,
    fontSize: decl("font-size")!,
    usage: `\`${selector}\``,
  };
  const lineHeight = decl("line-height") ?? tokenValue.get("lh-normal");
  if (lineHeight) style.lineHeight = lineHeight;
  style.fontWeight = Number(decl("font-weight") ?? tokenValue.get("fw-regular"));
  const tracking = decl("letter-spacing");
  if (tracking) style.letterSpacing = tracking;
  const family = raw("font-family")?.includes("--font-display") ? "display" : "sans";
  let g = groups.find((x) => x.name === group);
  if (!g) groups.push((g = { name: group, family, styles: [] }));
  if (family !== g.family) style.family = family;
  g.styles.push(style);
}

const tokens = {
  name: "put.io design",
  version: 1,
  meta: { source: "github", repo: "putdotio/putio-design", paths: { tokens: ["tokens/"] } },
  color: {
    themes: [
      { id: "light", name: "Light" },
      { id: "dark", name: "Dark" },
    ],
    tokens: [...colors.values()],
  },
  type: { fonts: [], families: fontStacks, groups },
  shadow: { tokens: [...shadows.values()] },
  ...Object.fromEntries(Object.entries(lists).map(([family, list]) => [family, { tokens: list }])),
};
write("tokens.json", `${JSON.stringify(tokens, null, 2)}\n`);

// ---- bundle.css: the guide CSS minus the custom properties tokens.json owns

const unowned = siteCss
  .split("\n")
  .filter((line) => !owned.has(/^\s*--([a-z0-9-]+):/.exec(line)?.[1] ?? ""))
  .join("\n")
  .replace(/^\.dark \{/m, '.dark, [data-theme="dark"] {');
const bundle = [
  "/* Previews can't load the licensed faces from static.put.io; Inter and JetBrains Mono stand in. */",
  '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap");',
  unowned.trim(),
  read("system/components.css").trim(),
  read("system/tv.css").trim(),
].join("\n\n");
write("components/bundle.css", `${bundle}\n`);
// The page runs no preview without a bundle. The package ships CSS only, so the
// namespace stays empty and every card is plain markup.
write(
  "components/bundle.js",
  '/* @ds-bundle: {"format":4,"namespace":"Putio","components":[]} */\nwindow.Putio = {};\n',
);

// ---- preview cards

const PLATFORMS: Record<string, readonly [string, string]> = {
  web: ["Web", "web"],
  mobile: ["Mobile", "apple"],
  ios: ["iOS", "apple"],
  watchos: ["watchOS", "apple"],
  tvos: ["tvOS", "apple"],
  android: ["Android", "android"],
  androidtv: ["Android TV", "android"],
  tv: ["TV", "tv-generic"],
  roku: ["Roku", "roku"],
};
const SECTIONS: Record<string, string> = {
  f: "foundations",
  c: "components",
  e: "elements",
  p: "patterns",
  s: "screens",
};
const pascal = (slug: string): string =>
  slug.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

// Card heights follow the guide's embeds; element cards are a fixed 1120×580.
const guide = read("system/design-system.html");
const EMBED: Record<string, number> = { compact: 220, tall: 520, featured: 660 };
const heights = new Map<string, number>();
for (const m of guide.matchAll(
  /class="panel embed ?([a-z]*)"(?: style="--preview-height: (\d+)px;")?.*?data-pid="([a-z0-9-]+)"/g,
)) {
  heights.set(m[3], Number(m[2] ?? EMBED[m[1]] ?? 360));
}

const previewDir = path.join(root, "system/preview");
const cards = readdirSync(previewDir)
  .filter((f) => f.endsWith(".html") && !f.startsWith("_"))
  .sort();
const parsed = cards.map((file) => {
  const slug = file.replace(/\.html$/, "");
  const m = /^(?:([a-z]+)-([a-z])(\d+[a-z]?)-|(\d+[a-z]?)-)(.+)$/.exec(slug);
  if (!m || (m[1] && (!PLATFORMS[m[1]] || !SECTIONS[m[2]])))
    throw new Error(`system/preview/${file}: name does not follow system/README.md`);
  const [, platform, section, num, , subject] = m;
  return { file, slug, platform, section, num, subject };
});
const names = new Map<string, number>();
for (const c of parsed) {
  const n = pascal(c.platform ? `${c.platform}-${c.subject}` : c.subject);
  names.set(n, (names.get(n) ?? 0) + 1);
}

const escapeAttr = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const themeSync = (lock: string | undefined): string =>
  // The frame sets <html data-theme>; the guide's CSS keys dark mode off .dark.
  `<script>(function(){var r=document.documentElement,lock=${lock ? `"${lock}"` : "null"};function s(){if(lock&&r.dataset.theme!==lock)r.dataset.theme=lock;r.classList.toggle("dark",(lock||r.dataset.theme)==="dark")}s();new MutationObserver(s).observe(r,{attributes:true,attributeFilter:["data-theme"]})})();</script>`;

for (const c of parsed) {
  let component = pascal(c.platform ? `${c.platform}-${c.subject}` : c.subject);
  if (names.get(component)! > 1)
    component = pascal(`${c.platform}-${c.section}${c.num}-${c.subject}`);
  const html = read(`system/preview/${c.file}`);
  const title = /<title>put\.io · ([^<]+)<\/title>/.exec(html)?.[1] ?? c.subject.replace(/-/g, " ");
  const lock = /data-theme-lock="(light|dark)"/.exec(/<html\b[^>]*>/.exec(html)?.[0] ?? "")?.[1];
  const group = c.platform ? `${PLATFORMS[c.platform][0]} ${SECTIONS[c.section]}` : "Foundations";
  const height = c.section === "e" ? 580 : (heights.get(c.slug) ?? 360);
  // TV artboards (`.el.tv` cards, inline canvases) are drawn 1:1; lay the card
  // out that wide and let the page scale it down.
  const declared = [...html.matchAll(/(?:min-)?width:\s*(\d{4})px/g)].map((m) =>
    Math.min(1920, Number(m[1])),
  );
  const canvas = html.includes('class="el tv') ? 1920 : Math.max(1120, ...declared);

  const body = html
    .replace(/<script>\s*\/\* Theme bootstrap[\s\S]*?<\/script>\n?/, "")
    .replace(/<head>\n?/, `<head>\n${themeSync(lock)}\n`)
    .replace(
      /<link rel="stylesheet" href="(https:\/\/static\.put\.io\/fonts\/[^"]+|\.\.\/(tokens|components|tv)\.css)">\n?/g,
      "",
    )
    .replace(/<script src="\.\/_resize\.js" defer><\/script>\n?/, "")
    .replace(/(href|src)="\.\/(_[a-z-]+\.(css|js))"/g, '$1="../../preview-kit/$2"')
    // The artifact loads stylesheets and fonts only from its own files, so Phosphor ships in the kit.
    .replace(
      '<script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>',
      '<link rel="stylesheet" href="../../preview-kit/phosphor.css">',
    );
  if (
    !body.includes("new MutationObserver(s)") ||
    body.includes('src="https://unpkg.com/@phosphor-icons') ||
    /"(https:\/\/static\.put\.io[^"]*|\.\/_resize\.js|\.\.\/(tokens|components|tv)\.css)"/.test(
      body,
    )
  ) {
    throw new Error(
      `system/preview/${c.file}: head no longer matches what build-artifact.ts rewrites`,
    );
  }
  write(
    `components/${component}/preview.html`,
    `<!-- @dsCard group="${group}" width=${canvas} height=${height} subtitle="${escapeAttr(title)}" -->\n${body}`,
    c.platform ?? "",
  );

  const doc = c.platform ? `platforms/${PLATFORMS[c.platform][1]}/DESIGN.md` : "DESIGN.md";
  write(
    `components/${component}/README.md`,
    `# ${component}\n\n${/^[a-z][A-Z]/.test(title) ? title : title[0].toUpperCase() + title.slice(1)}.\n\n- Rules: [${doc}](${repo}/${doc})\n- Source: [${c.file}](${repo}/system/preview/${c.file})\n`,
    c.platform ?? "",
  );
}

for (const file of readdirSync(previewDir).filter((f) => f.startsWith("_") && f !== "_resize.js")) {
  write(`preview-kit/${file}`, read(`system/preview/${file}`));
}
const phosphorSrc = path.join(root, "node_modules/@phosphor-icons/web/src");
write(
  "preview-kit/phosphor.css",
  PHOSPHOR.map((weight) =>
    readFileSync(path.join(phosphorSrc, weight, "style.css"), "utf8").replace(
      /src:\s*url\("\.\/([^"]+)\.woff2"\)[^;]*;/,
      'src: url("./phosphor/$1.woff2") format("woff2");',
    ),
  ).join("\n"),
);

// ---- one project/ per artifact, and its publish list

const assets = readdirSync(path.join(root, "system/assets"));
let total = 0;
for (const [id, { word, platforms }] of Object.entries(ARTIFACTS)) {
  const dir = path.join(out, id);
  const project = path.join(dir, "project");
  const images = notes.images[id] ?? {};
  for (const file of assets) {
    if (!images[file])
      throw new Error(`artifact/notes.json images.${id}: no upload for system/assets/${file}`);
  }
  const emit = (rel: string, text: string): void => {
    const file = path.join(project, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  };

  cpSync(path.join(root, "artifact/shared"), project, { recursive: true });
  emit("README.md", read(`artifact/${id}/README.md`));
  emit(
    "components/Cover/preview.html",
    read("artifact/shared/components/Cover/preview.html").replaceAll("{{word}}", word),
  );
  for (const page of pages) {
    if (page.platform !== undefined && !platforms.has(page.platform)) continue;
    const text = page.text.replace(/\.\.\/assets\/([A-Za-z0-9._-]+)/g, (_, file: string) => {
      if (!images[file]) throw new Error(`${page.path}: no system/assets/${file}`);
      return images[file];
    });
    emit(
      page.path,
      page.path === "tokens.json"
        ? text.replace('"name": "put.io design"', `"name": "put.io ${word}"`)
        : text,
    );
  }
  for (const weight of PHOSPHOR) {
    for (const file of readdirSync(path.join(phosphorSrc, weight)).filter((f) =>
      f.endsWith(".woff2"),
    )) {
      mkdirSync(path.join(project, "preview-kit/phosphor"), { recursive: true });
      cpSync(
        path.join(phosphorSrc, weight, file),
        path.join(project, "preview-kit/phosphor", file),
      );
    }
  }

  const files: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(path.relative(dir, full));
    }
  };
  walk(project);
  files.sort();
  writeFileSync(path.join(dir, "files.json"), `${JSON.stringify(files, null, 2)}\n`);
  total += files.length;
}
console.log(
  `artifact: ${Object.keys(ARTIFACTS).length} artifacts, ${total} files, ${colors.size} colors, ${cards.length} cards → artifact/out` +
    (skipped.length > 0 ? `; kept in bundle.css: ${skipped.join(", ")}` : ""),
);
