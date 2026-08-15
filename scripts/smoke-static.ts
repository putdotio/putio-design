import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import process from "node:process";

const port = Number(process.env.PORT ?? String(4200 + Math.floor(Math.random() * 1000)));
const baseUrl = `http://127.0.0.1:${port}`;
const paths = ["/", "/design-system.html", "/design-system.html?theme=light", "/design-system-light.html", "/tokens.css", "/preview/web-shell.html"];
const brandYellowCss = "--yellow-solid: hsl(44.7, 97.9%, 63.1%)";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function signalAndWait(child: ChildProcess, signal: NodeJS.Signals) {
  if (child.exitCode !== null || child.signalCode !== null) return true;
  child.kill(signal);
  return Promise.race([
    once(child, "exit").then(() => true),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 2_000).unref()),
  ]);
}
async function stopServer(child: ChildProcess) {
  if (await signalAndWait(child, "SIGTERM")) return;
  if (!(await signalAndWait(child, "SIGKILL"))) {
    throw new Error("Static server process " + (child.pid ?? "unknown") + " did not terminate");
  }
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
  const logs: string[] = [];
  let exited = false;
  let interruptedBy: NodeJS.Signals | undefined;
  let resolveInterruption: () => void = () => undefined;
  const interruption = new Promise<void>((resolve) => {
    resolveInterruption = resolve;
  });
  const interruptHandlers = new Map<NodeJS.Signals, () => void>();
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    const handler = () => {
      if (interruptedBy !== undefined) return;
      interruptedBy = signal;
      resolveInterruption();
    };
    interruptHandlers.set(signal, handler);
    process.on(signal, handler);
  }
  const child = spawn(process.execPath, ["scripts/serve-system.ts"], {
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const childError = once(child, "error").then(([error]) => Promise.reject(error));

  child.stdout.on("data", (chunk) => logs.push(String(chunk)));
  child.stderr.on("data", (chunk) => logs.push(String(chunk)));
  child.on("exit", () => {
    exited = true;
  });

  let primaryError: unknown;
  try {
    await Promise.race([
      (async () => {
        await waitForServer(10_000, () => exited, logs);
        await Promise.all(paths.map(smokePath));
        console.log(`Static smoke passed for ${paths.length} paths at ${baseUrl}`);
      })(),
      interruption,
      childError,
    ]);
  } catch (error) {
    primaryError = error;
  } finally {
    try {
      await stopServer(child);
    } catch (error) {
      if (interruptedBy === undefined) throw error;
      console.error(`Static server cleanup failed: ${String(error)}`);
    } finally {
      for (const [signal, handler] of interruptHandlers) {
        process.off(signal, handler);
      }
    }
  }

  if (interruptedBy !== undefined) {
    process.exitCode = interruptedBy === "SIGINT" ? 130 : 143;
  } else if (primaryError !== undefined) throw primaryError;
}

await main();
