import { spawn, type ChildProcess } from "node:child_process";
import process from "node:process";

const port = Number(process.env.PORT ?? String(4200 + Math.floor(Math.random() * 1000)));
const baseUrl = `http://127.0.0.1:${port}`;
const paths = ["/", "/design-system.html", "/design-system.html?theme=light", "/design-system-light.html", "/tokens.css", "/preview/web-shell.html"];
const brandYellowCss = "--yellow-solid: hsl(44.7, 97.9%, 63.1%)";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasExited(child: ChildProcess) {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
  if (hasExited(child)) return Promise.resolve(true);

  return new Promise((resolve) => {
    const finish = (exited: boolean) => {
      clearTimeout(timeout);
      child.off("exit", onExit);
      resolve(exited);
    };
    const onExit = () => finish(true);
    const timeout = setTimeout(() => finish(false), timeoutMs);
    child.once("exit", onExit);
  });
}

function ownedProcessExists(child: ChildProcess) {
  if (child.pid === undefined) return false;
  if (process.platform === "win32") return !hasExited(child);

  try {
    process.kill(-child.pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH") return false;
    if (code === "EPERM") return true;
    throw error;
  }
}

async function waitForOwnedProcessExit(child: ChildProcess, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (ownedProcessExists(child)) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) return false;
    await wait(Math.min(25, remainingMs));
  }

  if (hasExited(child)) return true;
  return waitForExit(child, Math.max(0, deadline - Date.now()));
}

function signalOwnedProcess(child: ChildProcess, signal: NodeJS.Signals) {
  if (child.pid === undefined) return;

  try {
    if (process.platform === "win32") {
      if (!hasExited(child)) child.kill(signal);
    } else {
      process.kill(-child.pid, signal);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
}

async function terminateOwnedProcess(child: ChildProcess) {
  if (!ownedProcessExists(child)) {
    if (!hasExited(child) && !(await waitForExit(child, 2_000))) {
      throw new Error(`Static server process ${child.pid ?? "unknown"} did not terminate`);
    }
    return;
  }

  signalOwnedProcess(child, "SIGTERM");
  if (await waitForOwnedProcessExit(child, 2_000)) return;

  signalOwnedProcess(child, "SIGKILL");
  if (!(await waitForOwnedProcessExit(child, 2_000))) {
    throw new Error(`Static server process ${child.pid ?? "unknown"} did not terminate`);
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
  let rejectInterruption: (error: Error) => void = () => undefined;
  const interruption = new Promise<never>((_resolve, reject) => {
    rejectInterruption = reject;
  });
  const interruptHandlers = new Map<NodeJS.Signals, () => void>();

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    const handler = () => {
      if (interruptedBy !== undefined) return;
      interruptedBy = signal;
      rejectInterruption(new Error(`Static smoke interrupted by ${signal}`));
    };
    interruptHandlers.set(signal, handler);
    process.on(signal, handler);
  }

  const child = spawn(process.execPath, ["scripts/serve-system.ts"], {
    detached: process.platform !== "win32",
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => logs.push(String(chunk)));
  child.stderr.on("data", (chunk) => logs.push(String(chunk)));
  child.on("error", (error) => logs.push(`${error.stack ?? error.message}\n`));
  child.on("exit", () => {
    exited = true;
  });

  let primaryError: unknown;
  let cleanupError: unknown;
  try {
    await Promise.race([
      (async () => {
        await waitForServer(10_000, () => exited, logs);
        await Promise.all(paths.map(smokePath));
        console.log(`Static smoke passed for ${paths.length} paths at ${baseUrl}`);
      })(),
      interruption,
    ]);
  } catch (error) {
    primaryError = error;
  } finally {
    try {
      await terminateOwnedProcess(child);
    } catch (error) {
      cleanupError = error;
    } finally {
      for (const [signal, handler] of interruptHandlers) {
        process.off(signal, handler);
      }
    }
  }

  if (interruptedBy !== undefined) {
    if (cleanupError !== undefined) {
      console.error(`Static server cleanup failed: ${String(cleanupError)}`);
    }
    process.exitCode = interruptedBy === "SIGINT" ? 130 : 143;
    return;
  }

  if (primaryError !== undefined) {
    if (cleanupError !== undefined) {
      console.error(`Static server cleanup failed: ${String(cleanupError)}`);
    }
    throw primaryError;
  }

  if (cleanupError !== undefined) throw cleanupError;
}

await main();
