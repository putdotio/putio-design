import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const systemDir = path.join(root, "system");
const port = Number(process.env.PORT ?? "4173");
const host = process.env.HOST ?? "127.0.0.1";

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function resolveRequestPath(url: string | undefined): string {
  const pathname = decodeURIComponent(new URL(url ?? "/", `http://${host}:${port}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.normalize(path.join(systemDir, requested));

  if (!resolved.startsWith(systemDir + path.sep) && resolved !== systemDir) {
    throw new Error("Request escaped system directory");
  }

  return resolved;
}

function sendNotFound(response: ServerResponse) {
  if (response.writableEnded) return;
  if (response.headersSent) {
    response.destroy();
    return;
  }

  response.statusCode = 404;
  response.setHeader("content-type", "text/plain; charset=utf-8");
  response.end("Not found\n");
}

const server = createServer(async (request, response) => {
  try {
    let file = resolveRequestPath(request.url);
    const info = await stat(file);
    if (info.isDirectory()) {
      file = path.join(file, "index.html");
    }

    const extension = path.extname(file);
    response.setHeader("content-type", mimeTypes[extension] ?? "application/octet-stream");
    const stream = createReadStream(file);
    stream.on("error", () => sendNotFound(response));
    stream.pipe(response);
  } catch {
    sendNotFound(response);
  }
});

server.listen(port, host, () => {
  console.log(`putio-design system server ready at http://${host}:${port}`);
});

process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());

export const __filename = fileURLToPath(import.meta.url);
