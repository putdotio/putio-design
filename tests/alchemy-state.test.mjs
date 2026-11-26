import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("the Alchemy stack keeps its state in the S3 bucket the deploy role can reach", () => {
  const stack = readFileSync(new URL("../alchemy.run.ts", import.meta.url), "utf8");
  const states = stack.match(/AWS\.state\([^)]*\)/g) ?? [];

  assert.deepEqual(states, ['AWS.state({ backend: "s3", name: "putio-frontend" })']);
});
