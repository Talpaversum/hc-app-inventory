import Fastify from "fastify";
import cors from "@fastify/cors";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { loadConfig } from "./config.js";
import { verifyInstallerToken } from "./auth/installer-token.js";
import { registerLocationRoutes } from "./routes/locations.js";
import { registerAttributeTypeRoutes } from "./routes/attribute-types.js";
import { registerTemplateRoutes } from "./routes/templates.js";
import { registerItemRoutes } from "./routes/items.js";

const config = loadConfig();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

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
