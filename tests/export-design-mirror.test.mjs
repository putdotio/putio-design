import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = process.cwd();

test("mirror refreshes TV literals and reports missing TV tokens", async () => {
  const fixtureDir = await mkdtemp(path.join(tmpdir(), "putio-design-mirror-"));
  const templatePath = path.join(fixtureDir, "tokens.json");
  const outDir = path.join(fixtureDir, "out");
  const template = {
    yellow: {
      $extensions: { "putio.prefix": "yellow" },
      solid: { $type: "color", $value: "hsl(44.7, 97.9%, 63.1%)" },
    },
    tv: {
      $extensions: { "putio.prefix": "tv" },
      radius: { $type: "dimension", $value: "99px" },
    },
  };

  try {
    await writeFile(templatePath, `${JSON.stringify(template, null, 2)}\n`);
    const result = spawnSync(
      process.execPath,
      [
        "scripts/export-design-mirror.ts",
        path.relative(root, templatePath),
        path.relative(root, outDir),
      ],
      { cwd: root, encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    const output = JSON.parse(await readFile(path.join(outDir, "tokens.json"), "utf8"));
    assert.equal(output.tv.radius.$value, "12px");
    assert.match(result.stderr, /repo token missing from mirror template: --tv-text-heading/);
  } finally {
    await rm(fixtureDir, { recursive: true, force: true });
  }
});
