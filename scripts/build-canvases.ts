import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

// Builds the put.io web, TV and mobile canvases (claude.ai Design artifacts)
// into artifact/out/<canvas>/project/: one .dc.html artboard per screen in
// system/preview, the guide CSS as support files, and canvas.json with a note
// per screen. artifact/notes.json maps each image and Phosphor font to its
// upload in each canvas. PUTIO_DESIGN_ARTIFACT_URL, when set, installs the
// put.io design system on every canvas; the URL stays out of the repo.

type Notes = {
  images: Record<string, Record<string, string>>;
  fonts: Record<string, Record<string, string>>;
  canvases: Record<string, { createdAt: string }>;
};
type Frame = { w: number; h: number; page?: boolean };
type Canvas = {
  title: string;
  rows: ReadonlyArray<readonly [prefix: string, title: string]>;
  /** The screens in one card: each one's markup and size. */
  frames: (html: string) => Array<{ markup: string; frame: Frame }>;
  css: string;
};

const root = process.cwd();
const read = (rel: string): string => readFileSync(path.join(root, rel), "utf8");
const notes = JSON.parse(read("artifact/notes.json")) as Notes;
const designSystem = process.env.PUTIO_DESIGN_ARTIFACT_URL;
const previewDir = path.join(root, "system/preview");

const VOID = new Set(["area", "br", "col", "hr", "img", "input", "link", "meta", "source", "wbr"]);

/** The element whose start tag begins at `start`, through its matching close tag. */
function element(html: string, start: number): string {
  const re = /<(\/?)([a-z][a-z0-9-]*)\b[^>]*?(\/?)>/g;
  re.lastIndex = start;
  let depth = 0;
  for (let m; (m = re.exec(html));) {
    if (VOID.has(m[2]) || m[3]) {
      if (depth === 0) return m[0];
      continue;
    }
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(start, re.lastIndex);
  }
  throw new Error(`unbalanced element at ${start}`);
}

/** Top-level child elements of an element's inner HTML. */
function children(inner: string): string[] {
  const out: string[] = [];
  for (let p = 0; ;) {
    const i = inner.indexOf("<", p);
    if (i < 0 || inner[i + 1] === "/") return out;
    if (inner.startsWith("<!--", i)) {
      p = inner.indexOf("-->", i) + 3;
      continue;
    }
    const el = element(inner, i);
    out.push(el);
    p = i + el.length;
  }
}
const innerOf = (el: string): string => el.slice(el.indexOf(">") + 1, el.lastIndexOf("</"));
const classOf = (el: string): string[] =>
  (/^<[^>]*\bclass="([^"]*)"/.exec(el)?.[1] ?? "").split(/\s+/);

const text = (s: string): string =>
  s
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:)])/g, "$1")
    .trim();
const firstSentence = (s: string): string => /^.*?[.!?](\s|$)/.exec(s)?.[0].trim() ?? s;
const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Card heights in the guide, for web pages whose height only a browser knows.
const heights = new Map<string, number>();
for (const m of read("system/design-system.html").matchAll(
  /class="panel embed ?([a-z]*)"(?: style="--preview-height: (\d+)px;")?.*?data-pid="([a-z0-9-]+)"/g,
)) {
  heights.set(m[3], Number(m[2] ?? { compact: 220, tall: 520, featured: 660 }[m[1]] ?? 360));
}

/** Every frame in the card whose opening tag matches `pattern`, sized by `size`. */
const deviceFrames =
  (pattern: RegExp, size: (classes: string) => Frame) =>
  (html: string): Array<{ markup: string; frame: Frame }> =>
    [...html.matchAll(pattern)].map((m) => ({ markup: element(html, m.index), frame: size(m[1]) }));

const DEVICE: Record<string, Frame> = {
  iphone: { w: 393, h: 852 },
  ipad: { w: 635, h: 476 },
  android: { w: 412, h: 915 },
  watch: { w: 176, h: 215 },
  "phone ios": { w: 393, h: 852 },
  "phone android": { w: 412, h: 915 },
};

// Prose blocks: they become the screen's note, not part of the artboard.
const ANNOTATION = new Set([
  "tierbar",
  "head",
  "label",
  "note",
  "kv",
  "anat",
  "anatomy",
  "rules",
  "cap",
  "spec",
  "dont",
  "el-ref",
]);

