import { spawn } from "node:child_process";
import process from "node:process";

const port = Number(process.env.PORT ?? String(4200 + Math.floor(Math.random() * 1000)));
const baseUrl = `http://127.0.0.1:${port}`;
const paths = ["/", "/design-system.html", "/design-system.html?theme=light", "/design-system-light.html", "/tokens.css", "/preview/web-shell.html"];
const brandYellowCss = "--yellow-solid: hsl(44.7, 97.9%, 63.1%)";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs: number, didExit: () => boolean, logs: string[]) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (didExit()) {
      throw new Error(`Static server exited before readiness:\n${logs.join("")}`);
    }
    try {
      const response = await fetch(`${baseUrl}/tokens.css`);
      if (response.ok) return;
    } catch {
      await wait(200);
    }
  }
  throw new Error(`Static server did not become ready at ${baseUrl}`);
}

async function smokePath(pathname: string) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }

  const text = await response.text();
  const cleanPathname = pathname.split("?", 1)[0] ?? pathname;
  if (cleanPathname.endsWith(".html") || cleanPathname === "/") {
    if (!text.includes("put.io")) {
      throw new Error(`${pathname} did not include the expected put.io marker`);
    }
  }

  if (pathname.endsWith(".css") && !text.includes(brandYellowCss)) {
    throw new Error(`${pathname} did not include generated brand yellow token`);
  }
}

async function main() {
  const child = spawn(process.execPath, ["scripts/serve-system.ts"], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs: string[] = [];
  let exited = false;
  child.stdout.on("data", (chunk) => logs.push(String(chunk)));
  child.stderr.on("data", (chunk) => logs.push(String(chunk)));
  child.on("exit", () => {
    exited = true;
  });

  try {
    await waitForServer(10_000, () => exited, logs);
    await Promise.all(paths.map(smokePath));
    console.log(`Static smoke passed for ${paths.length} paths at ${baseUrl}`);
  } finally {
    child.kill("SIGTERM");
    await wait(100);
    if (child.exitCode && child.exitCode !== 0) {
      console.error(logs.join(""));
    }
  }
}

await main();
