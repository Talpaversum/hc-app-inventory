import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const host = process.env.RUNTIME_PACKAGE_HOST ?? "0.0.0.0";
const port = Number.parseInt(process.env.RUNTIME_PACKAGE_PORT ?? "4020", 10);
const outputDir = path.resolve(
  import.meta.dirname,
  "..",
  "dist",
  "runtime-package",
);
const routes = new Map([
  ["/hc-app-inventory-runtime.tar.gz", "hc-app-inventory-runtime.tar.gz"],
  [
    "/hc-app-inventory-runtime.tar.gz.sha256",
    "hc-app-inventory-runtime.tar.gz.sha256",
  ],
  ["/.well-known/hc/app-catalog.json", "app-catalog.json"],
  ["/.well-known/hc-app-manifest.json", "app-manifest.json"],
  ["/manifest.json", "app-manifest.json"],
]);

const server = http.createServer(async (request, response) => {
  const pathname = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`,
  ).pathname;
  const fileName = routes.get(pathname);
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    fileName === undefined
  ) {
    response.writeHead(404).end("Not found\n");
    return;
  }

  const filePath = path.join(outputDir, fileName);
  try {
    const fileStat = await stat(filePath);
    response.writeHead(200, {
      "content-length": fileStat.size,
      "content-type": fileName.endsWith(".tar.gz")
        ? "application/gzip"
        : fileName.endsWith(".sha256")
          ? "text/plain; charset=utf-8"
          : "application/json; charset=utf-8",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Build the runtime package first\n");
  }
});

server.listen(port, host, () => {
  console.info(`Runtime package server listening on http://${host}:${port}`);
});