const CANVASES: Record<string, Canvas> = {
  web: {
    title: "put.io web",
    rows: [
      ["web-s", "Screens"],
      ["web-p", "Patterns"],
      ["web-c", "Components"],
    ],
    frames: (html) => {
      const shellAt = html.indexOf('<div class="preview-shell"');
      const body =
        shellAt >= 0
          ? innerOf(element(html, shellAt))
          : innerOf(element(html, html.indexOf("<body")));
      const kept = children(body).filter((el) => !classOf(el).some((c) => ANNOTATION.has(c)));
      return [{ markup: kept.join("\n"), frame: { w: 1280, h: 0, page: true } }];
    },
    css: "",
  },
  tv: {
    title: "put.io TV",
    rows: [
      ["tv-", "Web TV · Tizen · webOS"],
      ["roku-", "Roku"],
      ["tvos-", "tvOS"],
      ["androidtv-", "Android TV"],
    ],
    frames: deviceFrames(/<div class="(tvbox|artboard)(?: [^"]*)?"/g, () => ({ w: 1920, h: 1080 })),
    css: ".tvbox,.artboard{width:100% !important;height:100% !important;max-width:none !important;aspect-ratio:auto !important;border-radius:0 !important;box-shadow:none !important;margin:0 !important}.tvfit,.tv-fit{transform:none !important}",
  },
  mobile: {
    title: "put.io mobile",
    rows: [
      ["ios-s", "iOS · iPadOS"],
      ["android-s", "Android"],
      ["watchos-", "watchOS"],
      ["mobile-", "Phone onboarding"],
    ],
    frames: deviceFrames(
      /<div class="(iphone|ipad|android|watch|phone ios|phone android)"/g,
      (c) => DEVICE[c],
    ),
    css: ".iphone,.ipad,.android,.watch,.phone{width:100% !important;height:100% !important;padding:0 !important;margin:0 !important;box-shadow:none !important;border-radius:0 !important;zoom:1 !important}.viewport{border-radius:0 !important}",
  },
};

const KIT: Record<string, string> = {
  "../tokens.css": "tokens.css",
  "../components.css": "components.css",
  "../tv.css": "tv.css",
};
const kitFiles = [
  ...Object.values(KIT).map((name) => [`system/${name}`, name]),
  ...readdirSync(previewDir)
    .filter((f) => /^_.*\.css$/.test(f))
    .map((f) => [`system/preview/${f}`, f]),
];
const phosphorSrc = path.join(root, "node_modules/@phosphor-icons/web/src");
const PHOSPHOR = ["regular", "fill", "bold", "duotone", "thin"] as const;

const W_GAP = 80,
  TITLE_H = 360,
  NOTE_H = 560,
  ROW_GAP = 160;
const cards = readdirSync(previewDir)
  .filter((f) => f.endsWith(".html") && !f.startsWith("_"))
  .sort();
let total = 0;

