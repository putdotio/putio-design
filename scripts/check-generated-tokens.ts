import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const generatedRoots = ["dist", "system/tokens.css"] as const;

async function maybeStat(file: string) {
  try {
    return await stat(file);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function walk(file: string): Promise<string[]> {
  const info = await maybeStat(file);
  if (!info) return [];
  if (info.isFile()) return [file];
  if (!info.isDirectory()) return [];

  const entries = await readdir(file, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(file, entry.name);
      if (entry.isDirectory()) return walk(full);
      if (entry.isFile()) return [full];
      return [];
    }),
  );
  return nested.flat();
}

async function snapshotGeneratedFiles(): Promise<Map<string, string>> {
  const files = (
    await Promise.all(generatedRoots.map((generatedRoot) => walk(path.join(root, generatedRoot))))
  )
    .flat()
    .sort();

  const entries = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(file);
      const hash = createHash("sha256").update(contents).digest("hex");
      return [path.relative(root, file), hash] as const;
    }),
  );

  return new Map(entries);
}

function changedFiles(before: Map<string, string>, after: Map<string, string>): string[] {
  const names = new Set([...before.keys(), ...after.keys()]);
  return [...names].filter((name) => before.get(name) !== after.get(name)).sort();
}

async function runTokenBuild(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/build-tokens.ts"], {
      cwd: root,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`scripts/build-tokens.ts exited with ${code ?? "unknown status"}`));
    });
  });
}

const before = await snapshotGeneratedFiles();
await runTokenBuild();
const after = await snapshotGeneratedFiles();
const changed = changedFiles(before, after);

if (changed.length > 0) {
  console.error("Generated token artifacts were out of date. Commit the output of pnpm tokens:build.");
  for (const file of changed) {
    console.error(`- ${file}`);
  }
  process.exitCode = 1;
} else {
  console.log("Generated token artifacts are up to date");
}
