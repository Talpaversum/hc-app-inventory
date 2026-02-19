import Fastify from "fastify";
import cors from "@fastify/cors";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { loadConfig } from "./config.js";
import { verifyInstallationCompleteToken, verifyInstallerToken } from "./auth/installer-token.js";
import { registerLocationRoutes } from "./routes/locations.js";
import { registerAttributeTypeRoutes } from "./routes/attribute-types.js";
import { registerTemplateRoutes } from "./routes/templates.js";
import { registerItemRoutes } from "./routes/items.js";

const config = loadConfig();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

async function readManifestJson() {
  const manifestPath = path.resolve(process.cwd(), "manifest", "app-manifest.json");
  const raw = await readFile(manifestPath, "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

async function readMigrationSql(id: string): Promise<string | null> {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const indexRaw = await readFile(path.join(migrationsDir, "index.txt"), "utf-8");
  const names = indexRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => name.replace(/\.sql$/i, ""));

  if (!names.includes(id)) {
    return null;
  }

  return readFile(path.join(migrationsDir, `${id}.sql`), "utf-8");
}

async function listMigrations(): Promise<Array<{ id: string; sha256: string }>> {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const indexRaw = await readFile(path.join(migrationsDir, "index.txt"), "utf-8");
  const names = indexRaw.split("\n").map((line) => line.trim()).filter(Boolean);

  const items: Array<{ id: string; sha256: string }> = [];
  for (const name of names) {
    const id = name.replace(/\.sql$/i, "");
    const sql = await readFile(path.join(migrationsDir, name), "utf-8");
    const sha256 = createHash("sha256").update(sql).digest("hex");
    items.push({ id, sha256 });
  }
  return items;
}

app.get("/.well-known/hc-app-manifest.json", async (_request, reply) => {
  const manifest = await readManifestJson();
  reply.header("content-type", "application/json; charset=utf-8");
  return reply.send(manifest);
});

app.get("/manifest.json", async (_request, reply) => {
  const manifest = await readManifestJson();
  reply.header("content-type", "application/json; charset=utf-8");
  return reply.send(manifest);
});

app.get("/.well-known/hc/migrations", async (_request, reply) => {
  const items = await listMigrations();
  reply.header("content-type", "application/json; charset=utf-8");
  return reply.send({ version: 1, items });
});

app.get("/.well-known/hc/migrations/:id", async (request, reply) => {
  const id = String((request.params as { id: string }).id ?? "");
  const sql = await readMigrationSql(id);
  if (!sql) {
    return reply.code(404).send({ message: "migration not found" });
  }
  reply.header("content-type", "text/plain; charset=utf-8");
  return reply.send(sql);
});

app.post("/.well-known/hc/installation/complete", async (request, reply) => {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.code(401).send({ message: "missing installation bearer token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    await verifyInstallationCompleteToken(token, config);
  } catch {
    return reply.code(403).send({ message: "invalid installation token" });
  }

  return reply.send({ status: "ok" });
});

app.get("/internal/ui/plugin.js", async (request, reply) => {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return reply.code(401).send({ message: "missing installer bearer token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    await verifyInstallerToken(token, config);
  } catch {
    return reply.code(403).send({ message: "invalid installer token" });
  }

  const pluginPath = path.resolve(process.cwd(), "dist-plugin", "plugin.js");
  try {
    const content = await readFile(pluginPath);
    reply.header("content-type", "application/javascript; charset=utf-8");
    return reply.send(content);
  } catch {
    return reply.code(404).send({ message: "plugin not built" });
  }
});

await registerLocationRoutes(app);
await registerAttributeTypeRoutes(app);
await registerTemplateRoutes(app);
await registerItemRoutes(app);

app.listen({ port: config.PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