for (const [id, canvas] of Object.entries(CANVASES)) {
  const out = path.join(root, "artifact/out", id);
  const project = path.join(out, "project");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(path.join(project, "kit"), { recursive: true });
  const images = notes.images[id] ?? {};
  const fonts = notes.fonts[id] ?? {};
  const uploads = (s: string, from: string): string =>
    s.replace(/\.\.\/assets\/([A-Za-z0-9._-]+)/g, (_, f: string) => {
      if (!images[f])
        throw new Error(`${from}: artifact/notes.json images.${id} has no system/assets/${f}`);
      return images[f];
    });

  for (const [src, name] of kitFiles)
    writeFileSync(path.join(project, "kit", name), uploads(read(src), src));
  writeFileSync(
    path.join(project, "kit/phosphor.css"),
    PHOSPHOR.map((weight) =>
      readFileSync(path.join(phosphorSrc, weight, "style.css"), "utf8").replace(
        /src:\s*url\("\.\/([^"]+\.woff2)"\)[^;]*;/,
        (_, f: string) => {
          if (!fonts[f]) throw new Error(`artifact/notes.json fonts.${id} has no ${f}`);
          return `src: url("${fonts[f]}") format("woff2");`;
        },
      ),
    ).join("\n"),
  );

  const boards: Record<string, Record<string, unknown>> = {};
  const order: string[] = [];
  const canvasNotes: Record<string, Record<string, unknown>> = {};
  let y = 0;

  for (const [prefix, rowTitle] of canvas.rows) {
    canvasNotes[`row-${prefix.replace(/-$/, "")}`] = {
      x: 0,
      y,
      text: rowTitle,
      kind: "title1",
      maxW: 6000,
    };
    const top = y + TITLE_H;
    let x = 0,
      rowH = 0;
    for (const file of cards.filter((f) => f.startsWith(prefix))) {
      const html = read(`system/preview/${file}`);
      const frames = canvas.frames(html);
      if (frames.length === 0) continue;
      const slug = file.replace(/\.html$/, "");
      const title = /<title>put\.io · ([^<]+)<\/title>/.exec(html)?.[1] ?? slug;
      const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
      const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]
        .map((m) =>
          KIT[m[1]] ? `kit/${KIT[m[1]]}` : m[1].startsWith("./_") ? `kit/${m[1].slice(2)}` : "",
        )
        .filter(Boolean);
      if (html.includes('src="https://unpkg.com/@phosphor-icons/web'))
        links.push("kit/phosphor.css");
      const label = /<div class="label"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1];
      const lead = /<div class="(?:note|head)"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1];
      const spec = [label && text(label), lead && firstSentence(text(lead))]
        .filter(Boolean)
        .join("\n");

      frames.forEach(({ markup, frame }, i) => {
        const name = `${slug}${frames.length > 1 ? `-${i + 1}` : ""}.dc.html`;
        const boardTitle = `${title}${frames.length > 1 ? ` (${i + 1})` : ""}`;
        const h = frame.page ? Math.max(720, (heights.get(slug) ?? 600) + 160) : frame.h;
        const rootStyle = frame.page
          ? "box-sizing: border-box; min-height: 100vh; padding: 48px; display: flex; flex-direction: column; gap: 24px"
          : `width: ${frame.w}px; height: ${frame.h}px; overflow: hidden; position: relative`;
        const body = uploads(markup, file).replace(/<script[\s\S]*?<\/script>/g, "");
        writeFileSync(
          path.join(project, name),
          `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(boardTitle)}</title>
<script src="./support.js"></script>
${links.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n")}
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap">
<style>
${styles}
html,body{margin:0;padding:0;background:var(--app-bg)}
:root,.dark{--font-sans:"GT America","Inter",sans-serif;--font-display:"GT America","Inter",sans-serif;--font-mono:"Berkeley Mono","JetBrains Mono",monospace}
${canvas.css}
</style>
</helmet>
<div class="dark" style="${rootStyle}; background: var(--app-bg); color: var(--text); font-family: var(--font-sans)">
${body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${frame.w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`,
        );
        boards[name] = {
          x,
          y: top,
          w: frame.w,
          h,
          title: boardTitle,
          ...(frame.page ? { expand: "fill" } : {}),
        };
        order.push(name);
        const cap = /<div class="cap">([\s\S]*?)<\/div>/.exec(
          html.slice(html.indexOf(markup) + markup.length).slice(0, 2000),
        )?.[1];
        const note = i === 0 ? spec : cap ? firstSentence(text(cap)) : "";
        if (note)
          canvasNotes[`n-${name.replace(/\.dc\.html$/, "")}`.slice(0, 40)] = {
            x,
            y: top + h + 40,
            text: note,
            w: Math.max(frame.w, 600),
            maxH: 300,
            size: frame.w >= 1280 ? "xl" : "m",
          };
        x += Math.max(frame.w, 600) + W_GAP;
        rowH = Math.max(rowH, h);
      });
    }
    y = top + rowH + NOTE_H + ROW_GAP;
  }

  // The canvas opens on the first artboard; the type reads that file as Main.dc.html.
  const main = order[0];
  writeFileSync(path.join(project, "Main.dc.html"), readFileSync(path.join(project, main)));
  rmSync(path.join(project, main));
  boards["Main.dc.html"] = boards[main];
  delete boards[main];
  order[0] = "Main.dc.html";

  const createdAt = notes.canvases[id]?.createdAt;
  if (!createdAt) throw new Error(`artifact/notes.json canvases.${id}: no createdAt`);
  const index = {
    v: 3,
    createdOnFiles: { v: 1, at: createdAt },
    title: canvas.title,
    launch: { view: "canvas" },
    pages: [],
    boards,
    order,
    notes: canvasNotes,
    designSystems: designSystem
      ? [
          {
            title: "put.io design",
            namespace: "putio",
            artifact: designSystem,
            version: null,
            copiedAt: createdAt,
          },
        ]
      : [],
  };
  writeFileSync(path.join(project, "canvas.json"), `${JSON.stringify(index, null, 2)}\n`);

  const files: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(path.relative(out, full));
    }
  };
  walk(project);
  files.sort();
  writeFileSync(path.join(out, "files.json"), `${JSON.stringify(files, null, 2)}\n`);
  total += order.length;
  console.log(`canvas ${id}: ${order.length} artboards`);
}
console.log(`canvases: ${total} artboards → artifact/out`);
