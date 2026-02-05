import Fastify from "fastify";
import cors from "@fastify/cors";

import { loadConfig } from "./config.js";
import { registerLocationRoutes } from "./routes/locations.js";
import { registerAttributeTypeRoutes } from "./routes/attribute-types.js";
import { registerTemplateRoutes } from "./routes/templates.js";
import { registerItemRoutes } from "./routes/items.js";

const config = loadConfig();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok" }));

await registerLocationRoutes(app);
await registerAttributeTypeRoutes(app);
await registerTemplateRoutes(app);
await registerItemRoutes(app);

app.listen({ port: config.PORT, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
