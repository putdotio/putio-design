import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const importConfig = (port) => {
  const env = { ...process.env };
  if (port === undefined) delete env.PUTIO_DESIGN_PLAYWRIGHT_PORT;
  else env.PUTIO_DESIGN_PLAYWRIGHT_PORT = port;

  return spawnSync(process.execPath, [
    "--input-type=module",
    "--eval",
    "const { default: config } = await import('./playwright.config.ts'); console.log(JSON.stringify({ baseURL: config.use.baseURL, serverPort: config.webServer.env.PORT, serverURL: config.webServer.url }))",
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    env,
  });
};

const resolvedConfig = (port) => {
  const result = importConfig(port);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

test("Playwright defaults to port 4173", () => {
  assert.deepEqual(resolvedConfig(undefined), {
    baseURL: "http://127.0.0.1:4173",
    serverPort: "4173",
    serverURL: "http://127.0.0.1:4173/tokens.css",
  });
});

test("Playwright wires a valid port override through the browser and server config", () => {
  assert.deepEqual(resolvedConfig("4174"), {
    baseURL: "http://127.0.0.1:4174",
    serverPort: "4174",
    serverURL: "http://127.0.0.1:4174/tokens.css",
  });
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
