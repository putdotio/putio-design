import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const importConfig = (port) =>
  spawnSync(process.execPath, ["--input-type=module", "--eval", "await import('./playwright.config.ts')"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, PUTIO_DESIGN_PLAYWRIGHT_PORT: port },
  });

for (const port of ["1", "65535"]) {
  test(`Playwright accepts port ${port}`, () => {
    const result = importConfig(port);
    assert.equal(result.status, 0, result.stderr);
  });
}

for (const port of ["0", "65536", "1.5", " 4173", "+4173", "-4173", "invalid"]) {
  test(`Playwright rejects port ${JSON.stringify(port)}`, () => {
    const result = importConfig(port);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /PUTIO_DESIGN_PLAYWRIGHT_PORT must be an integer between 1 and 65535/);
  });
}
